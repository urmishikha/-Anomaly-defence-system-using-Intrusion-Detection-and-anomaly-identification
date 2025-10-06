
# app.py
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
import numpy as np
import joblib
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'change-me')
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

"""Email configuration via environment variables.
Set SENDER_EMAIL, RECEIVER_EMAIL and EMAIL_PASSWORD to enable email alerts.
Optional SMTP_HOST and SMTP_PORT may also be provided (defaults to Gmail).
"""
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))

EXPECTED_FEATURES = int(os.getenv("EXPECTED_FEATURES", "7"))

def train_fallback_model(n_features: int):
    """Train a lightweight IsolationForest on synthetic data as a fallback.

    This avoids startup failures when pre-trained artifacts are missing.
    """
    rng = np.random.default_rng(42)
    synthetic = rng.normal(loc=0.0, scale=1.0, size=(2000, n_features))
    scaler_local = StandardScaler().fit(synthetic)
    X_scaled = scaler_local.transform(synthetic)
    model_local = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42,
    ).fit(X_scaled)
    try:
        joblib.dump(model_local, 'anomaly_model.pkl')
        joblib.dump(scaler_local, 'anomaly_model_scaler.pkl')
    except Exception:
        # Ignore persistence failures in readonly environments
        pass
    return model_local, scaler_local


# Load the model and scaler, with fallback training if artifacts are missing
try:
    print("Loading model and scaler...")
    model = joblib.load('anomaly_model.pkl')
    scaler = joblib.load('anomaly_model_scaler.pkl')
    print("Model and scaler loaded successfully!")
except Exception as e:
    print(f"Model artifacts missing or invalid, training fallback model: {str(e)}")
    model, scaler = train_fallback_model(EXPECTED_FEATURES)

def email_configured() -> bool:
    return bool(SENDER_EMAIL and RECEIVER_EMAIL and EMAIL_PASSWORD)


def send_email_alert(ip, details):
    if not email_configured():
        return False
    try:
        subject = "⚠ Network Intrusion Alert ⚠"
        body = f"""
        ⚠ SECURITY ALERT ⚠
        
        Anomalous network activity detected!
        
        Details:
        - Source IP: {ip}
        - Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        - Anomaly Score: {details.get('prediction_score', 'N/A')}
        - Feature Values: {details.get('features', 'N/A')}
        
        Please investigate immediately.
        
        This is an automated alert from your Network Anomaly Detection System.
        """
        
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = SENDER_EMAIL
        msg['To'] = RECEIVER_EMAIL
        
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, EMAIL_PASSWORD)
            server.sendmail(SENDER_EMAIL, RECEIVER_EMAIL, msg.as_string())
            
        print(f"Alert email sent to {RECEIVER_EMAIL}")
        return True
    except Exception as e:
        print(f"Failed to send email alert: {str(e)}")
        return False

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect_anomaly():
    try:
        data = request.json
        if not data or 'features' not in data:
            return jsonify({'error': 'Invalid input data'}), 400
        
        # Get IP address from request
        ip_address = request.remote_addr
            
        # Validate and parse features
        try:
            features = [float(x) for x in data['features']]
        except Exception:
            return jsonify({'error': 'Features must be numeric'}), 400

        if len(features) != EXPECTED_FEATURES:
            return jsonify({'error': f'Expected {EXPECTED_FEATURES} features, got {len(features)}'}), 400

        input_data = np.array(features, dtype=float).reshape(1, -1)
        input_data = scaler.transform(input_data)
        prediction = model.predict(input_data)
        prediction_score = float(model.score_samples(input_data)[0])
        is_attack = int(prediction[0] == -1)
        
        # If anomaly is detected, send email and socket notification
        if is_attack:
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            details = {
                'features': data['features'],
                'prediction_score': prediction_score
            }
            
            # Send email alert
            email_sent = send_email_alert(ip_address, details)
            
            # Prepare and send socket notification
            notification = {
                'timestamp': timestamp,
                'message': 'ALERT: Anomalous network activity detected!',
                'severity': 'high',
                'details': details,
                'ip_address': ip_address,
                'email_sent': email_sent
            }
            socketio.emit('anomaly_alert', notification)
        
        return jsonify({
            'anomaly_detected': is_attack,
            'ip_address': ip_address,
            'prediction_score': prediction_score
        })
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/healthz')
def healthcheck():
    return jsonify({
        'status': 'ok',
        'model_loaded': True,
        'expected_features': EXPECTED_FEATURES
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    debug = os.environ.get('FLASK_DEBUG', '0') == '1'
    socketio.run(app, host='0.0.0.0', port=port, debug=debug)
