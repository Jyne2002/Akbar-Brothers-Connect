@echo off
echo Starting Akbar Brothers Employee Management System...
echo =======================================================
echo NOTE: Please ensure your local MongoDB server is running!
echo =======================================================

:: Start backend server in a new window
echo Starting Backend...
start "EMS Backend" cmd /k "cd backend && node index.js"

:: Start frontend development server in a new window
echo Starting Frontend...
start "EMS Frontend - Vite" cmd /k "cd frontend && npm run dev"

echo Successfully started the terminal windows!
