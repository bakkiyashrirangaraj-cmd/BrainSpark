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

REM Check Python and version compatibility
where python >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Python not found!
    echo     Download Python 3.11 from: https://www.python.org/downloads/release/python-3119/
    echo     Or run: winget install Python.Python.3.11
    set "MISSING_DEPS=1"
) else (
    for /f "tokens=2 delims= " %%v in ('python --version 2^>nul') do (
        set "PY_VER=%%v"
    )
    echo [..] Python !PY_VER! found

    REM Extract major and minor version
    for /f "tokens=1,2 delims=." %%a in ("!PY_VER!") do (
        set "PY_MAJOR=%%a"
        set "PY_MINOR=%%b"
    )

    REM Check if version is compatible (3.9 - 3.12 recommended)
    if !PY_MAJOR! equ 3 (
        if !PY_MINOR! geq 9 if !PY_MINOR! leq 12 (
            echo [OK] Python !PY_VER! - Compatible version
        ) else if !PY_MINOR! geq 13 (
            echo [X] Python !PY_VER! is too new!
            echo     Pre-built packages [pydantic, etc.] are not available for Python 3.13+
            echo     These packages require Rust compiler to build from source.
            echo.
            echo     Please install Python 3.11 [recommended]:
            echo     winget install Python.Python.3.11
            echo     Or download from: https://www.python.org/downloads/release/python-3119/
            set "MISSING_DEPS=1"
        ) else (
            echo [X] Python !PY_VER! is too old - requires Python 3.9+
            set "MISSING_DEPS=1"
        )
    ) else (
        echo [X] Python !PY_VER! - Unsupported major version
        set "MISSING_DEPS=1"
    )
)

REM Check pip
python -m pip --version >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] pip not found!
    set "MISSING_DEPS=1"
) else (
    echo [OK] pip installed
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
    echo ERROR: Missing or incompatible dependencies detected.
    echo ==============================================================
    echo.
    echo To fix Python version issues, install Python 3.11:
    echo   winget install Python.Python.3.11
    echo.
    echo After installing, close this window and run setup-windows.bat again.
    pause
    exit /b 1
)

echo All prerequisites OK!
echo.

REM ============================================================
REM STEP 2: Generate Secure Keys & Create Environment Files
REM ============================================================
echo [2/6] Generating secure keys and setting up environment files...
echo.

REM Generate a secure random JWT_SECRET using PowerShell
echo Generating secure JWT_SECRET...
for /f "tokens=*" %%i in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))"') do (
    set "JWT_SECRET=%%i"
)

if not defined JWT_SECRET (
    echo [!] Could not generate secure JWT_SECRET, using fallback
    set "JWT_SECRET=fallback-secret-%RANDOM%%RANDOM%%RANDOM%-change-this"
) else (
    echo [OK] JWT_SECRET generated [64 bytes, Base64 encoded]
)

REM Create backend .env file with secure secrets
if not exist "%PROJECT_ROOT%\backend\.env" (
    echo Creating backend\.env with secure configuration...
    (
        echo # BrainSpark Backend Environment
        echo # Generated by setup-windows.bat on %DATE% %TIME%
        echo.
        echo # Environment
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
        echo # JWT Authentication [Auto-generated secure key]
        echo JWT_SECRET=!JWT_SECRET!
        echo JWT_ALGORITHM=HS256
        echo JWT_EXPIRATION_HOURS=24
    ) > "%PROJECT_ROOT%\backend\.env"
    echo [OK] Created backend\.env with secure JWT_SECRET
) else (
    echo [OK] backend\.env already exists
    REM Check if JWT_SECRET needs to be updated from placeholder
    findstr /C:"local-dev-secret" "%PROJECT_ROOT%\backend\.env" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [!] Updating insecure JWT_SECRET with secure key...
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
            "$content = Get-Content '%PROJECT_ROOT%\backend\.env' -Raw; ^
             $content = $content -replace 'JWT_SECRET=local-dev-secret.*', 'JWT_SECRET=!JWT_SECRET!'; ^
             Set-Content '%PROJECT_ROOT%\backend\.env' $content -NoNewline"
        echo [OK] JWT_SECRET updated
    )
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
    python -m venv venv
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
    python -m venv venv
    if !errorlevel! neq 0 (
        echo [X] Failed to create virtual environment!
        pause
        exit /b 1
    )
)

REM Activate virtual environment and install dependencies
echo Installing Python packages...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip -q 2>nul
pip install -r requirements.txt -q
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

REM Create database tables using Python
python -c "from app.main import Base, engine; Base.metadata.create_all(bind=engine)" 2>nul
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
