@echo off
echo ========================================
echo Starting iFogSim Dashboard Servers
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server on port 3001...
start "iFogSim Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

REM Start Frontend Server
echo [2/2] Starting Frontend Server on port 5500...
start "iFogSim Frontend" cmd /k "cd /d %~dp0 && python -m http.server 5500"

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5500
echo Dashboard: http://localhost:5500/web-dashboard/
echo.
echo Both servers are starting in separate windows.
echo Wait a few seconds, then open the dashboard URL above.
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul
