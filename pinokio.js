module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const hasInstall = await info.exists("install.js");
    const hasEnv = await info.exists("env");
    const isRunning = await kernel.isRunning("start.js");

    // Menüeinträge dynamisch bauen
    const menu = [];

    if (hasInstall && !hasEnv) {
      menu.push({
        default: true,
        text: "Installieren",
        href: "install.js"
      });
    }

    if (hasEnv) {
      menu.push({
        default: !isRunning,
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js"
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
  }
};
