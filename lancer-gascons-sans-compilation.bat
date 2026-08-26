@echo off
title GASCONS - Bureau
cls
echo Lancement de GASCONS en Mode Application Desktop...

:: Lance l'application dans une fenetre autonome dediee via le moteur natif Windows (Edge/Chrome app mode)
set "APP_URL=http://localhost:3000"

:: Demarrage du serveur local si necessaire
start /b cmd /c "npm run dev"

:: Attente 2 secondes pour boot
timeout /t 2 /nobreak >nul

:: Ouvre dans une fenetre Desktop dediee sans barre de navigation
start msedge --app="%APP_URL%" --window-size=1400,900 || start chrome --app="%APP_URL%" --window-size=1400,900
exit
