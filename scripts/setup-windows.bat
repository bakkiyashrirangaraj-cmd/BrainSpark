@echo off
REM ============================================================
REM BrainSpark - Windows Local Setup Script
REM ============================================================
REM Run this script as Administrator for best results
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ==============================================================
echo    BrainSpark - Local Development Setup for Windows
echo ==============================================================
echo.

REM Set project root directory
set "PROJECT_ROOT=%~dp0.."
cd /d "%PROJECT_ROOT%"

echo Project Root: %PROJECT_ROOT%
echo.

REM ============================================================
REM STEP 1: Check Prerequisites
REM ============================================================
echo [1/6] Checking Prerequisites...
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found!
    echo     Download from: https://nodejs.org/
    echo     Or run: winget install OpenJS.NodeJS.LTS
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js: %%i
)

REM Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] npm not found!
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('npm --version') do echo [OK] npm: %%i
)

REM Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found!
    echo     Download from: https://www.python.org/downloads/
    echo     Or run: winget install Python.Python.3.11
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('python --version') do echo [OK] %%i
)

REM Check pip
where pip >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] pip not found!
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('pip --version') do echo [OK] pip installed
)

REM Check Docker (optional)
where docker >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker not found (optional - for containerized deployment)
) else (
    for /f "tokens=*" %%i in ('docker --version') do echo [OK] %%i
)

echo.

if defined MISSING_DEPS (
    echo ==============================================================
    echo ERROR: Missing required dependencies. Please install them first.
    echo ==============================================================
    pause
    exit /b 1
)

echo All prerequisites OK!
echo.

REM ============================================================
REM STEP 2: Create Environment Files
REM ============================================================
echo [2/6] Setting up environment files...
echo.

REM Create backend .env file
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo Creating backend\.env...
    (
        echo # BrainSpark Backend Environment
        echo ENVIRONMENT=development
        echo DEBUG=true
        echo.
        echo # API URLs
        echo APP_URL=http://localhost:5173
        echo API_URL=http://localhost:8000
        echo.
        echo # CORS
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
        echo.
        echo # Database ^(SQLite for local dev^)
        echo DATABASE_URL=sqlite:///./brainspark.db
        echo.
        echo # Anthropic API Key ^(REQUIRED - get from https://console.anthropic.com^)
        echo ANTHROPIC_API_KEY=your-api-key-here
        echo.
        echo # JWT Secret ^(auto-generated^)
        echo JWT_SECRET=local-dev-secret-change-in-production-abc123xyz789
        echo JWT_ALGORITHM=HS256
        echo JWT_EXPIRATION_HOURS=24
    ) > "%PROJECT_ROOT%\backend\.env"
    echo [OK] Created backend\.env
) else (
    echo [OK] backend\.env already exists
)

REM Create frontend .env file
if not exist "%PROJECT_ROOT%\frontend\.env" (
    echo Creating frontend\.env...
    (
        echo # BrainSpark Frontend Environment
        echo VITE_API_URL=http://localhost:8000
        echo VITE_APP_URL=http://localhost:5173
    ) > "%PROJECT_ROOT%\frontend\.env"
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env already exists
)

echo.

REM ============================================================
REM STEP 3: Install Backend Dependencies
REM ============================================================
echo [3/6] Installing Backend Dependencies...
echo.

cd /d "%PROJECT_ROOT%\backend"

REM Create virtual environment if not exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment and install dependencies
echo Installing Python packages...
call venv\Scripts\activate.bat
pip install --upgrade pip -q
pip install -r requirements.txt -q

if %errorlevel% neq 0 (
    echo [X] Failed to install backend dependencies!
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed
echo.

REM ============================================================
REM STEP 4: Install Frontend Dependencies
REM ============================================================
echo [4/6] Installing Frontend Dependencies...
echo.

cd /d "%PROJECT_ROOT%\frontend"

echo Installing npm packages...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo [X] Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed
echo.

REM ============================================================
REM STEP 5: Initialize Database
REM ============================================================
echo [5/6] Initializing Database...
echo.

cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat

REM Create database tables using Python
python -c "from app.main import Base, engine; Base.metadata.create_all(bind=engine)" 2>nul
if %errorlevel% neq 0 (
    echo [!] Database initialization skipped (will auto-create on first run)
) else (
    echo [OK] Database initialized
)

echo.

REM ============================================================
REM STEP 6: Setup Complete
REM ============================================================
echo [6/6] Setup Complete!
echo.
echo ==============================================================
echo    SETUP COMPLETE!
echo ==============================================================
echo.
echo    IMPORTANT: Edit backend\.env and add your Anthropic API key:
echo    ANTHROPIC_API_KEY=sk-ant-xxxxx
echo.
echo    To start the application, run:
echo    start-local.bat
echo.
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%"
pause
