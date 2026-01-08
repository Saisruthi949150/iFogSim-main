# iFogSim Web Dashboard

## ⚠️ Important: Must Be Served Via HTTP

**DO NOT open `index.html` directly in the browser** (file:// protocol). This will cause CORS errors and prevent communication with the backend API.

## Quick Start

### Prerequisites
1. **Backend server must be running** on `http://localhost:3000`
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Frontend must be served via HTTP**

### Serving the Frontend

#### Option 1: Python HTTP Server (Recommended)

**Windows:**
```bash
cd iFogSim-main
py -m http.server 5500
```

**Linux/Mac:**
```bash
cd iFogSim-main
python3 -m http.server 5500
```

Then open: **http://localhost:5500/web-dashboard/**

#### Option 2: Node.js HTTP Server

```bash
cd iFogSim-main
npx http-server -p 5500
```

Then open: **http://localhost:5500/web-dashboard/**

#### Option 3: Using VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Accessing the Dashboard

Once the frontend is served via HTTP, open:
- **http://localhost:5500/web-dashboard/** (or your chosen port)

## Troubleshooting

### "Cannot connect to backend server"
- Ensure backend is running: `cd backend && npm start`
- Verify backend is accessible: http://localhost:3000/health
- Check browser console (F12) for detailed errors

### CORS Errors
- This means the frontend is opened via `file://` protocol
- **Solution:** Serve via HTTP as described above

### Port Already in Use
- If port 5500 is in use, choose a different port:
  ```bash
  python -m http.server 8080
  ```
- Then open: http://localhost:8080/web-dashboard/

## Architecture

```
┌─────────────────────────────────┐
│  Frontend (HTTP Server)        │
│  http://localhost:5500         │
│  /web-dashboard/               │
└──────────────┬──────────────────┘
               │ HTTP Requests
               ▼
┌─────────────────────────────────┐
│  Backend (Node.js/Express)      │
│  http://localhost:3000          │
│  - POST /run-simulation          │
│  - GET /health                   │
│  - GET /api/fl-metrics           │
└──────────────┬──────────────────┘
               │ Executes
               ▼
┌─────────────────────────────────┐
│  iFogSim (Java)                 │
│  Generates JSON results          │
└─────────────────────────────────┘
```

## Files

- `index.html` - Main dashboard HTML
- `script.js` - Dashboard JavaScript logic
- `style.css` - Dashboard styling
- `README.md` - This file
