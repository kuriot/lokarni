module.exports = {
  title: "Lokarni",
  icon: "./lokarni-icon.png",
  description: "A local media library for managing AI models, prompts, and media, featuring CivitAI import functionality.",
  menu: [{
    html: "Open App",
    href: "{{local.url}}"
  }],
  run: [{
    method: "shell.run",
    params: {
      message: [
        "echo 'Willkommen bei Lokarni - Ihrer lokalen KI-Medienbibliothek!'"
      ]
    }
  }]
}