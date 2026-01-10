/**
 * IoT Data Generator
 * Simulates real-time IoT sensor data for exhibition/demo purposes
 * 
 * This generates sample sensor data and sends it to the backend API
 * for live demonstration without requiring physical sensors.
 */

const http = require('http');

// Configuration
const API_URL = 'http://localhost:3001/api/iot-data'; // Updated to port 3001
const INTERVAL_MS = 1000; // 1 second
const DEVICE_COUNT = 5; // Number of simulated IoT devices

// Device IDs
const deviceIds = Array.from({ length: DEVICE_COUNT }, (_, i) => `iot-device-${i + 1}`);

/**
 * Generate random IoT sensor data
 */
function generateIoTData(deviceId) {
    const timestamp = new Date().toISOString();
    
    return {
        deviceId: deviceId,
        temperature: parseFloat((20 + Math.random() * 25).toFixed(2)), // 20-45°C
        cpuLoad: parseFloat((Math.random() * 100).toFixed(2)), // 0-100%
        dataSize: Math.floor(100 + Math.random() * 400), // 100-500 KB
        timestamp: timestamp,
        batteryLevel: parseFloat((20 + Math.random() * 80).toFixed(2)), // 20-100%
        networkLatency: parseFloat((5 + Math.random() * 50).toFixed(2)) // 5-55 ms
    };
}

/**
 * Send IoT data to backend API
 */
function sendIoTData(data) {
    const postData = JSON.stringify(data);
    
    const url = new URL(API_URL);
    const options = {
        hostname: url.hostname,
        port: url.port || 3001,
        path: url.pathname,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 5000
    };
    
    const req = http.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(`✓ [${data.deviceId}] Data sent successfully`);
            } else {
                console.warn(`⚠ [${data.deviceId}] Server responded with status ${res.statusCode}`);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error(`✗ [${data.deviceId}] Error sending data:`, error.message);
        console.error('   Make sure backend server is running on port 3001');
    });
    
    req.on('timeout', () => {
        req.destroy();
        console.error(`✗ [${data.deviceId}] Request timeout`);
    });
    
    req.write(postData);
    req.end();
}

/**
 * Main loop: Generate and send IoT data
 */
function startIoTGenerator() {
    console.log('========================================');
    console.log('IoT Data Generator Started');
    console.log('========================================');
    console.log(`API Endpoint: ${API_URL}`);
    console.log(`Update Interval: ${INTERVAL_MS}ms (${1000/INTERVAL_MS} updates/second)`);
    console.log(`Simulated Devices: ${DEVICE_COUNT}`);
    console.log('========================================');
    console.log('Generating IoT sensor data...');
    console.log('(Press Ctrl+C to stop)');
    console.log('========================================\n');
    
    // Send initial data immediately
    deviceIds.forEach(deviceId => {
        const data = generateIoTData(deviceId);
        sendIoTData(data);
    });
    
    // Then send data at regular intervals
    // Rotate through devices to simulate different devices sending at different times
    let deviceIndex = 0;
    setInterval(() => {
        const deviceId = deviceIds[deviceIndex % deviceIds.length];
        const data = generateIoTData(deviceId);
        sendIoTData(data);
        deviceIndex++;
    }, INTERVAL_MS);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n========================================');
    console.log('IoT Data Generator Stopped');
    console.log('========================================');
    process.exit(0);
});

// Start the generator
startIoTGenerator();
