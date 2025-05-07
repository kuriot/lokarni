// pinokio.js
module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");
    const isRunning = await kernel.isRunning("start.js");

    const menu = [];

    // Zeige "Installieren", wenn nicht installiert
    if (!installed) {
      menu.push({
        default: true,
        text: "Installieren",
        href: "install.js"
      });
    }

    // Zeige "Start" oder "Stop", je nach Zustand
    if (installed) {
      menu.push({
        default: !isRunning,
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js"
      });
    }

    // Weitere Optionen nur wenn installiert
    if (installed) {
      menu.push(
        {
          text: "Update",
          href: "update.js"
        },
        {
          text: "Zurücksetzen",
          href: "reset.js"
        }
      );
    }

    return menu;
  },
  url: async (kernel) => kernel.local.get("url")
};
