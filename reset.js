// reset.js
module.exports = {
  run: [
    {
      method: "fs.remove",
      params: {
        paths: [
          "env",
          "frontend/node_modules",
          "frontend/package-lock.json"
        ]
      }
    },
    {
      method: "notify",
      params: {
        html: "Das Projekt wurde zur Neuinstallation zurückgesetzt. Die Installation startet jetzt automatisch..."
      }
    },
    {
      method: "script.start",
      params: {
        uri: "install.js"
      }
    }
  ]
};
