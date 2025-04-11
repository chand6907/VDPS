from flask import Flask, jsonify, render_template, send_from_directory
import time
from threading import Thread
import os
import random

app = Flask(__name__)

# Traffic light states
traffic_light_state = 'red'

# Vehicle detection simulation data
detection_data = {
    'vehicles_detected': 0,
    'average_speed': 0,
    'alert_status': 'Inactive',
    'is_running': False
}

@app.route('/traffic-light')
def get_traffic_light():
    global traffic_light_state
    return jsonify({'state': traffic_light_state})

@app.route('/detection-status')
def get_detection_status():
    return jsonify(detection_data)

@app.route('/start-detection')
def start_detection():
    detection_data['is_running'] = True
    detection_data['vehicles_detected'] = 0
    detection_data['average_speed'] = 0
    detection_data['alert_status'] = 'Active'
    return jsonify({'status': 'success', 'message': 'Detection started'})

@app.route('/stop-detection')
def stop_detection():
    detection_data['is_running'] = False
    detection_data['alert_status'] = 'Inactive'
    return jsonify({'status': 'success', 'message': 'Detection stopped'})

@app.route('/simulate-vehicle')
def simulate_vehicle():
    if detection_data['is_running']:
        detection_data['vehicles_detected'] += 1
        detection_data['average_speed'] = random.randint(30, 80)
        return jsonify({'status': 'success', 'message': 'Vehicle simulated'})
    return jsonify({'status': 'error', 'message': 'Detection not running'})

@app.route('/toggle-alert')
def toggle_alert():
    if detection_data['is_running']:
        if detection_data['alert_status'] == 'Active':
            detection_data['alert_status'] = 'HAZARD DETECTED'
        else:
            detection_data['alert_status'] = 'Active'
        return jsonify({'status': 'success', 'message': 'Alert toggled'})
    return jsonify({'status': 'error', 'message': 'Detection not running'})

def change_traffic_light():
    global traffic_light_state
    while True:
        if traffic_light_state == 'red':
            traffic_light_state = 'green'
        elif traffic_light_state == 'green':
            traffic_light_state = 'yellow'
        else:
            traffic_light_state = 'red'
        time.sleep(5)  # Change every 5 seconds

@app.route('/')
def index():
    return render_template('vdps.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    Thread(target=change_traffic_light).start()  # Start the traffic light change in a separate thread
    app.run(debug=True, host='0.0.0.0', port=5000)