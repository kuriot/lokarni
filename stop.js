module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "pkill -f uvicorn",
          "pkill -f vite"
        ]
      }
    }
  ]
};