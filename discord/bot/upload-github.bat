@echo off
title Upload GitHub — Bot MALTY
color 0A

echo ========================================
echo    UPLOAD GITHUB — BOT MALTY
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Initialisation du repository Git...
git init >nul 2>&1
echo OK
echo.

echo [2/5] Ajout des fichiers...
git add .
echo OK
echo.

echo [3/5] Premier commit...
git commit -m "Initial commit — Bot Discord MALTY" >nul 2>&1
echo OK
echo.

echo [4/5] Connexion a GitHub...
echo.
echo Entre l'URL de ton repository GitHub :
echo (ex: https://github.com/TON-UTILISATEUR/bot-discord-malty.git)
echo.
set /p REPO_URL="URL : "
echo.

git remote add origin %REPO_URL% >nul 2>&1
echo OK
echo.

echo [5/5] Envoi sur GitHub...
git push -u origin master
echo.

echo ========================================
echo   TERMINE ! Le bot est sur GitHub.
echo   Maintenant, va sur Railway.app
echo ========================================
echo.

pause