module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: ["pip install -r requirements.txt"],
      }
    },
    {
      method: "shell.run",
      params: {
        path: "frontend",
        message: ["npm install"]
      }
    },
    {
      method: "notify",
      params: {
        html: "Installation abgeschlossen. Starte das Projekt über den Start-Button."
      }
    }
  ]
};