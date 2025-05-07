// install.js - Führt die Erstinstallation des Lokarni-Projekts durch, ohne das Projekt direkt zu starten.
module.exports = {
  run: [
    {
      // Schritt 1: Erstelle ein virtuelles Python-Environment "env" (falls noch nicht vorhanden)
      method: "shell.run",
      params: {
        message: ["python -m venv env"]
      }
    },
    {
      // Schritt 2: Installiere Python-Abhängigkeiten in der virtuellen Umgebung (requirements.txt)
      method: "shell.run",
      params: {
        venv: "env",
        message: ["pip install -r requirements.txt"]
      }
    },
    {
      // Schritt 3: Installiere Node.js-Abhängigkeiten im Frontend-Ordner (npm packages)
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm install"]
      }
    },
    {
      // Schritt 4: Benachrichtige den Nutzer über den erfolgreichen Abschluss der Installation
      method: "notify",
      params: {
        html: "✅ Installation abgeschlossen. Du kannst das Projekt jetzt starten."
      }
    },
    {
      // Schritt 5: Aktualisiere die Benutzeroberfläche (Entferne den Installations-Tab aus dem Menü)
      method: "refresh"
    }
  ]
};
