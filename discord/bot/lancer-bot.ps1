# Bot Discord MALTY — Lanceur PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BOT DISCORD MALTY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier du script
Set-Location $PSScriptRoot

# Installer les dependances
Write-Host "[1/3] Installation des dependances..." -ForegroundColor Yellow
pip install -r requirements.txt -q
Write-Host "OK" -ForegroundColor Green
Write-Host ""

# Verifier Python
Write-Host "[2/3] Verification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "OK: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Python n'est pas installe!" -ForegroundColor Red
    Write-Host "Telecharge Python sur: https://python.org" -ForegroundColor Yellow
    Read-Host "Appuie sur Entree pour continuer"
    exit 1
}
Write-Host ""

# Lancer le bot
Write-Host "[3/3] Lancement du bot..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Bot en cours d'execution..." -ForegroundColor Green
Write-Host "  Appuie sur Ctrl+C pour arreter" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

python bot.py