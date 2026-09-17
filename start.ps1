# Lance backend + frontend depuis la racine du projet.
# Usage : .\start.ps1
# Options :
#   .\start.ps1 -Install   # installe les dépendances avant de démarrer

param(
  [switch]$Install
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

function Ensure-Node {
  if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js est introuvable. Installez Node.js 20+ puis réessayez."
  }
  if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm est introuvable."
  }
}

Ensure-Node

if ($Install -or -not (Test-Path "$Root\node_modules\concurrently")) {
  Write-Host ">> Installation des dépendances racine..." -ForegroundColor Cyan
  npm install
}

if ($Install -or -not (Test-Path "$Root\backend\node_modules")) {
  Write-Host ">> Installation backend..." -ForegroundColor Cyan
  npm install --prefix backend
}

if ($Install -or -not (Test-Path "$Root\frontend\node_modules")) {
  Write-Host ">> Installation frontend..." -ForegroundColor Cyan
  npm install --prefix frontend
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Parc Informatique MFA — démarrage" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:3000" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Ctrl+C pour arrêter les deux" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

npm run dev
