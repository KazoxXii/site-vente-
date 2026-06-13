# Bot Discord MALTY — Arreter le bot

Write-Host "Arret du bot Discord MALTY..." -ForegroundColor Yellow

$jobs = Get-Job | Where-Object { $_.State -eq "Running" }

if ($jobs) {
    foreach ($job in $jobs) {
        Stop-Job $job
        Write-Host "Job $($job.Id) arrete." -ForegroundColor Green
    }
} else {
    Write-Host "Aucun bot en cours d'execution." -ForegroundColor Yellow
}

# Aussi arreter les processus Python
$pythonProcesses = Get-Process python -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    foreach ($process in $pythonProcesses) {
        Stop-Process $process -Force
        Write-Host "Processus Python $($process.Id) arrete." -ForegroundColor Green
    }
}

Write-Host "Bot arrete avec succes!" -ForegroundColor Green
Read-Host "Appuie sur Entree pour continuer"