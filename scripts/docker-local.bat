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
cd /d "%PROJECT_ROOT%"

REM Check Docker
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker not found!
    echo     Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Docker is not running! Please start Docker Desktop.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

REM Create docker-compose.local.yml if not exists
if not exist "%PROJECT_ROOT%\docker-compose.local.yml" (
    echo Creating docker-compose.local.yml...
    (
        echo version: '3.8'
        echo.
        echo services:
        echo   backend:
        echo     build:
        echo       context: ./backend
        echo       dockerfile: Dockerfile
        echo     ports:
        echo       - "8000:8000"
        echo     environment:
        echo       - ENVIRONMENT=development
        echo       - DEBUG=true
        echo       - APP_URL=http://localhost:5173
        echo       - API_URL=http://localhost:8000
        echo       - CORS_ORIGINS=http://localhost:5173,http://localhost:3000
        echo       - DATABASE_URL=sqlite:///./brainspark.db
        echo       - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY:-your-key-here}
        echo       - JWT_SECRET=local-docker-secret-change-in-production
        echo     volumes:
        echo       - ./backend:/app
        echo       - backend_data:/app/data
        echo     healthcheck:
        echo       test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
        echo       interval: 30s
        echo       timeout: 10s
        echo       retries: 3
        echo.
        echo   frontend:
        echo     build:
        echo       context: ./frontend
        echo       dockerfile: Dockerfile
        echo       args:
        echo         - VITE_API_URL=http://localhost:8000
        echo         - VITE_APP_URL=http://localhost:5173
        echo     ports:
        echo       - "5173:80"
        echo     depends_on:
        echo       - backend
        echo     healthcheck:
        echo       test: ["CMD", "wget", "-q", "--spider", "http://localhost:80/"]
        echo       interval: 30s
        echo       timeout: 10s
        echo       retries: 3
        echo.
        echo volumes:
        echo   backend_data:
    ) > "%PROJECT_ROOT%\docker-compose.local.yml"
    echo [OK] Created docker-compose.local.yml
)

echo.
echo Choose an option:
echo   1. Build and Start (fresh build)
echo   2. Start (use existing images)
echo   3. Stop all containers
echo   4. View logs
echo   5. Rebuild specific service
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Building and starting containers...
    docker-compose -f docker-compose.local.yml up --build -d
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
    start http://localhost:5173
)

if "%choice%"=="2" (
    echo.
    echo Starting containers...
    docker-compose -f docker-compose.local.yml up -d
    echo.
    echo ==============================================================
    echo    Services Started!
    echo    Frontend: http://localhost:5173
    echo    Backend:  http://localhost:8000
    echo ==============================================================
    start http://localhost:5173
)

if "%choice%"=="3" (
    echo.
    echo Stopping containers...
    docker-compose -f docker-compose.local.yml down
    echo [OK] All containers stopped
)

if "%choice%"=="4" (
    echo.
    echo Showing logs (Ctrl+C to exit)...
    docker-compose -f docker-compose.local.yml logs -f
)

if "%choice%"=="5" (
    echo.
    echo Which service to rebuild?
    echo   1. Backend
    echo   2. Frontend
    set /p svc="Enter choice (1-2): "
    if "!svc!"=="1" (
        docker-compose -f docker-compose.local.yml up --build -d backend
    )
    if "!svc!"=="2" (
        docker-compose -f docker-compose.local.yml up --build -d frontend
    )
)

echo.
pause
