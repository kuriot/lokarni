@echo off
title Lokarni Backend
echo [1/3] Aktiviere virtuelle Umgebung...
call venv\Scripts\activate.bat

echo [2/3] Installiere Backend-Abhängigkeiten...
pip install -r requirements.txt

echo [3/3] Starte Backend...
python -m uvicorn backend.main:app --port 8000 --reload
pause


7768687de41dd8e331bf869a677e71d1




Ich will mein projekt für pinokio verwenden.


Hier eine erklärung aus meinem projekt für die Installieren und Starten:


Voraussetzungen:


Python 3.10+

Node.js 18+ & npm

Empfohlene Startreihenfolge beim ersten Mal:


Backend starten:


Führe backend_start.bat aus und warte, bis alle Abhängigkeiten installiert und das Backend bereit ist.

Frontend starten:

Führe anschließend frontend_start.bat aus und warte, bis alle npm-Abhängigkeiten installiert und das Frontend bereit ist.


Wenn beide die alle nötigen Abhängigkeiten heruntergeladen hat starten sie automatisch


Wenn die Abhängigkeiten bereits heruntergeladen sind startet das Projekt mit backend und frontend. im frontend wird anschließend eine http://localhost:5173/ Adresse angegeben worin das Projekt dann startet. Das backend hat dann den port 8000


im root befinden sich batch dateien:

frontend_start.bat

Code:

@echo off

title Lokarni Frontend

cd /d "%~dp0frontend"

call npm install

call npm run dev

pause


und


backend_start.bat

Code:

@echo off

title Lokarni Backend

echo [1/3] Aktiviere virtuelle Umgebung...

call venv\Scripts\activate.bat


echo [2/3] Installiere Backend-Abhängigkeiten...

pip install -r requirements.txt


echo [3/3] Starte Backend...

python -m uvicorn backend.main:app --port 8000 --reload

pause


Hier ist mein Github projekt: https://github.com/Pixel-Arni/lokarni/


kannst du mir die Dateien install.js, pinokio.js, reset.js, start.js, update.js die ich von gepeto als vorlage bekommen habe so anpassen das mein Projekt damit starten kann?