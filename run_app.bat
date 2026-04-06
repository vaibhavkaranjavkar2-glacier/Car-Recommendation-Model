@echo off
echo Starting Car Recommendation Model Website...

start cmd /k "cd /d "%~dp0backend" && py -m uvicorn main:app --reload --port 8000"
start cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Press Ctrl+C to terminate the launchers.
