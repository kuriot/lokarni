// pinokio.js - Konfiguration für Lokarni

module.exports = {
  title: "Lokarni",
  description: "Asset-Management-System für AI-Bildgenerierung mit CivitAI-Integration",
  icon: "lokarni-icon.png",
  menu: [{
    html: "<i class='fa-solid fa-download'></i> Installieren",
    href: "install",
    type: "install"
  }, {
    html: "<i class='fa-solid fa-play'></i> Starten",
    href: "start",
    type: "start"
  }, {
    html: "<i class='fa-solid fa-stop'></i> Beenden",
    href: "reset",
    type: "reset"
  }, {
    html: "<i class='fa-solid fa-arrows-rotate'></i> Aktualisieren",
    href: "update",
    type: "update"
  }],
  version: "1.0.0",
  author: {
    name: "Pixel-Arni",
    url: "https://github.com/Pixel-Arni/lokarni"
  },
  repository: {
    url: "https://github.com/Pixel-Arni/lokarni"
  },
  dependencies: [{
    name: "Python",
    version: ">=3.10.0",
    url: "https://www.python.org/downloads/"
  }, {
    name: "Node.js",
    version: ">=18.0.0",
    url: "https://nodejs.org/"
  }],
  env: {
    PYTHONIOENCODING: "UTF-8",
  },
  tags: ["ai", "stable-diffusion", "asset-management", "civitai", "lora", "model-management"],
  // Nützliche Links für die Dokumentation
  links: [{
    label: "Benutzeranleitung",
    href: "https://github.com/Pixel-Arni/lokarni#readme"
  }, {
    label: "GitHub-Repository",
    href: "https://github.com/Pixel-Arni/lokarni"
  }]
}