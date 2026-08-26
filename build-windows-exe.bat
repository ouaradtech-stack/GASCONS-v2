@echo off
title GASCONS - Compilation du Package EXE Windows
color 0B
cls
echo ========================================================
echo        GASCONS - GENERATEUR EXECUTABLE WINDOWS (.EXE)
echo ========================================================
echo.
echo Ce script va assembler l'application et generer :
echo  1. GASCONS-Setup-1.0.0.exe (Programme d'installation Windows)
echo  2. GASCONS-Portable.exe    (Version autonome sans installation)
echo.
echo Verification des dependances Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas detecte sur votre PC Windows.
    echo Veuillez installer Node.js depuis https://nodejs.org/ puis relancer ce fichier.
    pause
    exit /b
)

echo [1/3] Installation des modules et outils de compilation...
call npm install --save-dev electron electron-builder

echo.
echo [2/3] Compilation de l'interface React / Vite...
call npm run build

echo.
echo [3/3] Creation de l'executable Windows (.EXE) avec Electron-Builder...
call npx electron-builder --win nsis portable

echo.
if exist "release\" (
    echo ========================================================
    echo  SUCCES ! Vos fichiers executables sont prets dans :
    echo  Dossier : \release\
    echo ========================================================
    explorer release
) else (
    echo [INFO] La compilation s'est terminee. Verifiez le dossier \release\ ou \dist\.
)

pause
