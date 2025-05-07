module.exports = {
  title: "Lokarni",
  icon: "lokarni-icon.png",
  menu: async (kernel, info) => {
    const isInstalled = await info.exists("env");
    return [
      {
        text: "Installieren",
        href: "install.js",
        selected: !isInstalled
      },
      {
        text: "Start",
        href: "start.js",
        selected: isInstalled,
        pinned: true
      },
      {
        text: "Stop",
        href: "stop.js"
      }
    ];
  }
};
