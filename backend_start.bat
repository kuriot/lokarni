@echo off
title Lokarni Backend

REM Setze Projektverzeichnis
set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

REM Prüfen, ob venv existiert
if not exist "venv\Scripts\activate.bat" (
    echo [1/5] Erstelle virtuelle Umgebung...
    python -m venv venv
)

REM Aktivieren der virtuellen Umgebung
echo [2/5] Aktiviere virtuelle Umgebung...
call venv\Scripts\activate.bat

REM Installiere Abhängigkeiten
echo [3/5] Installiere Backend-Abhängigkeiten...
pip install --upgrade pip >nul
pip install -r requirements.txt

REM Starte Backend
echo [4/5] Starte Backend...
python -m uvicorn backend.main:app --port 8000 --reload

REM Offen lassen
echo [5/5] Backend wurde beendet. Drücke eine Taste zum Schließen...
pause
