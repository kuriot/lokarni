module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "venv",
        path: "backend",
        message: [
          "uvicorn main:app --port 8000"
        ],
        on: [{
          event: /Uvicorn running on http:\/\/[0-9.:]+/,
          done: true
        }]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: [
          "npm run dev"
        ],
        on: [{
          event: /http:\/\/localhost:5173/,
          done: true
        }]
      }
    },
    {
      method: "local.set",
      params: {
        url: "http://localhost:5173"
      }
    }
  ]
};
