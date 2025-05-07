module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
        message: [
          "pip install -r requirements.txt",
          "cd frontend && npm install"
        ]
      }
    },
    {
      method: "notify",
      params: {
        html: "Installation abgeschlossen! Klicke auf 'Start', um Lokarni zu starten."
      }
    }
  ]
};
