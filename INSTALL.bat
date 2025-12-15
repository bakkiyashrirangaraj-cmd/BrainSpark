@echo off
REM ============================================================
REM BrainSpark - ONE-CLICK INSTALLER
REM ============================================================
REM Double-click this file to set up and run BrainSpark locally
REM ============================================================

setlocal enabledelayedexpansion

title BrainSpark Installer

echo.
echo ==============================================================
echo.
echo    ____             _        ____                   _
echo   ^|  _ \           (_)      / ___^| _ __   __ _ _ __^| ^| __
echo   ^| ^|_) ^|_ __ __ _ _ _ __   \___ \^| '_ \ / _` ^| '__^| ^|/ /
echo   ^|  _ ^<^| '__/ _` ^| ^| '_ \   ___) ^| ^|_) ^| (_^| ^| ^|  ^|   ^<
echo   ^|_^| \_\_^| \__,_^|_^|_^| ^|_^| ^|____/^| .__/ \__,_^|_^|  ^|_^|\_\
echo                                  ^|_^|
echo.
echo    Kids AI Learning Companion - Local Development Setup
echo.
echo ==============================================================
echo.

REM Set project root directory
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

REM ============================================================
REM Check Prerequisites
REM ============================================================
echo Checking prerequisites...
echo.

set "INSTALL_NEEDED="

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js not found
    set "INSTALL_NEEDED=1"
) else (
    for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
)

REM Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Python not found
    set "INSTALL_NEEDED=1"
) else (
    for /f "tokens=*" %%i in ('python --version') do echo [OK] %%i
)

echo.

if defined INSTALL_NEEDED (
    echo ==============================================================
    echo    Missing Dependencies - Auto-Install Options
    echo ==============================================================
    echo.
    echo Would you like to install missing dependencies?
    echo   1. Yes, install via winget (Windows 10/11)
    echo   2. No, I'll install manually
    echo.
    set /p install_choice="Enter choice (1-2): "

    if "!install_choice!"=="1" (
        echo.
        echo Installing dependencies via winget...

        where node >nul 2>&1
        if !errorlevel! neq 0 (
            echo Installing Node.js LTS...
            winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
        )

        where python >nul 2>&1
        if !errorlevel! neq 0 (
            echo Installing Python 3.11...
            winget install Python.Python.3.11 --accept-source-agreements --accept-package-agreements
        )

        echo.
        echo ==============================================================
        echo    Please restart this installer after installation completes
        echo ==============================================================
        pause
        exit /b 0
    ) else (
        echo.
        echo Please install the following manually:
        echo   - Node.js: https://nodejs.org/
        echo   - Python:  https://www.python.org/downloads/
        echo.
        pause
        exit /b 1
    )
)

REM ============================================================
REM Install Backend
REM ============================================================
echo ==============================================================
echo    Installing Backend (Python/FastAPI)
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%\backend"

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python packages...
pip install --upgrade pip -q
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo [X] Failed to install backend dependencies!
    pause
    exit /b 1
)

echo [OK] Backend installed
echo.

REM ============================================================
REM Install Frontend
REM ============================================================
echo ==============================================================
echo    Installing Frontend (React/Vite)
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%\frontend"

echo Installing npm packages...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
    echo [X] Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo [OK] Frontend installed
echo.

REM ============================================================
REM Create Environment Files
REM ============================================================
echo ==============================================================
echo    Configuring Environment
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%"

REM Create backend .env
if not exist "backend\.env" (
    (
        echo ENVIRONMENT=development
        echo DEBUG=true
        echo APP_URL=http://localhost:5173
        echo API_URL=http://localhost:8000
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
        echo DATABASE_URL=sqlite:///./brainspark.db
        echo ANTHROPIC_API_KEY=your-api-key-here
        echo JWT_SECRET=local-dev-secret-key-change-in-production-12345
    ) > "backend\.env"
    echo [OK] Created backend\.env
) else (
    echo [OK] backend\.env exists
)

REM Create frontend .env
if not exist "frontend\.env" (
    (
        echo VITE_API_URL=http://localhost:8000
        echo VITE_APP_URL=http://localhost:5173
    ) > "frontend\.env"
    echo [OK] Created frontend\.env
) else (
    echo [OK] frontend\.env exists
)

echo.

REM ============================================================
REM API Key Setup
REM ============================================================
echo ==============================================================
echo    API Key Configuration
echo ==============================================================
echo.
echo BrainSpark requires an Anthropic API key to work.
echo Get your key from: https://console.anthropic.com/
echo.
echo Do you have an Anthropic API key to enter now?
echo   1. Yes, enter API key
echo   2. No, I'll add it later
echo.
set /p api_choice="Enter choice (1-2): "

if "%api_choice%"=="1" (
    echo.
    set /p api_key="Enter your Anthropic API key: "

    REM Update backend .env with API key
    powershell -Command "(Get-Content 'backend\.env') -replace 'ANTHROPIC_API_KEY=.*', 'ANTHROPIC_API_KEY=!api_key!' | Set-Content 'backend\.env'"
    echo [OK] API key saved
)

echo.

REM ============================================================
REM Installation Complete
REM ============================================================
echo ==============================================================
echo.
echo    INSTALLATION COMPLETE!
echo.
echo ==============================================================
echo.
echo    What would you like to do?
echo.
echo      1. Start BrainSpark now
echo      2. Exit (start manually later with scripts\start-local.bat)
echo.
set /p start_choice="Enter choice (1-2): "

if "%start_choice%"=="1" (
    echo.
    echo Starting BrainSpark...

    REM Start Backend
    start "BrainSpark Backend" cmd /k "cd /d %PROJECT_ROOT%\backend && call venv\Scripts\activate.bat && echo Backend starting on http://localhost:8000 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

    timeout /t 3 /nobreak >nul

    REM Start Frontend
    start "BrainSpark Frontend" cmd /k "cd /d %PROJECT_ROOT%\frontend && echo Frontend starting on http://localhost:5173 && npm run dev"

    timeout /t 5 /nobreak >nul

    echo.
    echo Opening browser...
    start http://localhost:5173

    echo.
    echo ==============================================================
    echo    BrainSpark is running!
    echo.
    echo    Frontend: http://localhost:5173
    echo    Backend:  http://localhost:8000
    echo    API Docs: http://localhost:8000/docs
    echo.
    echo    Close the terminal windows to stop the servers.
    echo ==============================================================
)

echo.
pause
