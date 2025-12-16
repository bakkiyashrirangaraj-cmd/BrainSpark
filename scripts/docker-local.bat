@echo off
REM ============================================================
REM BrainSpark - Run with Docker Compose (Local)
REM ============================================================
REM Requires Docker Desktop for Windows
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ==============================================================
echo    BrainSpark - Docker Local Deployment
echo ==============================================================
echo.

REM Set project root directory
set "PROJECT_ROOT=%~dp0.."
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

REM Check Docker
where docker >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Docker not found!
    echo     Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check Docker is running
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Docker is not running! Please start Docker Desktop.
    pause
    exit /b 1
)

echo [OK] Docker is running

REM Check docker-compose.local.yml exists
if not exist "%PROJECT_ROOT%\docker-compose.local.yml" (
    echo [X] docker-compose.local.yml not found!
    echo     This file should exist in the project root.
    pause
    exit /b 1
)

echo [OK] docker-compose.local.yml found
echo.

echo Choose an option:
echo   1. Build and Start [fresh build]
echo   2. Start [use existing images]
echo   3. Stop all containers
echo   4. View logs
echo   5. Rebuild specific service
echo   6. Remove all containers and volumes [clean]
echo.
set /p "choice=Enter choice (1-6): "

if "!choice!"=="1" (
    echo.
    echo Building and starting containers...
    docker-compose -f docker-compose.local.yml up --build -d
    if !errorlevel! neq 0 (
        echo [X] Failed to build/start containers
        pause
        exit /b 1
    )
    echo.
    echo Waiting for services to start...
    timeout /t 10 /nobreak >nul
    echo.
    echo ==============================================================
    echo    Services Started!
    echo    Frontend: http://localhost:5173
    echo    Backend:  http://localhost:8000
    echo    API Docs: http://localhost:8000/docs
    echo ==============================================================
    start "" "http://localhost:5173"
)

if "!choice!"=="2" (
    echo.
    echo Starting containers...
    docker-compose -f docker-compose.local.yml up -d
    if !errorlevel! neq 0 (
        echo [X] Failed to start containers
        pause
        exit /b 1
    )
    echo.
    echo ==============================================================
    echo    Services Started!
    echo    Frontend: http://localhost:5173
    echo    Backend:  http://localhost:8000
    echo ==============================================================
    start "" "http://localhost:5173"
)

if "!choice!"=="3" (
    echo.
    echo Stopping containers...
    docker-compose -f docker-compose.local.yml down
    echo [OK] All containers stopped
)

if "!choice!"=="4" (
    echo.
    echo Showing logs [Ctrl+C to exit]...
    docker-compose -f docker-compose.local.yml logs -f
)

if "!choice!"=="5" (
    echo.
    echo Which service to rebuild?
    echo   1. Backend
    echo   2. Frontend
    set /p "svc=Enter choice (1-2): "
    if "!svc!"=="1" (
        docker-compose -f docker-compose.local.yml up --build -d backend
    )
    if "!svc!"=="2" (
        docker-compose -f docker-compose.local.yml up --build -d frontend
    )
)

if "!choice!"=="6" (
    echo.
    echo WARNING: This will remove all containers, images, and volumes!
    set /p "confirm=Are you sure? [y/N]: "
    if /i "!confirm!"=="y" (
        docker-compose -f docker-compose.local.yml down -v --rmi local
        echo [OK] Cleaned up all Docker resources
    ) else (
        echo Cancelled.
    )
)

echo.
pause
