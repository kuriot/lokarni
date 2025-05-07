// pinokio.js - Hauptmodul für die Pinokio-Integration von Lokarni.
// Definiert Titel, Icon und Menüeinträge ("Installieren", "Start/Stop", "Update", "Zurücksetzen").
// "default" wurde entfernt, um automatisches Ausführen beim Öffnen der Integration zu verhindern.
module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");        // Prüft, ob das env-Verzeichnis existiert (Installation erfolgt)
    const isRunning = await kernel.isRunning("start.js"); // Prüft, ob der Start-Prozess läuft (Projekt gestartet)

    const menu = [];

    // Zeige "Installieren", wenn das Projekt noch nicht installiert ist (nur manuelle Ausführung durch Klick)
    if (!installed) {
      menu.push({
        text: "Installieren",
        href: "install.js"
      });
    }

    // Wenn installiert: biete "Start" oder "Stop" an (nur manuelle Ausführung durch Klick, kein automatischer Start)
    if (installed) {
      menu.push({
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js"
      });
    }

    // Weitere Optionen ("Update" und "Zurücksetzen") nur anzeigen, wenn bereits installiert
    if (installed) {
      menu.push(
        {
          text: "Update",
          href: "update.js"
        },
        {
          text: "Zurücksetzen",
          href: "reset.js"
        }
      );
    }

    return menu;
  },
  // URL des laufenden Frontends (wird von start.js in einer lokalen Variablen gesetzt)
  url: async (kernel) => kernel.local.get("url")
};
