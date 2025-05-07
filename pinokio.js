module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");

    return [
      {
        text: "Installieren",
        href: "install.js",
        default: !installed // <- ganz wichtig für Erstinstallation
      },
      {
        text: "Start",
        href: "start.js",
        default: installed // <- Standardaktion nach Installation
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
