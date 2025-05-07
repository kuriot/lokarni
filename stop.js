// stop.js - Stoppt das laufende Lokarni-Projekt (Backend und Frontend) und bereinigt den Zustand.
module.exports = {
  run: [
    {
      // Beende alle laufenden Uvicorn- und Vite-Prozesse (unterschiedliche Befehle für Windows vs. Linux/Mac)
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
      // Entferne die gespeicherte URL (verhindert eine veraltete oder doppelte Anzeige nach dem Stopp)
      method: "local.set",
      params: {
        url: ""
      }
    }
  ]
};
