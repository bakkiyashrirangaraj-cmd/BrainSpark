@echo off
REM ============================================================
REM BrainSpark - Stop Local Development Servers
REM ============================================================

echo.
echo ==============================================================
echo    BrainSpark - Stopping Local Servers
echo ==============================================================
echo.

echo Stopping Node.js processes (Frontend)...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Node.js processes stopped
) else (
    echo [!] No Node.js processes found
)

echo.
echo Stopping Python processes (Backend)...
taskkill /F /IM python.exe 2>nul
if %errorlevel% equ 0 (
    echo [OK] Python processes stopped
) else (
    echo [!] No Python processes found
)

echo.
echo ==============================================================
echo    All BrainSpark servers stopped
echo ==============================================================
echo.

pause
