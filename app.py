
# app.py
from flask import Flask, request, jsonify, render_template
from flask_socketio import SocketIO, emit
import numpy as np
import joblib
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app)

# Email configuration
SENDER_EMAIL = "admin@gmail.com"
RECEIVER_EMAIL = "receiver@gmail.com"
#for google accounts ,goto accounts>security>two factor authentication>in-app passwords
EMAIL_PASSWORD = "in-app-password"

# Load the model and scaler
try:
    print("Loading model and scaler...")
    model = joblib.load('anomaly_model.pkl')
    scaler = joblib.load('anomaly_model_scaler.pkl')
    print("Model and scaler loaded successfully!")
except Exception as e:
    print(f"Error loading model or scaler: {str(e)}")
    exit(1)

def send_email_alert(ip, details):
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
        
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
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
            
        input_data = np.array(data['features']).reshape(1, -1)
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

if __name__ == '__main__':
    socketio.run(app, debug=True)
