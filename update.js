// update.js - Pinokio Update für Lokarni
const path = require('path')
const fs = require('fs')
const os = require('os')

/**
 * Update Script für Lokarni im Pinokio-Framework
 * 
 * Dieser Updater führt folgende Schritte aus:
 * 1. Aktualisiert Backend-Abhängigkeiten
 * 2. Aktualisiert Frontend-Abhängigkeiten
 * 3. Führt Datenbankmigrationen durch
 */
module.exports = async (kernel) => {
  // Zuerst beenden wir die laufenden Server
  kernel.print("🔄 Update für Lokarni wird vorbereitet...")
  
  // Einstellungen basierend auf Betriebssystem
  const isWindows = os.platform() === 'win32'
  const venvPath = path.resolve('venv')
  
  // 0. Prüfen ob Server laufen und diese beenden
  const backendPid = kernel.memory.get('backend_pid')
  const frontendPid = kernel.memory.get('frontend_pid')
  
  if (backendPid || frontendPid) {
    kernel.print("⚠️ Server laufen noch - werden beendet...")
    
    try {
      const resetModule = require('./reset')
      await resetModule(kernel)
    } catch (e) {
      kernel.print(`❌ Fehler beim Beenden der Server: ${e.message}`)
      kernel.print("⚠️ Update wird trotzdem fortgesetzt...")
    }
  }
  
  // 1. Überprüfen ob virtuelle Umgebung existiert
  if (!fs.existsSync(venvPath)) {
    kernel.print("❌ Virtuelle Python-Umgebung nicht gefunden!")
    kernel.print("⚠️ Bitte führe zuerst 'install.js' aus")
    return { success: false }
  }

  // 2. Backend-Abhängigkeiten aktualisieren
  kernel.print("\n📦 Aktualisiere Backend-Abhängigkeiten...")
  
  try {
    if (isWindows) {
      await kernel.exec({
        cmd: `venv\\Scripts\\pip install -r requirements.txt --upgrade`
      })
    } else {
      await kernel.exec({
        cmd: `${venvPath}/bin/pip install -r requirements.txt --upgrade`
      })
    }
    kernel.print("✅ Backend-Abhängigkeiten aktualisiert")
  } catch (e) {
    kernel.print(`❌ Fehler beim Aktualisieren der Backend-Abhängigkeiten: ${e.message}`)
    return { success: false }
  }

  // 3. Frontend-Abhängigkeiten aktualisieren
  kernel.print("\n📦 Aktualisiere Frontend-Abhängigkeiten...")
  
  try {
    await kernel.exec({
      cmd: `cd frontend && npm update`
    })
    kernel.print("✅ Frontend-Abhängigkeiten aktualisiert")
  } catch (e) {
    kernel.print(`❌ Fehler beim Aktualisieren der Frontend-Abhängigkeiten: ${e.message}`)
    return { success: false }
  }

  // 4. Alembic Migration aktualisieren
  kernel.print("\n🔄 Führe Datenbankmigrationen aus...")
  
  try {
    if (isWindows) {
      await kernel.exec({
        cmd: `venv\\Scripts\\alembic upgrade head`
      })
    } else {
      await kernel.exec({
        cmd: `${venvPath}/bin/alembic upgrade head`
      })
    }
    kernel.print("✅ Datenbankmigrationen abgeschlossen")
  } catch (e) {
    kernel.print(`⚠️ Warnung bei Datenbankmigrationen: ${e.message}`)
    kernel.print("ℹ️ Das Update wird fortgesetzt, aber es könnten Probleme auftreten")
  }

  // Update abgeschlossen
  kernel.print("\n✨ Lokarni-Update abgeschlossen! ✨")
  kernel.print("ℹ️ Verwende 'start.js' zum erneuten Starten der Anwendung.")
  
  return { success: true }
}