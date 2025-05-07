module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: ["python -m venv env"]
      }
    },
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: ["pip install -r requirements.txt"]
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
        html: "✅ Installation abgeschlossen. Du kannst das Projekt jetzt starten."
      }
    }
  ]
};
