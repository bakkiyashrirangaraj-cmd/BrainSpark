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
cd /d "%PROJECT_ROOT%"

echo Choose test type:
echo   1. Backend Tests (Python/pytest)
echo   2. Frontend Tests (Vitest)
echo   3. All Tests
echo   4. Backend Lint (flake8)
echo   5. Frontend Lint (ESLint)
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto backend_test
if "%choice%"=="2" goto frontend_test
if "%choice%"=="3" goto all_tests
if "%choice%"=="4" goto backend_lint
if "%choice%"=="5" goto frontend_lint

:backend_test
echo.
echo Running Backend Tests...
echo.
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pytest -v --tb=short
goto end

:frontend_test
echo.
echo Running Frontend Tests...
echo.
cd /d "%PROJECT_ROOT%\frontend"
call npm test
goto end

:all_tests
echo.
echo Running All Tests...
echo.

echo [Backend Tests]
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pytest -v --tb=short 2>nul || echo Backend tests not configured

echo.
echo [Frontend Tests]
cd /d "%PROJECT_ROOT%\frontend"
call npm test 2>nul || echo Frontend tests not configured
goto end

:backend_lint
echo.
echo Running Backend Lint...
echo.
cd /d "%PROJECT_ROOT%\backend"
call venv\Scripts\activate.bat
pip install flake8 -q
flake8 app/ --max-line-length=120
goto end

:frontend_lint
echo.
echo Running Frontend Lint...
echo.
cd /d "%PROJECT_ROOT%\frontend"
call npm run lint
goto end

:end
echo.
echo ==============================================================
echo    Tests Complete
echo ==============================================================
echo.
pause
