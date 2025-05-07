module.exports = {
  daemon: true,
  run: [
    // Backend starten
    {
      method: "shell.run",
      params: {
        daemon: true,
        message: [
          "cd backend && uvicorn main:app --port 8000"
        ]
      }
    },
    // Frontend starten
    {
      method: "shell.run",
      params: {
        message: [
          "cd frontend && npm run dev"
        ],
        on: [{
          "event": "/http:\/\/\\S+/",
          "done": true
        }]
      }
    },
    // URL für das Menü setzen
    {
      method: "local.set",
      params: {
        url: "{{input.event[0]}}"
      }
    }
  ]
}