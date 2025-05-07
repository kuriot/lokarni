// pinokio.js
module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");
    return [
      {
        text: "Installieren",
        href: "install.js",
        // automatisch öffnen, wenn env nicht existiert
        default: !installed
      },
      {
        text: "Start",
        href: "start.js",
        // automatisch starten, wenn env schon da ist
        default: installed
      },
      {
        text: "Stop",
        href: "stop.js"
      },
      {
        text: "Update",
        href: "update.js"
      },
      {
        text: "Zurücksetzen",
        href: "reset.js"
      }
    ];
  },
  url: async (kernel) => kernel.local.get("url")
};
