// pinokio.js
module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");
    const isRunning = await kernel.isRunning("start.js");

    return [
      {
        text: "Installieren",
        href: "install.js",
        default: !installed // Wichtig für Erstinstallation
      },
      {
        text: "Start",
        href: "start.js",
        default: installed && !isRunning
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
