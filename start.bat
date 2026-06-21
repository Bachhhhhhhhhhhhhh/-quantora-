@echo off
title Quantora Server
color 0B
cd /d "%~dp0"

echo.
echo  ==========================================
echo    QUANTORA - Khoi dong
echo  ==========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [LOI] Chua cai Node.js!
  echo Tai tai: https://nodejs.org
  pause
  exit /b 1
)

echo Node: & node -v
echo NPM:  & npm -v
echo.

echo [1/3] Build...
call npm run build
if errorlevel 1 (
  echo [LOI] Build that bai!
  pause
  exit /b 1
)

echo.
echo [2/3] Khoi dong server port 3000...
echo.
echo  ==========================================
echo   TEST:  http://localhost:3000/ok.html
echo   APP:   http://localhost:3000/
echo.
echo   KHONG DONG CUA SO NAY!
echo  ==========================================
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/ok.html"
start "" "http://localhost:3000/"

echo [3/3] Dang chay server...
call npx --yes serve dist -l 3000

pause