@echo off
title Quantora Dev Server
cd /d "%~dp0"
echo.
echo  ========================================
echo   QUANTORA - Starting dev server...
echo   Open: http://localhost:5173/
echo  ========================================
echo.
npm run dev
pause