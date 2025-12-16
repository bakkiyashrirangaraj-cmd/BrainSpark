@echo off
REM ============================================================
REM BrainSpark - ONE-CLICK INSTALLER FOR WINDOWS 11
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
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

REM ============================================================
REM Check Prerequisites
REM ============================================================
echo Checking prerequisites...
echo.

set "INSTALL_NEEDED="
set "NODE_OK="
set "PYTHON_OK="
set "PYTHON_VERSION_OK="

REM Check Node.js
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Node.js not found
    set "INSTALL_NEEDED=1"
) else (
    for /f "tokens=*" %%i in ('node --version 2^>nul') do (
        echo [OK] Node.js %%i
        set "NODE_OK=1"
    )
)

REM Check Python
where python >nul 2>&1
if !errorlevel! neq 0 (
    echo [X] Python not found
    set "INSTALL_NEEDED=1"
    goto :python_check_done
)

REM Get Python version
for /f "tokens=2 delims= " %%v in ('python --version 2^>nul') do set "PY_VER=%%v"

REM Extract major and minor version numbers
for /f "tokens=1,2 delims=." %%a in ("!PY_VER!") do (
    set "PY_MAJOR=%%a"
    set "PY_MINOR=%%b"
)

echo [..] Python !PY_VER! detected [version !PY_MAJOR!.!PY_MINOR!]

REM Version compatibility check - need Python 3.9 to 3.12
if !PY_MAJOR! neq 3 (
    echo [X] Python !PY_VER! - Unsupported major version [need Python 3.x]
    set "INSTALL_NEEDED=1"
    goto :python_check_done
)

if !PY_MINOR! lss 9 (
    echo [X] Python !PY_VER! is too old - requires Python 3.9 or higher
    set "INSTALL_NEEDED=1"
    goto :python_check_done
)

if !PY_MINOR! gtr 12 (
    echo [X] Python !PY_VER! is too new - no pre-built packages available
    echo     Packages like pydantic-core require Rust compiler for Python 3.13+
    echo     Please install Python 3.11 [recommended] or 3.12
    set "INSTALL_NEEDED=1"
    goto :python_check_done
)

REM If we get here, Python version is compatible (3.9-3.12)
echo [OK] Python !PY_VER! - Compatible version
set "PYTHON_OK=1"
set "PYTHON_VERSION_OK=1"

:python_check_done

echo.

if defined INSTALL_NEEDED (
    echo ==============================================================
    echo    Missing or Incompatible Dependencies
    echo ==============================================================
    echo.
    if not defined NODE_OK echo    - Node.js: Not found
    if not defined PYTHON_OK (
        if defined PY_VER (
            echo    - Python: !PY_VER! installed but incompatible
            echo      Requires Python 3.9-3.12 for pre-built packages
        ) else (
            echo    - Python: Not found
        )
    )
    echo.
    echo Would you like to install compatible versions via winget?
    echo.
    echo   1 = Yes, install Python 3.11 and Node.js LTS automatically
    echo   2 = No, I will install manually
    echo.
    set /p "install_choice=Enter your choice [1 or 2]: "

    if "!install_choice!"=="1" (
        echo.
        echo Installing dependencies via winget...
        echo.

        REM Check if winget is available
        where winget >nul 2>&1
        if !errorlevel! neq 0 (
            echo [X] winget not found! Please install App Installer from Microsoft Store.
            echo     Or manually install Node.js and Python from their official websites.
            pause
            exit /b 1
        )

        set "INSTALL_PERFORMED="

        if not defined NODE_OK (
            echo Installing Node.js LTS...
            winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements -h
            if !errorlevel! equ 0 (
                echo [OK] Node.js installed
                set "INSTALL_PERFORMED=1"
            ) else (
                echo [X] Failed to install Node.js
            )
        )

        if not defined PYTHON_OK (
            echo.
            echo Installing Python 3.11 [recommended stable version]...
            winget install Python.Python.3.11 --accept-source-agreements --accept-package-agreements -h
            if !errorlevel! equ 0 (
                echo [OK] Python 3.11 installed
                set "INSTALL_PERFORMED=1"
            ) else (
                echo [X] Failed to install Python 3.11
            )
        )

        if defined INSTALL_PERFORMED (
            echo.
            echo ==============================================================
            echo    Dependencies installed successfully!
            echo ==============================================================
            echo.
            echo    IMPORTANT: You must CLOSE this window and open a NEW
            echo    Command Prompt or PowerShell window, then run INSTALL.bat
            echo    again for the new programs to be available.
            echo.
            echo    This is required because Windows needs to refresh the PATH
            echo    environment variable after installing new programs.
            echo.
            if defined PY_VER (
                echo    NOTE: Python 3.11 was installed alongside your existing
                echo    Python !PY_VER!. The new terminal should use Python 3.11.
                echo    If not, you may need to adjust your PATH or use 'py -3.11'
                echo.
            )
            echo ==============================================================
            pause
            exit /b 0
        )
    ) else (
        echo.
        echo Please install the following manually:
        echo   - Node.js LTS: https://nodejs.org/
        echo   - Python 3.11: https://www.python.org/downloads/release/python-3119/
        echo.
        echo    IMPORTANT: Python 3.13+ is NOT compatible due to missing
        echo    pre-built packages. Use Python 3.9, 3.10, 3.11, or 3.12.
        echo.
        echo After installation, close this window and run INSTALL.bat again.
        pause
        exit /b 1
    )
)

REM ============================================================
REM Install Backend
REM ============================================================
echo ==============================================================
echo    Installing Backend [Python/FastAPI]
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%\backend"
if !errorlevel! neq 0 (
    echo [X] Backend directory not found!
    pause
    exit /b 1
)

if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if !errorlevel! neq 0 (
        echo [X] Failed to create virtual environment!
        echo     Make sure Python is properly installed.
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo [X] Virtual environment activation script not found!
    echo     Try deleting the 'venv' folder and running installer again.
    pause
    exit /b 1
)
call venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip -q 2>nul

echo Installing Python packages...
pip install -r requirements.txt -q
if !errorlevel! neq 0 (
    echo.
    echo [X] Failed to install backend dependencies!
    echo     Check the error messages above for details.
    pause
    exit /b 1
)

echo [OK] Backend installed
echo.

REM ============================================================
REM Install Frontend
REM ============================================================
echo ==============================================================
echo    Installing Frontend [React/Vite]
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%\frontend"
if !errorlevel! neq 0 (
    echo [X] Frontend directory not found!
    pause
    exit /b 1
)

echo Installing npm packages...
call npm install --legacy-peer-deps 2>&1
if !errorlevel! neq 0 (
    echo.
    echo [X] Failed to install frontend dependencies!
    echo     Check the error messages above for details.
    pause
    exit /b 1
)

echo [OK] Frontend installed
echo.

REM ============================================================
REM Generate Secure Encryption Keys
REM ============================================================
echo ==============================================================
echo    Generating Secure Encryption Keys
echo ==============================================================
echo.

cd /d "%PROJECT_ROOT%"

REM Generate a secure random JWT_SECRET using PowerShell
echo Generating JWT_SECRET...
for /f "tokens=*" %%i in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))"') do (
    set "JWT_SECRET=%%i"
)

if not defined JWT_SECRET (
    echo [!] Could not generate secure JWT_SECRET, using fallback
    set "JWT_SECRET=fallback-secret-%RANDOM%%RANDOM%%RANDOM%-change-this"
) else (
    echo [OK] JWT_SECRET generated [64 bytes, Base64 encoded]
)

echo.

REM ============================================================
REM Create Environment Files
REM ============================================================
echo ==============================================================
echo    Configuring Environment
echo ==============================================================
echo.

REM Create backend .env with generated secrets
if not exist "backend\.env" (
    (
        echo # BrainSpark Backend Configuration
        echo # Generated by INSTALL.bat on %DATE% %TIME%
        echo.
        echo # Environment
        echo ENVIRONMENT=development
        echo DEBUG=true
        echo.
        echo # URLs
        echo APP_URL=http://localhost:5173
        echo API_URL=http://localhost:8000
        echo CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173
        echo.
        echo # Database
        echo DATABASE_URL=sqlite:///./brainspark.db
        echo.
        echo # Anthropic API Key [REQUIRED - get yours at https://console.anthropic.com]
        echo ANTHROPIC_API_KEY=your-api-key-here
        echo.
        echo # JWT Authentication [Auto-generated secure key]
        echo JWT_SECRET=!JWT_SECRET!
        echo JWT_ALGORITHM=HS256
        echo JWT_EXPIRATION_HOURS=24
    ) > "backend\.env"
    echo [OK] Created backend\.env with secure JWT_SECRET
) else (
    echo [OK] backend\.env exists
    REM Check if JWT_SECRET needs to be updated from placeholder
    findstr /C:"local-dev-secret" "backend\.env" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [!] Updating insecure JWT_SECRET with secure key...
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
            "$content = Get-Content '%PROJECT_ROOT%\backend\.env' -Raw; ^
             $content = $content -replace 'JWT_SECRET=local-dev-secret.*', 'JWT_SECRET=!JWT_SECRET!'; ^
             Set-Content '%PROJECT_ROOT%\backend\.env' $content -NoNewline"
        echo [OK] JWT_SECRET updated
    )
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
set /p "api_choice=Enter choice (1-2): "

if "!api_choice!"=="1" (
    echo.
    set /p "api_key=Enter your Anthropic API key: "

    if defined api_key (
        REM Write API key to a temp file to avoid special character issues
        echo !api_key!> "%TEMP%\brainspark_apikey.tmp"

        REM Use PowerShell to safely update the .env file
        powershell -NoProfile -ExecutionPolicy Bypass -Command ^
            "$key = (Get-Content '%TEMP%\brainspark_apikey.tmp' -Raw).Trim(); ^
             $envFile = '%PROJECT_ROOT%\backend\.env'; ^
             $content = Get-Content $envFile -Raw; ^
             $content = $content -replace 'ANTHROPIC_API_KEY=.*', ('ANTHROPIC_API_KEY=' + $key); ^
             Set-Content $envFile $content -NoNewline"

        REM Clean up temp file
        del "%TEMP%\brainspark_apikey.tmp" 2>nul

        if !errorlevel! equ 0 (
            echo [OK] API key saved
        ) else (
            echo [!] Could not save API key automatically.
            echo     Please edit backend\.env manually and set ANTHROPIC_API_KEY
        )
    )
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
echo      2. Exit [start manually later with scripts\start-local.bat]
echo.
set /p "start_choice=Enter choice (1-2): "

if "!start_choice!"=="1" (
    echo.
    echo Starting BrainSpark...

    REM Start Backend
    start "BrainSpark Backend" cmd /k "cd /d "%PROJECT_ROOT%\backend" && call venv\Scripts\activate.bat && echo. && echo Backend starting on http://localhost:8000 && echo. && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

    echo Waiting for backend to initialize...
    timeout /t 4 /nobreak >nul

    REM Start Frontend
    start "BrainSpark Frontend" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && echo. && echo Frontend starting on http://localhost:5173 && echo. && npm run dev"

    echo Waiting for frontend to initialize...
    timeout /t 5 /nobreak >nul

    echo.
    echo Opening browser...
    start "" "http://localhost:5173"

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
