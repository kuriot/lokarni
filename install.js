module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "venv",
        message: [
          "pip install -r requirements.txt"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        message: [
          "cd frontend && npm install"
        ]
      }
    },
    {
      method: "notify",
      params: {
        html: "Installation abgeschlossen. Starte Lokarni über den Start-Tab."
      }
    }
  ]
};
