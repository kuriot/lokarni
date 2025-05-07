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
        default: !installed,
        disabled: installed
      },
      {
        text: isRunning ? "Stop" : "Start",
        href: isRunning ? "stop.js" : "start.js",
        default: installed && !isRunning,
        disabled: !installed
      },
      {
        text: "Update",
        href: "update.js",
        disabled: !installed
      },
      {
        text: "Zurücksetzen",
        href: "reset.js",
        disabled: !installed
      }
    ];
  },
  url: async (kernel) => kernel.local.get("url")
};
