// start.js
module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        path: "backend",
        venv: "env",
        message: [
          "uvicorn main:app --host 127.0.0.1 --port 8000"
        ],
        on: [
          {
            event: /Uvicorn running on http:\/\/[^\s]+/,
            done: true
          }
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: [
          "npm run dev"
        ],
        on: [
          {
            event: /http:\/\/localhost:5173/,
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
