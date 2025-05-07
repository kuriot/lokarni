module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        venv: "env",
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
        html: "Abhängigkeiten installiert. Klicke auf \"Start\"."
      }
    }
  ]
};