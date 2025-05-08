@echo off
cd /d "%~dp0"

REM ===== Python erkennen oder mitliefern =====
if exist python\python.exe (
    set PYTHON=python\python.exe
) else (
    where python >nul 2>nul || (
        echo Python wurde nicht gefunden. Bitte installiere Python 3.10+ oder lege python\python.exe ab.
        pause
        exit /b
    )
    set PYTHON=python
)

REM ===== venv erstellen =====
if not exist venv (
    echo [1/4] Erstelle virtuelle Umgebung...
    %PYTHON% -m venv venv
)

REM ===== Aktivieren =====
call venv\Scripts\activate.bat

REM ===== Anforderungen installieren =====
echo [2/4] Installiere Abhängigkeiten...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

REM ===== Backend starten =====
echo [3/4] Starte Backend...
python -m uvicorn backend.main:app --port 8000 --reload

pause
