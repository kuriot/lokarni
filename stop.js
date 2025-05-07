module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: [
          "taskkill /F /IM uvicorn.exe /T",
          "taskkill /F /IM node.exe /T"
        ]
      }
    }
  ]
};