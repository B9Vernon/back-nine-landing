@echo off
REM ============================================================
REM  NIB2 auto-restart launcher
REM  Double-click this instead of running "npm start" by hand.
REM  Uses Node's --watch flag, so NIB2 automatically restarts itself
REM  the moment any server-side file changes on disk — no more "why
REM  isn't my new feature showing up" (the file was on disk, the OLD
REM  process just hadn't reloaded it). If NIB2 ever crashes outright,
REM  this relaunches it after 3 seconds. To stop NIB2 for good: close
REM  this window.
REM ============================================================
title NIB2 Server (auto-restart + auto-reload)
cd /d "%~dp0"

:loop
echo.
echo [%date% %time%] Starting NIB2...
node --watch server.js
echo.
echo [%date% %time%] NIB2 stopped (exit code %errorlevel%). Restarting in 3s...
echo   (Close this window to stop NIB2 completely.)
timeout /t 3 /nobreak >nul
goto loop
