module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const isInstalled = await info.exists("env");
    const isRunning = await kernel.isRunning("start.js");

    const menu = [];

    if (!isInstalled) {
      // Nur wenn nicht installiert, zeige "Installieren" und öffne automatisch
      menu.push({
        text: "Installieren",
        href: "install.js",
        default: true
      });
    }

    if (isInstalled) {
      menu.push({
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js",
        default: !isRunning // Start nur aktiv, wenn nicht läuft
      });

      menu.push({
        text: "Update",
        href: "update.js"
      });

      menu.push({
        text: "Zurücksetzen",
        href: "reset.js"
      });
    }

    return menu;
  },
  url: async (kernel) => kernel.local.get("url")
};
