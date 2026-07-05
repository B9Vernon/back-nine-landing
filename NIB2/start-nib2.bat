@echo off
REM ============================================================
REM  NIB2 auto-restart launcher
REM  Double-click this instead of running "npm start" by hand.
REM  If NIB2 ever crashes, this relaunches it automatically after
REM  3 seconds. To stop NIB2 for good: close this window.
REM ============================================================
title NIB2 Server (auto-restart)
cd /d "%~dp0"

:loop
echo.
echo [%date% %time%] Starting NIB2...
node server.js
echo.
echo [%date% %time%] NIB2 stopped (exit code %errorlevel%). Restarting in 3s...
echo   (Close this window to stop NIB2 completely.)
timeout /t 3 /nobreak >nul
goto loop
