# network_monitor.py
from scapy.all import sniff, IP, TCP, UDP
import pandas as pd
import numpy as np
from collections import defaultdict
import threading
import time
from datetime import datetime

class NetworkMonitor:
    def __init__(self, callback_function, window_size=60):
        self.callback = callback_function
        self.window_size = window_size  # Time window in seconds
        self.traffic_stats = defaultdict(lambda: defaultdict(int))
        self.lock = threading.Lock()
        self.is_running = True

    def start_monitoring(self):
        # Start packet capture in a separate thread
        self.capture_thread = threading.Thread(target=self._capture_packets)
        self.capture_thread.daemon = True
        self.capture_thread.start()

        # Start analysis in a separate thread
        self.analysis_thread = threading.Thread(target=self._analyze_traffic)
        self.analysis_thread.daemon = True
        self.analysis_thread.start()

    def stop_monitoring(self):
        self.is_running = False
        self.capture_thread.join()
        self.analysis_thread.join()

    def _capture_packets(self):
        try:
            sniff(prn=self._process_packet, store=False)
        except Exception as e:
            print(f"Error in packet capture: {str(e)}")

    def _process_packet(self, packet):
        if not self.is_running:
            return

        if IP in packet:
            with self.lock:
                src_ip = packet[IP].src
                current_time = int(time.time())
                
                # Basic packet features
                self.traffic_stats[src_ip]['packet_count'] += 1
                self.traffic_stats[src_ip]['last_seen'] = current_time
                
                # Size-based features
                self.traffic_stats[src_ip]['total_bytes'] += len(packet)
                
                # Protocol-based features
                if TCP in packet:
                    self.traffic_stats[src_ip]['tcp_count'] += 1
                    if packet[TCP].flags.S:  # SYN flag
                        self.traffic_stats[src_ip]['syn_count'] += 1
                elif UDP in packet:
                    self.traffic_stats[src_ip]['udp_count'] += 1

    def _analyze_traffic(self):
        while self.is_running:
            time.sleep(self.window_size)
            
            with self.lock:
                current_time = int(time.time())
                features_list = []
                
                for ip, stats in self.traffic_stats.items():
                    if current_time - stats['last_seen'] <= self.window_size:
                        # Calculate features
                        features = self._extract_features(stats)
                        features_list.append((ip, features))
                
                # Clear old statistics
                self.traffic_stats.clear()
            
            # Process each IP's features
            for ip, features in features_list:
                self.callback(ip, features)

    def _extract_features(self, stats):
        # Convert raw statistics into features used by the model
        features = [
            stats['packet_count'],
            stats['total_bytes'] / max(stats['packet_count'], 1),  # Average packet size
            stats['tcp_count'] / max(stats['packet_count'], 1),    # TCP ratio
            stats['udp_count'] / max(stats['packet_count'], 1),    # UDP ratio
            stats['syn_count'] / max(stats['tcp_count'], 1),       # SYN ratio
            stats['packet_count'] / self.window_size,              # Packet rate
            stats['total_bytes'] / self.window_size                # Byte rate
        ]
        return features
