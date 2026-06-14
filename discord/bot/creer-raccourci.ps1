# Creer un raccourci sur le Bureau

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$Home\Desktop\Bot Discord MALTY.lnk")
$Shortcut.TargetPath = "powershell.exe"
$Shortcut.Arguments = "-ExecutionPolicy Bypass -File `"$PSScriptRoot\lancer-bot.ps1`""
$Shortcut.WorkingDirectory = $PSScriptRoot
$Shortcut.Description = "Bot Discord MALTY"
$Shortcut.IconLocation = "powershell.exe,0"
$Shortcut.Save()

Write-Host "Raccourci cree sur le Bureau!" -ForegroundColor Green
Read-Host "Appuie sur Entree pour continuer"