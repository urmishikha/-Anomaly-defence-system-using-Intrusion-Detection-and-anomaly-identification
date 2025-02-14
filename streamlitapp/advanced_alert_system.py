import pandas as pd
import numpy as np
import streamlit as st
import plotly.graph_objects as go
import torch
import torch.nn as nn
import yaml
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from collections import deque
from datetime import datetime
import threading
import time
import random


class DeepAnomalyDetector(nn.Module):
    def __init__(self, input_size):
        super(DeepAnomalyDetector, self).__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 32)
        )
        self.decoder = nn.Sequential(
            nn.Linear(32, 64),
            nn.ReLU(),
            nn.Linear(64, 128),
            nn.ReLU(),
            nn.Linear(128, input_size)
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded


class AnomalySimulator:
    def __init__(self):
        self.data_history = deque(maxlen=1000)

    def generate_data(self):
        timestamp = datetime.now()
        normal_traffic = np.random.normal(loc=50, scale=15)
        anomaly = random.choice([True, False, False, False])  # 25% chance of anomaly
        anomaly_value = np.random.uniform(100, 200) if anomaly else normal_traffic
        return {
            'timestamp': timestamp,
            'traffic_value': anomaly_value,
            'anomaly': anomaly
        }

    def simulate(self):
        while True:
            data_point = self.generate_data()
            self.data_history.append(data_point)
            time.sleep(1)


class Visualization:
    def __init__(self):
        self.history = deque(maxlen=1000)

    def update_data(self, data):
        self.history.append(data)

    def plot_traffic(self):
        df = pd.DataFrame(self.history)
        fig = go.Figure()
        if not df.empty:
            fig.add_trace(go.Scatter(
                x=df['timestamp'],
                y=df['traffic_value'],
                mode='lines+markers',
                marker=dict(color=['red' if x else 'blue' for x in df['anomaly']]),
                name='Traffic Volume'
            ))
        fig.update_layout(title='Network Traffic', xaxis_title='Time', yaxis_title='Traffic Value')
        return fig


class AlertSystem:
    def __init__(self, config_path='alert_config.yaml'):
        self.load_config(config_path)

    def load_config(self, config_path):
        with open(config_path, 'r') as file:
            self.config = yaml.safe_load(file)

    def send_alert(self, anomaly_data):
        msg = MIMEMultipart()
        msg['Subject'] = "Anomaly Alert!"
        msg['From'] = self.config['email']['from_addr']
        msg['To'] = ', '.join(self.config['email']['recipients'])
        body = f"Anomaly detected at {anomaly_data['timestamp']} with value {anomaly_data['traffic_value']}"
        msg.attach(MIMEText(body, 'plain'))
        with smtplib.SMTP(self.config['email']['smtp_server'], self.config['email']['smtp_port']) as server:
            server.starttls()
            server.login(self.config['email']['username'], self.config['email']['password'])
            server.send_message(msg)


class SecuritySystem:
    def __init__(self):
        self.simulator = AnomalySimulator()
        self.visualizer = Visualization()
        self.alert_system = AlertSystem()
        self.is_running = False

    def start_monitoring(self):
        self.is_running = True
        while self.is_running:
            data = self.simulator.generate_data()
            self.visualizer.update_data(data)
            if data['anomaly']:
                self.alert_system.send_alert(data)
            time.sleep(1)

    def stop_monitoring(self):
        self.is_running = False


# Streamlit UI
st.title("Real-Time Anomaly Detection")
security_system = SecuritySystem()

def start_system():
    thread = threading.Thread(target=security_system.start_monitoring)
    thread.start()

if st.button("Start Monitoring"):
    start_system()
    st.success("Monitoring started")

if st.button("Stop Monitoring"):
    security_system.stop_monitoring()
    st.warning("Monitoring stopped")

st.subheader("Network Traffic Visualization")
st.plotly_chart(security_system.visualizer.plot_traffic())
