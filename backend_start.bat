@echo off
title Lokarni Backend

echo [1/5] Überprüfe Python-Installation...
python --version
if %ERRORLEVEL% neq 0 (
    echo Fehler: Python ist nicht installiert oder nicht im PATH!
    echo Bitte installieren Sie Python und stellen Sie sicher, dass es im PATH ist.
    pause
    exit /b 1
)

echo [2/5] Entferne alte virtuelle Umgebung (falls vorhanden)...
if exist venv (
    rmdir /s /q venv
    if %ERRORLEVEL% neq 0 (
        echo Fehler beim Entfernen der alten virtuellen Umgebung!
        echo Versuchen Sie, den Ordner manuell zu löschen und starten Sie das Skript erneut.
        pause
        exit /b 1
    )
)

echo [3/5] Erstelle neue virtuelle Umgebung...
python -m venv venv
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Erstellen der virtuellen Umgebung!
    echo Bitte stellen Sie sicher, dass Sie Schreibrechte im aktuellen Verzeichnis haben.
    pause
    exit /b 1
)

echo [4/5] Installiere Abhängigkeiten...
call venv\Scripts\activate.bat
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Aktivieren der virtuellen Umgebung!
    pause
    exit /b 1
)

echo Aktualisiere pip...
python -m pip install --upgrade pip

echo Installiere Abhängigkeiten aus requirements.txt...
python -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo Fehler beim Installieren der Abhängigkeiten!
    pause
    exit /b 1
)

echo [5/5] Starte Backend...
python -m uvicorn backend.main:app --port 8000 --reload
pause