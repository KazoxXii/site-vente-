@echo off
title Bot Discord MALTY
color 0A

echo ========================================
echo    BOT DISCORD MALTY
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Installation des dependances...
pip install -r requirements.txt >nul 2>&1
echo OK
echo.

echo [2/3] Verification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Python n'est pas installe!
    echo Telecharge Python sur: https://python.org
    pause
    exit /b
)
echo OK
echo.

echo [3/3] Lancement du bot...
echo.
echo ========================================
echo   Bot en cours d'execution...
echo   Appuie sur Ctrl+C pour arreter
echo ========================================
echo.

python bot.py

pause