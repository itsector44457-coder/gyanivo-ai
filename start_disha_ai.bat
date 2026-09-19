@echo off
title DISHA AI - Complete System Launcher
color 0A

echo ===================================================
echo       DISHA AI - SIH26101 PLATFORM LAUNCHER
echo ===================================================
echo.

echo [1/3] Checking and Starting PostgreSQL in Docker...
docker ps -a | findstr "gyanivo-postgres" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting new PostgreSQL Docker container...
    docker run --name gyanivo-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=gyanivo123 -e POSTGRES_DB=gyanivo_ai -p 5432:5432 -d postgres:17
) else (
    echo Starting existing gyanivo-postgres container...
    docker start gyanivo-postgres >nul 2>&1
)
echo [OK] PostgreSQL is running on port 5432.
echo.

echo [2/3] Starting NestJS Backend API (Port 5000)...
start "Disha AI - Backend API (Port 5000)" cmd /k "cd /d "%~dp0api" && node dist/src/main.js"
echo [OK] Backend API launching on http://localhost:5000
echo.

echo [3/3] Starting Next.js Web Frontend (Port 3000)...
start "Disha AI - Web Frontend (Port 3000)" cmd /k "cd /d "%~dp0web" && npm run dev"
echo [OK] Web Frontend launching on http://localhost:3000
echo.

echo ===================================================
echo   ALL SYSTEMS READY FOR JUDGE PRESENTATION!
echo ===================================================
echo Website URL: http://localhost:3000
echo Backend API: http://localhost:5000
echo Default Login: employee.demo@local.test / DemoPassword123!
echo.
pause
