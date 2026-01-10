# IoT Data Simulator

Real-time IoT sensor data generator for exhibition/demo purposes.

## Purpose

This simulator generates sample IoT sensor data to demonstrate real-time data streaming capabilities in the fog computing dashboard. It is designed for exhibition and demonstration purposes only - it does not affect iFogSim simulation execution.

## Usage

### Start the IoT Generator

```bash
cd iFogSim-main/iot-simulator
node iot-generator.js
```

The generator will:
- Create 5 simulated IoT devices
- Send sensor data every 1 second
- Display status in the console
- Send data to backend API at `http://localhost:3001/api/iot-data`

### Stop the Generator

Press `Ctrl+C` to stop the generator.

## Data Format

Each IoT data packet contains:
- `deviceId`: Unique device identifier (e.g., "iot-device-1")
- `temperature`: Temperature reading (20-45°C)
- `cpuLoad`: CPU utilization (0-100%)
- `dataSize`: Data size in KB (100-500 KB)
- `batteryLevel`: Battery level (20-100%)
- `networkLatency`: Network latency (5-55 ms)
- `timestamp`: ISO timestamp

## Backend Endpoints

- **POST /api/iot-data**: Receives IoT sensor data
- **GET /api/iot-data/latest**: Returns latest data for dashboard display

## Security Note

Secure data ingestion: no raw data persisted long-term. Data is stored temporarily for demo visualization only.

## Integration

The dashboard automatically polls the backend every second to display live IoT data in the "Live IoT Data Feed" section.
