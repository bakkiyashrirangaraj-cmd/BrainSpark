@echo off
REM ============================================================
REM BrainSpark - Start Local Development Servers
REM ============================================================
REM This script starts both backend and frontend servers
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ==============================================================
echo    BrainSpark - Starting Local Development Servers
echo ==============================================================
echo.

REM Set project root directory
set "PROJECT_ROOT=%~dp0.."
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

REM Check if setup has been run
if not exist "%PROJECT_ROOT%\backend\venv" (
    echo [X] Setup not complete! Please run setup-windows.bat first.
    echo     Or run INSTALL.bat from the project root.
    pause
    exit /b 1
)

REM Check if venv activation script exists
if not exist "%PROJECT_ROOT%\backend\venv\Scripts\activate.bat" (
    echo [X] Virtual environment is corrupted!
    echo     Please delete backend\venv and run setup again.
    pause
    exit /b 1
)

REM Check for API key
if exist "%PROJECT_ROOT%\backend\.env" (
    findstr /C:"your-api-key-here" "%PROJECT_ROOT%\backend\.env" >nul 2>&1
    if !errorlevel! equ 0 (
        echo ==============================================================
        echo    WARNING: Anthropic API key not configured!
        echo    Edit backend\.env and replace 'your-api-key-here'
        echo    with your actual API key from https://console.anthropic.com
        echo ==============================================================
        echo.
        echo Press any key to continue anyway [AI features won't work]...
        pause >nul
    )
) else (
    echo [!] backend\.env not found - will be created with defaults
)

echo Starting Backend API Server...
echo.

REM Start Backend in new window
start "BrainSpark Backend" cmd /k "cd /d "%PROJECT_ROOT%\backend" && call venv\Scripts\activate.bat && echo. && echo ============================================== && echo    BrainSpark Backend API && echo    http://localhost:8000 && echo    API Docs: http://localhost:8000/docs && echo ============================================== && echo. && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
echo Waiting for backend to initialize...
timeout /t 4 /nobreak >nul

echo Starting Frontend Dev Server...
echo.

REM Start Frontend in new window
start "BrainSpark Frontend" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && echo. && echo ============================================== && echo    BrainSpark Frontend && echo    http://localhost:5173 && echo ============================================== && echo. && npm run dev"

echo.
echo ==============================================================
echo    Both servers are starting in separate windows!
echo ==============================================================
echo.
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo    Press any key to open the app in your browser...
echo ==============================================================

pause >nul

REM Open browser
start "" "http://localhost:5173"

echo.
echo To stop the servers, run: scripts\stop-local.bat
echo Or close the server terminal windows manually.
echo.
