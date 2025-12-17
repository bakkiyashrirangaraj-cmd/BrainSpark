@echo off
REM ============================================================
REM BrainSpark - Secrets Setup Script (Windows)
REM ============================================================
REM This script creates all required secrets in Google Secret Manager
REM
REM Prerequisites:
REM   1. gcloud CLI installed and authenticated
REM   2. Secret Manager API enabled
REM
REM Usage:
REM   scripts\setup-secrets.bat
REM ============================================================

setlocal enabledelayedexpansion

REM Get project ID
for /f "delims=" %%i in ('gcloud config get-value project 2^>nul') do set PROJECT_ID=%%i

echo ============================================
echo    BrainSpark - Secrets Setup
echo ============================================
echo.
echo Project ID: %PROJECT_ID%
echo.

REM Enable Secret Manager API
echo Enabling Secret Manager API...
gcloud services enable secretmanager.googleapis.com --project=%PROJECT_ID%
echo [OK] API enabled
echo.

echo Creating Application Secrets
echo ============================================
echo.

REM Function to create secret
call :create_secret "anthropic-api-key" "Enter Claude API key (from https://console.anthropic.com)"
call :create_secret "grok-api-key" "Enter Grok API key (from https://console.x.ai)"
call :create_secret "jwt-secret" "Enter JWT secret (or press enter to auto-generate)"
call :create_secret "database-url" "Enter database URL (or press enter for SQLite default)"

REM Grant permissions
echo.
echo Granting Cloud Run access to secrets...

set BUILD_SA=%PROJECT_ID%@cloudbuild.gserviceaccount.com

for %%s in (anthropic-api-key grok-api-key jwt-secret database-url) do (
    echo   Granting access to: %%s
    gcloud secrets add-iam-policy-binding %%s ^
        --member="serviceAccount:%BUILD_SA%" ^
        --role="roles/secretmanager.secretAccessor" ^
        --project=%PROJECT_ID% >nul 2>&1
)

echo [OK] Permissions granted
echo.

REM Summary
echo ============================================
echo    Secrets Setup Complete!
echo ============================================
echo.
echo Configured Secrets:
echo   [OK] anthropic-api-key (Claude AI)
echo   [OK] grok-api-key (Grok AI - Failover)
echo   [OK] jwt-secret (Authentication)
echo   [OK] database-url (Database Connection)
echo.
echo Next Steps:
echo   1. Verify secrets: gcloud secrets list --project=%PROJECT_ID%
echo   2. Run deployment: scripts\deploy-production.bat
echo.
echo Manage Secrets:
echo   List: gcloud secrets list
echo   View: gcloud secrets versions access latest --secret=SECRET_NAME
echo   Update: echo NEW_VALUE ^| gcloud secrets versions add SECRET_NAME --data-file=-
echo.
echo ============================================
echo.

pause
goto :eof

REM Function to create a secret
:create_secret
set secret_name=%~1
set prompt_message=%~2

echo.
echo Configuring: %secret_name%

REM Check if secret exists
gcloud secrets describe %secret_name% --project=%PROJECT_ID% >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Secret already exists
    set /p UPDATE="Update existing secret? (y/N) "
    if /i not "!UPDATE!"=="y" (
        echo Skipped
        goto :eof
    )
) else (
    echo Creating new secret...
    gcloud secrets create %secret_name% ^
        --replication-policy="automatic" ^
        --project=%PROJECT_ID%
)

REM Get secret value
set /p secret_value="%prompt_message%: "

REM Handle defaults
if "%secret_name%"=="jwt-secret" if "!secret_value!"=="" (
    REM Generate random hex
    for /f "delims=" %%i in ('powershell -Command "[guid]::NewGuid().ToString('N')"') do set secret_value=%%i
)

if "%secret_name%"=="database-url" if "!secret_value!"=="" (
    set secret_value=sqlite:///./brainspark.db
)

if "!secret_value!"=="" (
    echo Warning: Empty value provided, skipping
    goto :eof
)

REM Add secret version
echo !secret_value! | gcloud secrets versions add %secret_name% ^
    --data-file=- ^
    --project=%PROJECT_ID%

echo [OK] Secret configured

goto :eof
