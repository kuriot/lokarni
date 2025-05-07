module.exports = {
  name: "Lokarni",
  icon: "lokarni-icon.png",
  description: "A local media library for managing AI models, prompts, and media, featuring CivitAI import functionality.",
  type: "web",
  entry: "http://localhost:5173",
  setup: "install.js",
  run: ["start.js"],
  stop: ["stop.js"]
};
