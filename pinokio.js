module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    if (await info.exists("env")) {
      return [
        { text: "Installieren", href: "install.js" },
        { text: "Starten", href: "start.js", default: true },
        { text: "Stoppen", href: "stop.js" },
        { text: "Aktualisieren", href: "update.js" },
        { text: "Zurücksetzen", href: "reset.js" }
      ];
    } else {
      return [
        { text: "Installieren", href: "install.js", default: true },
        { text: "Starten", href: "start.js" }
      ];
    }
  }
};
