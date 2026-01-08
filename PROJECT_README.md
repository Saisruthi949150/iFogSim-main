# Fog Computing Optimization System with Federated Learning

## Project Overview

This project implements a comprehensive fog computing simulation system that compares multiple optimization algorithms (Baseline, SCPSO, SCCSO, GWO) with integrated Federated Learning capabilities. The system includes a dynamic web dashboard for real-time visualization and analysis of simulation results.

## System Architecture

```
┌─────────────────────────────────────┐
│   Web Dashboard (Frontend)         │
│   - Algorithm Selection             │
│   - Real-time Visualization         │
│   - Export Capabilities             │
└──────────────┬──────────────────────┘
               │ HTTP API
               ▼
┌─────────────────────────────────────┐
│   Node.js Backend (Express)         │
│   - Simulation Trigger              │
│   - Results Aggregation             │
│   - API Endpoints                   │
└──────────────┬──────────────────────┘
               │ Java Execution
               ▼
┌─────────────────────────────────────┐
│   iFogSim (Java Simulation)         │
│   - Algorithm Execution              │
│   - Metrics Generation               │
│   - Federated Learning               │
└──────────────┬──────────────────────┘
               │ JSON Results
               ▼
┌─────────────────────────────────────┐
│   Results Directory                  │
│   - Latency, Energy, Bandwidth       │
│   - Migration Logs                   │
│   - FL Metrics                       │
└─────────────────────────────────────┘
```

## Prerequisites

- **Java JDK** (8 or higher)
- **Node.js** (v14 or higher)
- **Python 3** (for serving frontend)
- **Web Browser** (Chrome, Firefox, or Edge)

## Quick Start Guide

### Step 1: Start Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend directory:
   ```bash
   cd iFogSim-main/backend
   ```
3. Install dependencies (first time only):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. Verify backend is running:
   - Open: http://localhost:3000/health
   - Should see: `{"status":"OK",...}`

### Step 2: Start Frontend Server

1. Open a **new** terminal/command prompt
2. Navigate to the project root:
   ```bash
   cd iFogSim-main
   ```
3. Start HTTP server:

   **Windows:**
   ```bash
   py -m http.server 5500
   ```

   **Linux/Mac:**
   ```bash
   python3 -m http.server 5500
   ```

   Or use the provided scripts:
   - Windows: Double-click `web-dashboard/start-server.bat`
   - Linux/Mac: Run `web-dashboard/start-server.sh`

4. Open dashboard in browser:
   - Navigate to: **http://localhost:5500/web-dashboard/**

### Step 3: Run Simulation

1. Select an algorithm from the dropdown:
   - **Baseline**: Standard edge-ward placement
   - **SCPSO**: Sequence Cover Particle Swarm Optimization
   - **SCCSO**: Sequence Cover Cat Swarm Optimization
   - **GWO**: Grey Wolf Optimization
   - **Hybrid**: GWO with Federated Learning

2. Click **"Run Simulation"** button

3. Wait for simulation to complete (typically 10-30 seconds)

4. View results in the dashboard:
   - Latency Analysis
   - Energy Consumption
   - Bandwidth Usage
   - Federated Learning Overview (if enabled)
   - Secure Migration Logs

## Dashboard Sections

### 1. Latency Analysis
**Description:** Average end-to-end delay (ms) from iFogSim simulation  
**Shows:** Comparison of latency across different algorithms  
**Export:** Click "Export Chart" to save as PNG

### 2. Energy Consumption
**Description:** Total energy consumption (Joules) across all fog devices  
**Shows:** Energy efficiency comparison between algorithms  
**Export:** Click "Export Chart" to save as PNG

### 3. Bandwidth Usage
**Description:** Network bandwidth utilization (bytes) for data migration  
**Shows:** Network usage patterns for each algorithm  
**Export:** Click "Export Chart" to save as PNG

### 4. Federated Learning Overview
**Description:** Distributed learning metrics with privacy-preserving aggregation  
**Shows:** 
- Training rounds completed
- Number of participating fog nodes
- Local model losses
- Global model convergence
- Privacy status

**Note:** Only visible when FL is enabled (Hybrid mode)

### 5. Secure Migration Logs
**Description:** Chronological record of data migrations with integrity verification  
**Shows:**
- Timestamp of each migration
- Source and target devices
- Data size transferred
- Integrity verification status

**Export:** 
- Click "Export Logs (JSON)" for JSON format
- Click "Export Logs (CSV)" for CSV format

## Algorithms Explained

### Baseline
- **Type:** Standard placement algorithm
- **Strategy:** Edge-ward placement (modules placed closer to edge devices)
- **Use Case:** Reference for comparison

### SCPSO (Sequence Cover Particle Swarm Optimization)
- **Type:** Swarm intelligence optimization
- **Strategy:** Particle swarm-based load balancing across fog nodes
- **Optimization:** Minimizes latency through distributed placement

### SCCSO (Sequence Cover Cat Swarm Optimization)
- **Type:** Swarm intelligence optimization
- **Strategy:** Cat swarm behavior with connectivity-based scoring
- **Optimization:** Balances connectivity and proximity

### GWO (Grey Wolf Optimization)
- **Type:** Meta-heuristic optimization
- **Strategy:** Hierarchy-based ranking (alpha/beta selection)
- **Optimization:** Uses best-performing devices for placement

### Hybrid (GWO + Federated Learning)
- **Type:** Combined optimization with distributed learning
- **Strategy:** GWO placement with Federated Learning enabled
- **Features:**
  - Privacy-preserving model training
  - No raw data sharing between nodes
  - Global model aggregation (FedAvg)

## API Endpoints

### Backend Endpoints (http://localhost:3000)

- **GET /health** - Health check endpoint
- **POST /run-simulation** - Trigger simulation with selected algorithm
  ```json
  {
    "algorithm": "SCPSO",
    "enableFL": false
  }
  ```
- **GET /algorithms** - List available algorithms
- **GET /api/fl-metrics** - Get Federated Learning metrics

## Demo Mode

To enable automatic demo execution:

1. Open `web-dashboard/script.js`
2. Set `DEMO_MODE = true` (line 35)
3. Optionally change `DEMO_ALGORITHM` (default: 'Hybrid')
4. Refresh dashboard - simulation will auto-run

## Export Features

### Chart Export
- Click "Export Chart" button below any chart
- Saves as PNG image with timestamp
- Filename format: `{chart-name}_{timestamp}.png`

### Migration Logs Export
- **JSON Format:** Complete data structure with all fields
- **CSV Format:** Tabular format for spreadsheet analysis
- Filename format: `migration_logs_{timestamp}.{json|csv}`

## Troubleshooting

### "Cannot connect to backend server"
- Ensure backend is running: `cd backend && npm start`
- Verify backend health: http://localhost:3000/health
- Check firewall settings

### "Dashboard Must Be Served Via HTTP"
- Do NOT open `index.html` directly
- Use HTTP server: `python -m http.server 5500`
- Access via: http://localhost:5500/web-dashboard/

### Simulation fails
- Check Java is installed: `java -version`
- Verify iFogSim is compiled
- Check backend console for error messages

### No data in charts
- Run a simulation first
- Check `results/` directory for JSON files
- Verify backend can read results files

## Project Structure

```
iFogSim-main/
├── backend/              # Node.js backend server
│   ├── server.js        # Express API server
│   └── package.json     # Backend dependencies
├── web-dashboard/        # Frontend dashboard
│   ├── index.html       # Main HTML file
│   ├── script.js        # Dashboard logic
│   ├── style.css        # Styling
│   └── README.md        # Frontend documentation
├── src/                  # iFogSim Java source
│   ├── org/fog/
│   │   ├── test/        # Simulation classes
│   │   ├── placement/   # Algorithm implementations
│   │   └── utils/       # Utilities (FL, ResultsExporter)
└── results/              # Generated simulation results
    ├── *_latency.json
    ├── *_energy.json
    ├── *_bandwidth.json
    ├── migration_logs.json
    └── fl_metrics.json
```

## Technical Details

### Technologies Used
- **Backend:** Node.js, Express.js, CORS
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Chart.js
- **Simulation:** Java, iFogSim framework
- **Data Format:** JSON

### Key Features
- Dynamic algorithm selection
- Real-time result visualization
- Federated Learning integration
- Privacy-preserving data processing
- Export capabilities for evidence
- Professional UI/UX

## Evaluation Notes

### For Evaluators

This system demonstrates:
1. **Algorithm Comparison:** Side-by-side performance analysis
2. **Federated Learning:** Privacy-preserving distributed learning
3. **Real-time Visualization:** Dynamic dashboard updates
4. **Data Export:** Evidence generation capabilities
5. **System Integration:** Frontend-backend-simulation architecture

### Performance Metrics
- **Latency:** Lower is better (milliseconds)
- **Energy:** Lower is better (Joules)
- **Bandwidth:** Varies by algorithm strategy
- **FL Convergence:** Higher is better (0-1 scale)

## Contact & Support

For technical issues or questions:
1. Check troubleshooting section above
2. Review console logs (F12 in browser)
3. Check backend terminal output

## License

This project is part of a final-year capstone project demonstrating fog computing optimization with Federated Learning.

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready
