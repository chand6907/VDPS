// Traffic Light Functions
function updateTrafficLight() {
    fetch('/traffic-light')
        .then(response => response.json())
        .then(data => {
            const lights = {
                red: document.getElementById('red-light'),
                yellow: document.getElementById('yellow-light'),
                green: document.getElementById('green-light')
            };
            lights.red.style.backgroundColor = data.state === 'red' ? 'red' : '#333';
            lights.yellow.style.backgroundColor = data.state === 'yellow' ? 'yellow' : '#333';
            lights.green.style.backgroundColor = data.state === 'green' ? 'green' : '#333';
        })
        .catch(error => {
            console.error('Error updating traffic light:', error);
        });
}

// Update traffic light every second
setInterval(updateTrafficLight, 1000);

// VDPS Demo Functions
const startButton = document.getElementById('start-detection');
const simulateButton = document.getElementById('simulate-vehicle');
const alertButton = document.getElementById('toggle-alert');
const stopButton = document.getElementById('stop-detection');
const videoPlaceholder = document.getElementById('video-placeholder');
const videoFeed = document.getElementById('video-feed');
const canvas = document.getElementById('canvas-output');
const logContainer = document.getElementById('log-container');
const vehiclesCount = document.getElementById('vehicles-count');
const averageSpeed = document.getElementById('average-speed');
const alertStatus = document.getElementById('alert-status');

// Status cards
const vehiclesCard = document.getElementById('status-vehicles');
const speedCard = document.getElementById('status-speed');
const alertCard = document.getElementById('status-alert');

// Add log entry function
function addLogEntry(message, isAlert = false) {
    const entry = document.createElement('div');
    entry.className = isAlert ? 'log-entry alert' : 'log-entry';
    
    // Add timestamp
    const now = new Date();
    const timestamp = `[${now.toLocaleTimeString()}]`;
    
    entry.textContent = `${timestamp} ${message}`;
    logContainer.appendChild(entry);
    
    // Auto-scroll to bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Update detection status
function updateDetectionStatus() {
    fetch('/detection-status')
        .then(response => response.json())
        .then(data => {
            vehiclesCount.textContent = data.vehicles_detected;
            averageSpeed.textContent = `${data.average_speed} km/h`;
            alertStatus.textContent = data.alert_status;
            
            // Update status card classes
            if (data.is_running) {
                vehiclesCard.className = 'status-card status-active';
                speedCard.className = 'status-card status-active';
                
                if (data.alert_status === 'HAZARD DETECTED') {
                    alertCard.className = 'status-card status-alert';
                } else if (data.alert_status === 'Active') {
                    alertCard.className = 'status-card status-active';
                } else {
                    alertCard.className = 'status-card status-inactive';
                }
            } else {
                vehiclesCard.className = 'status-card status-inactive';
                speedCard.className = 'status-card status-inactive';
                alertCard.className = 'status-card status-inactive';
            }
        })
        .catch(error => {
            console.error('Error updating detection status:', error);
        });
}

// Start detection function
function startDetection() {
    fetch('/start-detection')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Hide placeholder and show video (simulated)
                videoPlaceholder.style.display = 'none';
                
                // Simulate a video feed with a canvas
                canvas.style.display = 'block';
                const ctx = canvas.getContext('2d');
                canvas.width = canvas.clientWidth;
                canvas.height = canvas.clientHeight;
                
                // Draw a simulated road background
                ctx.fillStyle = '#777';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw road markings
                ctx.strokeStyle = 'white';
                ctx.setLineDash([20, 20]);
                ctx.beginPath();
                ctx.moveTo(canvas.width / 2, 0);
                ctx.lineTo(canvas.width / 2, canvas.height);
                ctx.stroke();
                
                // Update UI
                startButton.disabled = true;
                simulateButton.disabled = false;
                alertButton.disabled = false;
                stopButton.disabled = false;
                
                addLogEntry('Detection started successfully');
                
                // Start regular status updates
                statusInterval = setInterval(updateDetectionStatus, 1000);
            }
        })
        .catch(error => {
            console.error('Error starting detection:', error);
            addLogEntry('Error starting detection', true);
        });
}

// Stop detection function
function stopDetection() {
    fetch('/stop-detection')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Reset UI
                videoPlaceholder.style.display = 'flex';
                canvas.style.display = 'none';
                
                startButton.disabled = false;
                simulateButton.disabled = true;
                alertButton.disabled = true;
                stopButton.disabled = true;
                
                addLogEntry('Detection stopped');
                
                // Stop status updates
                clearInterval(statusInterval);
                updateDetectionStatus(); // One final update
            }
        })
        .catch(error => {
            console.error('Error stopping detection:', error);
            addLogEntry('Error stopping detection', true);
        });
}

// Simulate vehicle function
function simulateVehicle() {
    fetch('/simulate-vehicle')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                // Simulate a vehicle visually
                const ctx = canvas.getContext('2d');
                const carX = Math.random() * (canvas.width - 60) + 30;
                const carY = Math.random() * (canvas.height - 100) + 50;
                
                // Draw a car shape
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(carX, carY, 40, 60);
                
                addLogEntry('Vehicle detected');
                
                // Vehicle will fade out after 2 seconds
                setTimeout(() => {
                    if (canvas.style.display !== 'none') {
                        // Redraw background
                        ctx.fillStyle = '#777';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Redraw road markings
                        ctx.strokeStyle = 'white';
                        ctx.setLineDash([20, 20]);
                        ctx.beginPath();
                        ctx.moveTo(canvas.width / 2, 0);
                        ctx.lineTo(canvas.width / 2, canvas.height);
                        ctx.stroke();
                    }
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error simulating vehicle:', error);
            addLogEntry('Error simulating vehicle', true);
        });
}

// Toggle alert function
function toggleAlert() {
    fetch('/toggle-alert')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                updateDetectionStatus();
                addLogEntry('Alert status changed', true);
            }
        })
        .catch(error => {
            console.error('Error toggling alert:', error);
            addLogEntry('Error toggling alert', true);
        });
}

// Add event listeners
startButton.addEventListener('click', startDetection);
stopButton.addEventListener('click', stopDetection);
simulateButton.addEventListener('click', simulateVehicle);
alertButton.addEventListener('click', toggleAlert);

// Initial traffic light update
updateTrafficLight();