@echo off
title Lokarni Backend

echo [1/3] Checking Python installation...
python --version
if %ERRORLEVEL% neq 0 (
    echo Error: Python is not installed or not in PATH!
    echo Please install Python and make sure it's in your PATH.
    pause
    exit /b 1
)

echo [2/3] Setting up environment...
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% neq 0 (
        echo Error creating virtual environment!
        pause
        exit /b 1
    )
)

echo Activating virtual environment...
call venv\Scripts\activate.bat
if %ERRORLEVEL% neq 0 (
    echo Error activating virtual environment!
    pause
    exit /b 1
)

echo Installing/updating dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m pip install Pillow --upgrade

echo [3/3] Starting backend server...
python -m uvicorn backend.main:app --port 8000 --reload
pause