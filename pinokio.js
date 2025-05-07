module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    if (info.exists("env")) {
      return [
        { text: "Installieren", href: "install.js" },
        { default: true, text: "Start", href: "start.js" },
        { text: "Stop", href: "stop.js" },
      ];
    } else {
      return [
        { default: true, text: "Installieren", href: "install.js" },
        { text: "Start", href: "start.js" },
        { text: "Stop", href: "stop.js" },
      ];
    }
  }
};