// update.js - Aktualisiert das Projekt (holt neueste Änderungen aus Git und installiert Abhängigkeiten neu).
module.exports = {
  run: [
    {
      // Schritt 1: Stoppe laufende Lokarni-Prozesse, um das Update sicher durchzuführen
      method: "shell.run",
      params: {
        message: process.platform === 'win32'
          ? [
              "taskkill /F /T /IM uvicorn.exe",
              "wmic process where \"commandline like '%vite%'\" delete"
            ]
          : [
              "pkill -f uvicorn",
              "pkill -f vite"
            ]
      }
    },
    {
      // Schritt 2: Leere die gespeicherte URL (verhindert Anzeige einer alten UI während des Updates)
      method: "local.set",
      params: {
        url: ""
      }
    },
    {
      // Schritt 3: Hole die neuesten Änderungen aus dem Git-Repository (git pull)
      method: "shell.run",
      params: {
        message: ["git pull"]
      }
    },
    {
      // Schritt 4: Aktualisiere Python-Abhängigkeiten in der virtuellen Umgebung (falls Requirements geändert wurden)
      method: "shell.run",
      params: {
        venv: "env",
        message: ["pip install -r requirements.txt"]
      }
    },
    {
      // Schritt 5: Aktualisiere Node.js-Abhängigkeiten im Frontend (falls sich die Paketliste geändert hat)
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm install"]
      }
    },
    {
      // Schritt 6: Benachrichtige den Nutzer über das erfolgreiche Update (Neustart des Projekts erforderlich)
      method: "notify",
      params: {
        html: "Projekt wurde aktualisiert. Starte es neu, um die Änderungen zu sehen."
      }
    },
    {
      // Schritt 7: Aktualisiere die Benutzeroberfläche
      method: "refresh"
    }
  ]
};
