@echo off
REM ============================================================
REM BrainSpark - Stop Local Development Servers
REM ============================================================
REM Safely stops only BrainSpark servers, not other processes
REM ============================================================

setlocal enabledelayedexpansion

echo.
echo ==============================================================
echo    BrainSpark - Stopping Local Servers
echo ==============================================================
echo.

set "STOPPED_SOMETHING="

REM Kill BrainSpark processes by window title (safer method)
echo Looking for BrainSpark server windows...
echo.

REM Try to close Backend window gracefully first
taskkill /FI "WINDOWTITLE eq BrainSpark Backend*" /T >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Backend server stopped
    set "STOPPED_SOMETHING=1"
)

REM Try to close Frontend window gracefully
taskkill /FI "WINDOWTITLE eq BrainSpark Frontend*" /T >nul 2>&1
if !errorlevel! equ 0 (
    echo [OK] Frontend server stopped
    set "STOPPED_SOMETHING=1"
)

REM Kill any uvicorn processes on port 8000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000.*LISTENING"') do (
    if "%%a" neq "0" (
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Stopped process on port 8000 [PID: %%a]
            set "STOPPED_SOMETHING=1"
        )
    )
)

REM Kill any processes on port 5173 (Vite dev server)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":5173.*LISTENING"') do (
    if "%%a" neq "0" (
        taskkill /PID %%a /F >nul 2>&1
        if !errorlevel! equ 0 (
            echo [OK] Stopped process on port 5173 [PID: %%a]
            set "STOPPED_SOMETHING=1"
        )
    )
)

echo.

if not defined STOPPED_SOMETHING (
    echo [!] No BrainSpark servers found running
    echo.
    echo     If servers are running but not detected, you can:
    echo     1. Close the server terminal windows manually
    echo     2. Or run: taskkill /F /IM node.exe [kills ALL Node processes]
    echo                taskkill /F /IM python.exe [kills ALL Python processes]
) else (
    echo ==============================================================
    echo    All BrainSpark servers stopped successfully
    echo ==============================================================
)

echo.
pause
