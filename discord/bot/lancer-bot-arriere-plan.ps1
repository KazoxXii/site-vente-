# Bot Discord MALTY — Arriere-plan

Set-Location $PSScriptRoot

Write-Host "Demarrage du bot en arriere-plan..." -ForegroundColor Cyan

# Lancer le bot en arriere-plan
$job = Start-Job -ScriptBlock {
    Set-Location "C:\Users\Administrateur\Documents\SITE WEB\website\discord\bot"
    python bot.py
}

Write-Host "Bot demarre! (Job ID: $($job.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Yellow
Write-Host "  Voir les jobs:   Get-Job" -ForegroundColor White
Write-Host "  Voir les logs:   Receive-Job $($job.Id)" -ForegroundColor White
Write-Host "  Arreter le bot:  Stop-Job $($job.Id)" -ForegroundColor White
Write-Host ""

# Garder le script ouvert
Write-Host "Le bot tourne en arriere-plan. Tu peux fermer cette fenetre." -ForegroundColor Cyan