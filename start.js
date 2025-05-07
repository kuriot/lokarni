module.exports = {
  daemon: true,
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        path: "./",
        message: ["uvicorn backend.main:app --port 8000"],
        on: [{ event: "Connected|Uvicorn running on", done: true }]
      }
    },
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm run dev"],
        on: [{ event: "/http:\/\/localhost:5173/", done: true }]
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