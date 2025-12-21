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
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

echo Project Root: %PROJECT_ROOT%
echo.

REM ============================================================
REM STEP 1: Check Prerequisites
REM ============================================================
echo [1/6] Checking Prerequisites...
echo.

set "MISSING_DEPS="

REM Check Node.js
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Node.js not found!
    echo     Download from: https://nodejs.org/
    echo     Or run: winget install OpenJS.NodeJS.LTS
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do echo [OK] Node.js: %%i
)

REM Check npm
where npm >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] npm not found!
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=*" %%i in ('npm --version 2^>nul') do echo [OK] npm: %%i
)

REM Check Python - try 'py' launcher first (standard on Windows), then 'python'
set "PYTHON_CMD="
set "PYTHON_FOUND="

REM Try Python Launcher (py) first - this is the standard on Windows
where py >nul 2>&1
if !errorlevel! equ 0 (
    py --version >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_CMD=py"
        set "PYTHON_FOUND=1"
        for /f "tokens=*" %%i in ('py --version 2^>nul') do echo [OK] %%i ^(using 'py' launcher^)
    )
)

REM If py not found, try python
if not defined PYTHON_FOUND (
    where python >nul 2>&1
    if !errorlevel! equ 0 (
        REM Check if it's the Microsoft Store stub (returns error when run)
        python --version >nul 2>&1
        if !errorlevel! equ 0 (
            set "PYTHON_CMD=python"
            set "PYTHON_FOUND=1"
            for /f "tokens=*" %%i in ('python --version 2^>nul') do echo [OK] %%i
        )
    )
)

if not defined PYTHON_FOUND (
    echo [X] Python not found!
    echo     Download from: https://www.python.org/downloads/
    echo     Or run: winget install Python.Python.3.11
    echo     IMPORTANT: During installation, check "Add Python to PATH"
    set "MISSING_DEPS=1"
)

REM Check pip (only if Python was found)
if defined PYTHON_FOUND (
    %PYTHON_CMD% -m pip --version >nul 2>&1
    if !errorlevel! neq 0 (
        echo [X] pip not found!
        echo     Try running: %PYTHON_CMD% -m ensurepip --upgrade
        set "MISSING_DEPS=1"
    ) else (
        for /f "tokens=2 delims= " %%i in ('%PYTHON_CMD% -m pip --version 2^>nul') do echo [OK] pip: %%i
    )
)

REM Check Docker (optional)
where docker >nul 2>&1
if !errorlevel! neq 0 (
    echo [!] Docker not found [optional - for containerized deployment]
) else (
    for /f "tokens=*" %%i in ('docker --version 2^>nul') do echo [OK] %%i
)

echo.

if defined MISSING_DEPS (
    echo ==============================================================
    echo ERROR: Missing required dependencies. Please install them first.
    echo ==============================================================
    echo.
    echo After installing, close this window and run setup-windows.bat again.
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
        echo # Database [SQLite for local dev]
        echo DATABASE_URL=sqlite:///./brainspark.db
        echo.
        echo # Anthropic API Key [REQUIRED - get from https://console.anthropic.com]
        echo ANTHROPIC_API_KEY=your-api-key-here
        echo.
        echo # JWT Secret [auto-generated]
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
if !errorlevel! neq 0 (
    echo [X] Backend directory not found!
    pause
    exit /b 1
)

REM Create virtual environment if not exists
if not exist "venv" (
    echo Creating Python virtual environment...
    %PYTHON_CMD% -m venv venv
    if !errorlevel! neq 0 (
        echo [X] Failed to create virtual environment!
        pause
        exit /b 1
    )
)

REM Check venv activation script exists
if not exist "venv\Scripts\activate.bat" (
    echo [X] Virtual environment is corrupted. Recreating...
    rmdir /s /q venv 2>nul
    %PYTHON_CMD% -m venv venv
    if !errorlevel! neq 0 (
        echo [X] Failed to create virtual environment!
        pause
        exit /b 1
    )
)

REM Activate virtual environment and install dependencies
echo Installing Python packages...
call venv\Scripts\activate.bat
venv\Scripts\python.exe -m pip install --upgrade pip -q 2>nul
venv\Scripts\pip.exe install -r requirements.txt -q
if !errorlevel! neq 0 (
    echo [X] Failed to install backend dependencies!
    echo     Check requirements.txt for any issues.
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
if !errorlevel! neq 0 (
    echo [X] Frontend directory not found!
    pause
    exit /b 1
)

echo Installing npm packages...
call npm install --legacy-peer-deps
if !errorlevel! neq 0 (
    echo [X] Failed to install frontend dependencies!
    echo     Check package.json for any issues.
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

REM Create database tables using Python (use venv's python directly)
venv\Scripts\python.exe -c "from app.main import Base, engine; Base.metadata.create_all(bind=engine)" 2>nul
if !errorlevel! neq 0 (
    echo [!] Database initialization skipped [will auto-create on first run]
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
echo    scripts\start-local.bat
echo.
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%"
pause
