// install.js - Pinokio Installation für Lokarni
const os = require('os')
const path = require('path')
const fs = require('fs')

/**
 * Installation Script für Lokarni im Pinokio-Framework
 * 
 * Dieser Installer führt folgende Schritte aus:
 * 1. Python virtuelle Umgebung erstellen
 * 2. Backend Dependencies installieren
 * 3. Frontend Dependencies installieren
 */
module.exports = async (kernel) => {
  const homedir = kernel.memory.get('home')
  
  // Python-Umgebungspfad
  const venvPath = path.resolve('venv')
  
  // Einstellungen basierend auf Betriebssystem
  const isWindows = os.platform() === 'win32'
  const pythonCommand = isWindows ? 'python' : 'python3'
  const venvActivate = isWindows ? 
    path.join(venvPath, 'Scripts', 'activate.bat') : 
    `. ${path.join(venvPath, 'bin', 'activate')}`
  
  // Fortschritt-Tracker
  let progress = 0
  
  // 1. Prüfen ob Python installiert ist
  kernel.print("🔍 Prüfe Python-Installation...")
  try {
    const pythonCheck = await kernel.exec({
      cmd: `${pythonCommand} --version`
    })
    kernel.print(`✅ ${pythonCheck.response.trim()} gefunden.`)
  } catch (e) {
    kernel.print("❌ Python ist nicht installiert oder nicht im PATH")
    kernel.print("⚠️ Bitte installiere Python 3.10+ und versuche es erneut")
    throw new Error("Python nicht gefunden")
  }
  
  // 2. Virtuelle Umgebung für Python erstellen
  kernel.print("\n🔧 Erstelle virtuelle Python-Umgebung...")
  progress += 10
  kernel.print(`📊 Fortschritt: ${progress}%`)
  
  try {
    // Prüfen ob venv bereits existiert
    if (fs.existsSync(venvPath)) {
      kernel.print("🔄 Virtuelle Umgebung existiert bereits - wird übersprungen")
    } else {
      await kernel.exec({
        cmd: `${pythonCommand} -m venv venv`
      })
      kernel.print("✅ Virtuelle Umgebung erstellt")
    }
  } catch (e) {
    kernel.print(`❌ Fehler beim Erstellen der virtuellen Umgebung: ${e.message}`)
    throw e
  }
  
  // 3. Backend-Abhängigkeiten installieren
  kernel.print("\n📦 Installiere Backend-Abhängigkeiten...")
  progress += 20
  kernel.print(`📊 Fortschritt: ${progress}%`)
  
  try {
    if (isWindows) {
      await kernel.exec({
        cmd: `venv\\Scripts\\pip install -r requirements.txt`
      })
    } else {
      await kernel.exec({
        cmd: `${venvPath}/bin/pip install -r requirements.txt`
      })
    }
    kernel.print("✅ Backend-Abhängigkeiten installiert")
  } catch (e) {
    kernel.print(`❌ Fehler beim Installieren der Backend-Abhängigkeiten: ${e.message}`)
    throw e
  }
  
  // 4. Frontend-Abhängigkeiten installieren
  kernel.print("\n📦 Installiere Frontend-Abhängigkeiten...")
  progress += 30
  kernel.print(`📊 Fortschritt: ${progress}%`)
  
  try {
    await kernel.exec({
      cmd: `cd frontend && npm install`
    })
    kernel.print("✅ Frontend-Abhängigkeiten installiert")
  } catch (e) {
    kernel.print(`❌ Fehler beim Installieren der Frontend-Abhängigkeiten: ${e.message}`)
    throw e
  }
  
  // 5. Erstelle erforderliche Verzeichnisse
  kernel.print("\n📂 Erstelle Verzeichnisse für Medien...")
  progress += 10
  kernel.print(`📊 Fortschritt: ${progress}%`)
  
  try {
    // Erstelle import/images Verzeichnis wenn es nicht existiert
    const imagesPath = path.join('import', 'images')
    if (!fs.existsSync(imagesPath)) {
      fs.mkdirSync(imagesPath, { recursive: true })
      kernel.print(`✅ Verzeichnis '${imagesPath}' erstellt`)
    } else {
      kernel.print(`ℹ️ Verzeichnis '${imagesPath}' existiert bereits`)
    }
  } catch (e) {
    kernel.print(`⚠️ Warnung: Konnte Verzeichnisse nicht erstellen: ${e.message}`)
    // Wir werfen hier keinen Fehler, da dies nicht kritisch ist
  }
  
  // 6. Alembic Migration ausführen
  kernel.print("\n🔄 Führe Datenbankmigrationen aus...")
  progress += 10
  kernel.print(`📊 Fortschritt: ${progress}%`)
  
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
    kernel.print("⚠️ Die Installation wird fortgesetzt, aber es könnten Probleme auftreten")
    // Wir setzen fort, da die Migration möglicherweise nicht nötig ist
  }
  
  // Installation abgeschlossen
  progress = 100
  kernel.print(`📊 Fortschritt: ${progress}%`)
  kernel.print("\n✨ Lokarni-Installation abgeschlossen! ✨\n")
  kernel.print("ℹ️ Verwende 'start.js' zum Starten der Anwendung.")
  
  return {
    success: true,
    venvPath: venvPath,
    isWindows: isWindows
  }
}