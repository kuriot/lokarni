// reset.js - Setzt die Lokarni-Installation zurück (Entfernt Umgebungen/Abhängigkeiten, um eine Neuinstallation zu ermöglichen).
module.exports = {
  run: [
    {
      // Schritt 1: Stoppe laufende Prozesse, falls das Projekt noch läuft (bevor Dateien entfernt werden)
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
      // Schritt 2: Entferne das Python-Environment und die Node-Module, um einen sauberen Zustand herzustellen
      method: "fs.remove",
      params: {
        paths: [
          "env",
          "frontend/node_modules",
          "frontend/package-lock.json"
        ]
      }
    },
    {
      // Schritt 3: Setze die gespeicherte URL zurück (lösche ggf. die zuletzt bekannte Frontend-Adresse)
      method: "local.set",
      params: {
        url: ""
      }
    },
    {
      // Schritt 4: Benachrichtige den Nutzer, dass das Projekt zurückgesetzt wurde
      method: "notify",
      params: {
        html: "Projekt wurde zurückgesetzt. Klicke auf <b>Installieren</b>, um neu zu starten."
      }
    },
    {
      // Schritt 5: Aktualisiere die UI (nach dem Zurücksetzen wird wieder die Installations-Option angezeigt)
      method: "refresh"
    }
  ]
};
