# iFogSim Backend Server

Node.js backend API for triggering iFogSim simulations with different algorithms.

## Setup

1. Install Node.js dependencies:
```bash
cd backend
npm install
```

## Running the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### POST /run-simulation
Triggers a simulation with the selected algorithm.

**Request Body:**
```json
{
  "algorithm": "SCPSO"
}
```

**Valid algorithms:** `Baseline`, `SCPSO`, `SCCSO`, `GWO`

**Response:**
```json
{
  "success": true,
  "algorithm": "SCPSO",
  "results": {
    "latency": {...},
    "energy": {...},
    "bandwidth": {...},
    "migration_logs": {...}
  }
}
```

### GET /health
Health check endpoint.

### GET /algorithms
Returns list of available algorithms.

## Requirements

- Node.js (v14 or higher)
- Java JDK (for running iFogSim)
- iFogSim project compiled
