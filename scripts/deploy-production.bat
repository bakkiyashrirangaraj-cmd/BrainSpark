@echo off
REM ============================================================
REM BrainSpark - Production Deployment Script (Windows)
REM ============================================================
REM This script deploys BrainSpark to Google Cloud Run
REM
REM Prerequisites:
REM   1. gcloud CLI installed
REM   2. Authenticated with gcloud
REM   3. Secrets configured in Secret Manager
REM
REM Usage:
REM   scripts\deploy-production.bat
REM ============================================================

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_ID=brainspark-kids-companion
set REGION=asia-south1
set ENVIRONMENT=prod

REM Print header
echo ============================================
echo    BrainSpark Production Deployment
echo ============================================
echo.

REM Check if gcloud is installed
where gcloud >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: gcloud CLI not found
    echo Please install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

REM Get current project
for /f "delims=" %%i in ('gcloud config get-value project 2^>nul') do set CURRENT_PROJECT=%%i
echo Current GCP Project: %CURRENT_PROJECT%

REM Confirm project
if not "%CURRENT_PROJECT%"=="%PROJECT_ID%" (
    echo WARNING: Current project (%CURRENT_PROJECT%) doesn't match expected (%PROJECT_ID%)
    set /p CONTINUE="Continue anyway? (y/N) "
    if /i not "%CONTINUE%"=="y" (
        echo Deployment cancelled
        exit /b 1
    )
    set PROJECT_ID=%CURRENT_PROJECT%
)

echo.
echo Deployment Configuration:
echo   Project ID: %PROJECT_ID%
echo   Region: %REGION%
echo   Environment: %ENVIRONMENT%
echo.

REM Confirm deployment
set /p DEPLOY="Deploy to production? This will update live services. (y/N) "
if /i not "%DEPLOY%"=="y" (
    echo Deployment cancelled
    exit /b 1
)

echo.
echo Starting deployment...
echo.

REM Run Cloud Build
echo Step 1/3: Triggering Cloud Build...
gcloud builds submit ^
    --config=cloudbuild.yaml ^
    --substitutions=_ENVIRONMENT=%ENVIRONMENT%,_REGION=%REGION% ^
    --timeout=1200s

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Cloud Build failed
    pause
    exit /b 1
)

echo.
echo [OK] Cloud Build completed successfully
echo.

REM Get service URLs
echo Step 2/3: Retrieving service URLs...

for /f "delims=" %%i in ('gcloud run services describe brainspark-api --region=%REGION% --format="value(status.url)" 2^>nul') do set BACKEND_URL=%%i
for /f "delims=" %%i in ('gcloud run services describe brainspark-web --region=%REGION% --format="value(status.url)" 2^>nul') do set FRONTEND_URL=%%i

echo [OK] Services deployed
echo.

REM Test deployment
echo Step 3/3: Testing deployment...

echo   Testing backend health...
curl -sf "%BACKEND_URL%/health" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Backend is healthy
) else (
    echo   [ERROR] Backend health check failed
    echo   Check Cloud Run logs for details
)

echo   Testing frontend...
curl -sf "%FRONTEND_URL%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   [OK] Frontend is accessible
) else (
    echo   [ERROR] Frontend check failed
    echo   Check Cloud Run logs for details
)

REM Print deployment summary
echo.
echo ============================================
echo    Deployment Complete!
echo ============================================
echo.
echo Service URLs:
echo   Backend:  %BACKEND_URL%
echo   Frontend: %FRONTEND_URL%
echo.
echo API Documentation:
echo   Swagger UI: %BACKEND_URL%/docs
echo.
echo Next Steps:
echo   1. Configure custom domain mapping
echo   2. Set up Cloud CDN for frontend
echo   3. Configure monitoring and alerting
echo   4. Run integration tests
echo.
echo View logs:
echo   Backend:  gcloud run logs read brainspark-api --region=%REGION%
echo   Frontend: gcloud run logs read brainspark-web --region=%REGION%
echo.
echo ============================================
echo.

pause
