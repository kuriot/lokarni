module.exports = {
  daemon: true,
  run: [
    // Backend starten
    {
      method: "shell.run",
      params: {
        daemon: true,
        message: [
          "cd backend && uvicorn main:app --host 0.0.0.0 --port 8000"
        ],
        on: [{
          "event": "/(Application startup complete|Uvicorn running on|Started server)/",
          "done": true
        }]
      }
    },
    // Frontend starten
    {
      method: "shell.run",
      params: {
        daemon: true,
        message: [
          "cd frontend && npm run dev"
        ],
        on: [{
          "event": "/(Local:|http:\/\/localhost:)/",
          "done": true
        }]
      }
    },
    // Kurze Pause, um sicherzustellen, dass die Server bereit sind
    {
      method: "shell.run",
      params: {
        message: [
          "sleep 2"
        ]
      }
    },
    // URL für das Menü setzen (auf die Frontend-URL)
    {
      method: "local.set",
      params: {
        url: "http://localhost:5173"
      }
    },
    {
      method: "notify",
      params: {
        html: "Lokarni läuft jetzt! Sie können die Anwendung über den 'Open App' Tab öffnen."
      }
    }
  ]
}