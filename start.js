module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "backend",
        message: ["uvicorn main:app --port 8000 --host 127.0.0.1"],
        on: [
          {
            event: /Uvicorn running on http:\/\/\S+/,
            done: true
          }
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm run dev"],
        on: [
          {
            event: /http:\/\/\S+/,
            done: true
          }
        ]
      }
    },
    {
      method: "local.set",
      params: {
        url: "{{input.event[0]}}"
      }
    }
  ]
};