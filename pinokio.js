module.exports = {
  title: "Lokarni",
  icon: "./lokarni-icon.png",
  description: "A local media library for managing AI models, prompts, and media, featuring CivitAI import functionality.",
  menu: async (kernel, info) => {
    // Überprüfen, ob das Frontend bereits installiert ist
    const frontendInstalled = info.exists("frontend/node_modules");
    
    let menuItems = [];
    
    // Basis-Menüelemente
    menuItems.push({
      text: "Install",
      href: "install.js"
    });
    
    menuItems.push({
      text: "Start",
      href: "start.js"
    });
    
    menuItems.push({
      text: "Reset",
      href: "reset.js"
    });
    
    menuItems.push({
      text: "Update",
      href: "update.js"
    });
    
    // Open App Menüpunkt nur anzeigen, wenn eine URL gesetzt ist
    if (kernel.memory.local.url) {
      menuItems.push({
        text: "Open App",
        href: kernel.memory.local.url
      });
    }
    
    // Auto-Execution: Install oder Start als Standard setzen
    if (frontendInstalled) {
      // Bereits installiert - Start als Standard
      menuItems.find(item => item.text === "Start").default = true;
    } else {
      // Noch nicht installiert - Install als Standard
      menuItems.find(item => item.text === "Install").default = true;
    }
    
    return menuItems;
  }
}