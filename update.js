module.exports = {
  run: [
    {
      method: "shell.run",
      params: {
        message: ["git pull"]
      }
    },
    {
      method: "notify",
      params: {
        html: "Projekt wurde aktualisiert. Starte es neu, um die Änderungen zu sehen."
      }
    },
    {
      method: "script.start",
      params: {
        uri: "install.js"
      }
    },
    {
      method: "refresh"
    }
  ]
};
