// start.js - Startet das Lokarni-Backend und -Frontend im Entwicklungsmodus (Uvicorn für FastAPI und Vite Dev-Server).
module.exports = {
  daemon: true,  // Kennzeichnet, dass dieser Prozess im Hintergrund weiterläuft
  run: [
    {
      // 1. Starte den Uvicorn-Server (FastAPI Backend) auf Port 8000 im Ordner "backend"
      method: "shell.run",
      params: {
        path: "backend",
        venv: "env",
        message: [
          "uvicorn main:app --host 127.0.0.1 --port 8000"
        ],
        on: [
          {
            // Fahre mit dem nächsten Schritt fort, sobald Uvicorn die Meldung "running on http://..." ausgibt
            event: /Uvicorn running on http:\/\/[^\s]+/,
            done: true
          }
        ]
      }
    },
    {
      // 2. Starte den Vite-Entwicklungsserver (Frontend) auf Port 5173 im Ordner "frontend"
      method: "shell.run",
      params: {
        path: "frontend",
        message: [
          "npm run dev"
        ],
        on: [
          {
            // Fahre fort, sobald die lokale Entwicklungs-URL (Port 5173) ausgegeben wird.
            // (Berücksichtigt sowohl "localhost" als auch "127.0.0.1" als Host)
            event: /http:\/\/(?:localhost|127\.0\.0\.1):5173\/?/,
            done: true
          }
        ]
      }
    },
    {
      // 3. Speichere die gefundene Frontend-URL in einer lokalen Variablen, damit Pinokio die Web-Oberfläche anzeigen kann
      method: "local.set",
      params: {
        url: "{{input.event[0]}}"
      }
    }
  ]
};
