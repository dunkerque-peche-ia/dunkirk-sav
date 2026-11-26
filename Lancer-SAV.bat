@echo off
title SAV Dunkirk Informatique
color 0B
echo ============================================================
echo           LANCEMENT SAV DUNKIRK INFORMATIQUE
echo ============================================================
echo.
cd /d "C:\Users\ToshibaZ30\.gemini\antigravity-ide\scratch\dunkirk-sav"
echo Demarrage du serveur SAV en cours...
echo Une fois que le serveur est pret, ouvrez votre navigateur sur :
echo http://127.0.0.1:3005
echo.
timeout /t 3 /nobreak >nul
start http://127.0.0.1:3005
call npm.cmd run dev
pause
