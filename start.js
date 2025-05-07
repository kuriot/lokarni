module.exports = {
  daemon: true,
  run: [
    // Backend (uvicorn)
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: ".",
        message: ["uvicorn backend.main:app --host 127.0.0.1 --port 8000"],
        on: [
          {
            event: /Uvicorn running on http:\/\/127\.0\.0\.1:8000/,
            done: true
          }
        ]
      }
    },
    // Frontend (Vite)
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm run dev"],
        on: [
          {
            event: /http:\/\/localhost:5173/,
            done: true
          }
        ]
      }
    },
    // Übergabe an pinokio.js
    {
      method: "local.set",
      params: {
        url: "{{input.event[0]}}"
      }
    }
  ]
};
