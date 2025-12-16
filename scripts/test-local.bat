@echo off
REM ============================================================
REM BrainSpark - Run Tests Locally
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ==============================================================
echo    BrainSpark - Running Tests
echo ==============================================================
echo.

REM Set project root directory
set "PROJECT_ROOT=%~dp0.."
REM Remove trailing backslash if present
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
cd /d "%PROJECT_ROOT%"

REM Check setup
if not exist "%PROJECT_ROOT%\backend\venv" (
    echo [X] Setup not complete! Please run setup-windows.bat first.
    pause
    exit /b 1
)

echo Choose test type:
echo   1. Backend Tests [Python/pytest]
echo   2. Frontend Tests [Vitest]
echo   3. All Tests
echo   4. Backend Lint [flake8]
echo   5. Frontend Lint [ESLint]
echo   6. Backend Type Check [mypy]
echo.
set /p "choice=Enter choice (1-6): "

if "!choice!"=="1" goto backend_test
if "!choice!"=="2" goto frontend_test
if "!choice!"=="3" goto all_tests
if "!choice!"=="4" goto backend_lint
if "!choice!"=="5" goto frontend_lint
if "!choice!"=="6" goto backend_typecheck
goto invalid_choice

:backend_test
echo.
echo Running Backend Tests...
echo.
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pytest -v --tb=short
if !errorlevel! neq 0 (
    echo.
    echo [!] Some tests failed
) else (
    echo.
    echo [OK] All backend tests passed
)
goto end

:frontend_test
echo.
echo Running Frontend Tests...
echo.
cd /d "%PROJECT_ROOT%\frontend"
call npm test
if !errorlevel! neq 0 (
    echo.
    echo [!] Some tests failed
) else (
    echo.
    echo [OK] All frontend tests passed
)
goto end

:all_tests
echo.
echo Running All Tests...
echo.

echo [Backend Tests]
echo ---------------
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pytest -v --tb=short 2>nul
if !errorlevel! neq 0 (
    echo [!] Backend tests failed or not configured
)

echo.
echo [Frontend Tests]
echo ----------------
cd /d "%PROJECT_ROOT%\frontend"
call npm test 2>nul
if !errorlevel! neq 0 (
    echo [!] Frontend tests failed or not configured
)
goto end

:backend_lint
echo.
echo Running Backend Lint [flake8]...
echo.
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pip install flake8 -q 2>nul
flake8 app/ --max-line-length=120
if !errorlevel! neq 0 (
    echo.
    echo [!] Linting issues found
) else (
    echo.
    echo [OK] No linting issues
)
goto end

:frontend_lint
echo.
echo Running Frontend Lint [ESLint]...
echo.
cd /d "%PROJECT_ROOT%\frontend"
call npm run lint
if !errorlevel! neq 0 (
    echo.
    echo [!] Linting issues found
) else (
    echo.
    echo [OK] No linting issues
)
goto end

:backend_typecheck
echo.
echo Running Backend Type Check [mypy]...
echo.
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pip install mypy -q 2>nul
mypy app/ --ignore-missing-imports
if !errorlevel! neq 0 (
    echo.
    echo [!] Type check issues found
) else (
    echo.
    echo [OK] No type issues
)
goto end

:invalid_choice
echo [X] Invalid choice. Please enter 1-6.
goto end

:end
echo.
echo ==============================================================
echo    Tests Complete
echo ==============================================================
echo.
cd /d "%PROJECT_ROOT%"
pause
