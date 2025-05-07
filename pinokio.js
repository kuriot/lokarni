// pinokio.js
module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const installed = await info.exists("env");
    const isRunning = await kernel.isRunning("start.js");

    return [
      ...(installed ? [] : [{
        default: true,
        text: "Installieren",
        href: "install.js"
      }]),
      ...(installed ? [{
        default: !isRunning,
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js"
      }] : []),
      ...(installed ? [{
        text: "Update",
        href: "update.js"
      }, {
        text: "Zurücksetzen",
        href: "reset.js"
      }] : [])
    ];
  }
};
