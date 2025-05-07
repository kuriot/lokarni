module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: [
          "uvicorn backend.main:app --port 8000"
        ],
        on: [{
          event: /http:\/\/\S+/,
          done: true
        }]
      }
    },
    {
      method: "shell.run",
      params: {
        message: [
          "cd frontend && npm run dev"
        ],
        on: [{
          event: /http:\/\/\S+/,
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
