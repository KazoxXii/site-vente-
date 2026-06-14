# Bot Discord MALTY — Voir les logs

Write-Host "Logs du bot Discord MALTY:" -ForegroundColor Cyan
Write-Host ""

$jobs = Get-Job | Where-Object { $_.State -eq "Running" }

if ($jobs) {
    foreach ($job in $jobs) {
        Write-Host "Job $($job.Id):" -ForegroundColor Yellow
        Receive-Job $job -NoWait
    }
} else {
    Write-Host "Aucun bot en cours d'execution." -ForegroundColor Yellow
}

Write-Host ""
Read-Host "Appuie sur Entree pour continuer"