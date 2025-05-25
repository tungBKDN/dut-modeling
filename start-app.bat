@echo off
:: filepath: start-app.bat

:: Set colors
set "GREEN=92m"
set "BLUE=94m"
set "RED=91m"
set "NC=0m"

:: Define paths (adjust these to match your project structure)
set "BACKEND_DIR=backend"
set "FRONTEND_DIR=frontend\\my-app"

echo [%BLUE%Starting DUT Modeling Application...[%NC%

:: Start Backend
echo [%GREEN%Starting Backend Server...[%NC%
cd %BACKEND_DIR% || (
    echo [%RED%Backend directory not found![%NC%
    exit /b 1
)
start "Backend Server" cmd /k "npm run dev"
cd ..

:: Start Frontend
echo [%GREEN%Starting Frontend Application...[%NC%
cd %FRONTEND_DIR% || (
    echo [%RED%Frontend directory not found![%NC%
    exit /b 1
)
start "Frontend Application" cmd /k "npm run dev"
cd ..

echo [%BLUE%Both services started successfully![%NC%
echo Press any key to stop both services...

pause > nul

:: Stop services
echo [%BLUE%Stopping services...[%NC%
taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F
taskkill /FI "WINDOWTITLE eq Frontend Application*" /T /F
echo [%GREEN%Services stopped[%NC%