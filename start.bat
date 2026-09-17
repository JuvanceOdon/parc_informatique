@echo off
REM Double-clic pour lancer backend + frontend
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js introuvable. Installez Node.js 20+ puis reessayez.
  pause
  exit /b 1
)

if not exist "node_modules\concurrently" (
  echo Installation des dependances racine...
  call npm install
)

if not exist "backend\node_modules" (
  echo Installation backend...
  call npm install --prefix backend
)

if not exist "frontend\node_modules" (
  echo Installation frontend...
  call npm install --prefix frontend
)

echo.
echo ========================================
echo   Parc Informatique MFA
echo   Backend  : http://localhost:3000
echo   Frontend : http://localhost:5173
echo   Ctrl+C pour arreter
echo ========================================
echo.

call npm run dev
pause
