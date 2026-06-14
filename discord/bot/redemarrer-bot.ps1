# Bot Discord MALTY — Redemarrer le bot

Write-Host "Redemarrage du bot Discord MALTY..." -ForegroundColor Cyan

# Arreter le bot
$jobs = Get-Job | Where-Object { $_.State -eq "Running" }
foreach ($job in $jobs) {
    Stop-Job $job
    Write-Host "Job $($job.Id) arrete." -ForegroundColor Yellow
}

$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
foreach ($process in $pythonProcesses) {
    Stop-Process $process -Force
    Write-Host "Processus Python arrete." -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# Relancer le bot
Write-Host "Redemarrage..." -ForegroundColor Green
& "$PSScriptRoot\lancer-bot-arriere-plan.ps1"