@echo off
echo ========================================
echo Starting iFogSim Dashboard Server
echo ========================================
echo.
echo This will start a local HTTP server on port 5500
echo.
echo IMPORTANT: Backend must be running on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

cd /d %~dp0\..
py -m http.server 5500

pause
