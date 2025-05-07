module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "pkill -f uvicorn || echo 'Backend bereits gestoppt'"
        ]
      }
    },
    {
      method: "shell.run",
      params: {
        message: [
          "pkill -f vite || echo 'Frontend bereits gestoppt'"
        ]
      }
    },
    {
      method: "notify",
      params: {
        html: "Lokarni wurde erfolgreich gestoppt"
      }
    }
  ]
}