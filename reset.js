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
        html: "Projekt wurde zurückgesetzt. Klicke auf <b>Installieren</b>, um neu zu starten."
      }
    },
    {
      method: "refresh"
    }
  ]
};
