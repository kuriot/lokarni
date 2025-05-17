@echo off
title Lokarni Backend
echo [1/3] Aktiviere virtuelle Umgebung...
call venv\Scripts\activate.bat

echo [2/3] Installiere Backend-Abhängigkeiten...
pip install -r requirements.txt

echo [3/3] Starte Backend...
python -m uvicorn backend.main:app --port 8000 --reload
pause
