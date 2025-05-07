module.exports = {
  run: [
    {
      method: "shell.kill",
      params: {
        name: "uvicorn"
      }
    },
    {
      method: "shell.kill",
      params: {
        name: "vite"
      }
    }
  ]
};
