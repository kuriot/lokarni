@echo off
title Lokarni Frontend
cd /d "%~dp0frontend"
call npm install
call npm run dev
pause
