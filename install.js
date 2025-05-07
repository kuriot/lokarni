module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "pip install -r requirements.txt"
        ],
      }
    },
    {
      method: "shell.run",
      params: {
        message: [
          "cd frontend && npm install"
        ],
      }
    },
    {
      method: "notify",
      params: {
        html: "Installation abgeschlossen! Klicken Sie auf den 'start' Tab, um Lokarni zu starten."
      }
    }
  ]
}