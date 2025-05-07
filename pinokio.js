module.exports = {
  title: "Lokarni",
  icon: "./lokarni-icon.png", // Icon im Root-Verzeichnis
  description: "A local media library for managing AI models, prompts, and media, featuring CivitAI import functionality.",
  menu: [{
    html: "Open App",
    href: "http://localhost:5173"
  }],
  start: {
    run: [{
      message: "Starting Lokarni...",
      path: ".",
      loader: true,
      src: "start.js"
    }]
  },
  stop: {
    run: [{
      message: "Stopping Lokarni...",
      path: ".",
      loader: true,
      src: "stop.js"
    }]
  },
  env: true
}