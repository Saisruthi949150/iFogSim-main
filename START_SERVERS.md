# How to Run Frontend and Backend Servers

## Quick Start (Windows)

### Option 1: Use the Batch File (Easiest)
1. Double-click `START_SERVERS.bat` in the `iFogSim-main` folder
2. Two windows will open (one for backend, one for frontend)
3. Wait 5-10 seconds for servers to start
4. Open: http://localhost:5500/web-dashboard/

### Option 2: Manual Start (Step by Step)

#### Step 1: Start Backend Server
1. Open a **PowerShell** or **Command Prompt** window
2. Navigate to the backend directory:
   ```bash
   cd D:\ifog\iFogSim-main\backend
   ```
3. Start the backend:
   ```bash
   npm start
   ```
4. You should see:
   ```
   ✓ iFogSim Backend Server started
   ✓ Listening on http://localhost:3000
   ```

#### Step 2: Start Frontend Server
1. Open a **new** PowerShell or Command Prompt window
2. Navigate to the project root:
   ```bash
   cd D:\ifog\iFogSim-main
   ```
3. Start the frontend server:
   ```bash
   python -m http.server 5500
   ```
   Or if `python` doesn't work, try:
   ```bash
   py -m http.server 5500
   ```
4. You should see:
   ```
   Serving HTTP on 0.0.0.0 port 5500
   ```

#### Step 3: Open Dashboard
- Open your browser and go to: **http://localhost:5500/web-dashboard/**

## Verification

### Check Backend
- Open: http://localhost:3001/health
- Should show: `{"status":"OK","service":"iFogSim Backend",...}`

### Check Frontend
- Open: http://localhost:5500
- Should show directory listing

### Check Dashboard
- Open: http://localhost:5500/web-dashboard/
- Should show the dashboard interface

## Troubleshooting

### Port Already in Use
If you see "Port 3001 is already in use":
1. Find the process: `netstat -ano | findstr :3001`
2. Stop it: `taskkill /PID <process_id> /F`
3. Or restart your computer

### Python Not Found
If `python` command doesn't work:
- Try `py` instead
- Or install Python from python.org
- Or use Node.js: `npx http-server -p 5500`

### Backend Not Starting
1. Make sure you're in the `backend` directory
2. Install dependencies: `npm install`
3. Check Node.js is installed: `node --version`

## Stopping Servers

- **Backend**: Press `Ctrl+C` in the backend window
- **Frontend**: Press `Ctrl+C` in the frontend window
- Or close the windows

## Quick Reference

| Server | Port | URL | Command |
|--------|------|-----|---------|
| Backend | 3001 | http://localhost:3001 | `cd backend && npm start` |
| Frontend | 5500 | http://localhost:5500 | `python -m http.server 5500` |
| Dashboard | 5500 | http://localhost:5500/web-dashboard/ | (same as frontend) |
