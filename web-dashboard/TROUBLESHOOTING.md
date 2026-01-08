# Backend Connection Troubleshooting Guide

If you see "⚠ Backend not connected" in the dashboard, follow these steps:

## Step 1: Verify Backend is Running

1. Open a **new terminal/command prompt**
2. Navigate to the backend directory:
   ```bash
   cd iFogSim-main/backend
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

4. You should see:
   ```
   ========================================
   iFogSim Backend Server running
   URL: http://localhost:3000
   ========================================
   ```

## Step 2: Test Backend Manually

Open your browser and go to:
```
http://localhost:3000/health
```

You should see JSON response:
```json
{
  "status": "OK",
  "service": "iFogSim Backend",
  "timestamp": "...",
  "uptime": ...
}
```

If you see an error or nothing loads, the backend is NOT running correctly.

## Step 3: Use the Test Connection Button

1. In the dashboard, click the **"Test Connection"** button
2. It will show an alert with detailed error information
3. Check the browser console (F12) for more details

## Step 4: Check Common Issues

### Issue: "Failed to fetch" or "NetworkError"
- **Solution**: Backend is not running. Start it using Step 1.

### Issue: CORS Error
- **Solution**: The backend CORS is already configured. If you still see CORS errors, check that:
  - Backend is running on `http://localhost:3000`
  - Frontend is served via HTTP (not `file://`)
  - No browser extensions are blocking requests

### Issue: Port 3000 Already in Use
- **Solution**: Another application is using port 3000. Either:
  - Stop the other application
  - Change the backend port in `server.js` (line 11: `const PORT = 3000;`)

### Issue: Firewall Blocking
- **Solution**: Allow Node.js through Windows Firewall or temporarily disable firewall for testing

## Step 5: Verify Frontend is Served via HTTP

The dashboard **must** be opened via HTTP, not as a file.

### Option A: Python HTTP Server
```bash
cd iFogSim-main
python -m http.server 5500
```
Then open: `http://localhost:5500/web-dashboard/`

### Option B: Node.js HTTP Server
```bash
cd iFogSim-main
npx http-server -p 5500
```
Then open: `http://localhost:5500/web-dashboard/`

## Quick Test Commands

### Test Backend Health (PowerShell)
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Test Backend Health (Browser Console)
```javascript
fetch('http://localhost:3000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Still Not Working?

1. Check browser console (F12) for errors
2. Check backend terminal for error messages
3. Verify both servers are running:
   - Backend: `http://localhost:3000`
   - Frontend: `http://localhost:5500` (or your chosen port)

## Contact

If issues persist, check:
- Node.js version: `node --version` (should be v12+)
- npm packages installed: `cd backend && npm install`
- No antivirus blocking Node.js
