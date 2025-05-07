module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: [
          "cd frontend && npm run dev"
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
}
