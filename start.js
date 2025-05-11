// start.js - Pinokio Starter für Lokarni
const os = require('os')
const path = require('path')
const fs = require('fs')
const open = require('open')

/**
 * Starter Script für Lokarni im Pinokio-Framework
 * 
 * Dieser Starter führt folgende Schritte aus:
 * 1. Startet das Backend
 * 2. Startet das Frontend
 * 3. Öffnet den Browser mit der Anwendung
 */
module.exports = async (kernel) => {
  // Einstellungen basierend auf Betriebssystem
  const isWindows = os.platform() === 'win32'
  const venvPath = path.resolve('venv')
  
  // Backend-Port
  const backendPort = 8000
  const frontendPort = 5173
  const frontendUrl = `http://localhost:${frontendPort}`
  
  // 1. Start Backend-Server
  kernel.print("🚀 Starte Backend-Server...")
  
  try {
    // Prüfen ob venv existiert
    if (!fs.existsSync(venvPath)) {
      kernel.print("❌ Virtuelle Python-Umgebung nicht gefunden!")
      kernel.print("⚠️ Bitte führe zuerst 'install.js' aus")
      return { success: false }
    }

    // Backend in einem neuen Prozess starten und Prozess-ID speichern
    const backendProcess = isWindows ?
      kernel.spawn({
        cmd: `cmd`,
        args: ['/c', 'venv\\Scripts\\python.exe', '-m', 'uvicorn', 'backend.main:app', '--port', backendPort, '--reload'],
        on: {
          stdout: (data) => {
            kernel.print(`[Backend] ${data}`)
          },
          stderr: (data) => {
            kernel.print(`[Backend-Fehler] ${data}`)
          }
        }
      }) :
      kernel.spawn({
        cmd: `${venvPath}/bin/python`,
        args: ['-m', 'uvicorn', 'backend.main:app', '--port', backendPort, '--reload'],
        on: {
          stdout: (data) => {
            kernel.print(`[Backend] ${data}`)
          },
          stderr: (data) => {
            kernel.print(`[Backend-Fehler] ${data}`)
          }
        }
      });

    // Speichere die Backend-Prozess-ID für späteren Zugriff
    kernel.memory.set('backend_pid', backendProcess.pid)
    kernel.print(`✅ Backend gestartet (PID: ${backendProcess.pid})`)
    
    // Warten bis der Backend-Server bereit ist
    kernel.print("⏳ Warte auf Backend-Server...")
    await new Promise(resolve => setTimeout(resolve, 3000))
    
  } catch (e) {
    kernel.print(`❌ Fehler beim Starten des Backend-Servers: ${e.message}`)
    return { success: false }
  }

  // 2. Start Frontend-Server
  kernel.print("\n🚀 Starte Frontend-Server...")
  
  try {
    // Frontend in einem neuen Prozess starten und Prozess-ID speichern
    const frontendProcess = kernel.spawn({
      cmd: "npm",
      args: ["run", "dev"],
      opt: { 
        cwd: path.join(process.cwd(), 'frontend')
      },
      on: {
        stdout: (data) => {
          kernel.print(`[Frontend] ${data}`)
          
          // Wenn das Frontend bereit ist, öffne den Browser
          if (data.includes("VITE") && data.includes("ready")) {
            kernel.print("\n🌐 Frontend bereit! Öffne im Browser...")
            open(frontendUrl)
          }
        },
        stderr: (data) => {
          kernel.print(`[Frontend-Fehler] ${data}`)
        }
      }
    });

    // Speichere die Frontend-Prozess-ID für späteren Zugriff
    kernel.memory.set('frontend_pid', frontendProcess.pid)
    kernel.print(`✅ Frontend-Server gestartet (PID: ${frontendProcess.pid})`)
    
  } catch (e) {
    kernel.print(`❌ Fehler beim Starten des Frontend-Servers: ${e.message}`)
    // Wir müssen auch den Backend-Server beenden, falls er gestartet wurde
    const backendPid = kernel.memory.get('backend_pid')
    if (backendPid) {
      kernel.print("⚠️ Beende Backend-Server wegen Frontend-Fehler...")
      try {
        await kernel.kill(backendPid)
      } catch (killErr) {
        kernel.print(`⚠️ Konnte Backend-Server nicht beenden: ${killErr.message}`)
      }
    }
    return { success: false }
  }

  // Erfolgsmeldung
  kernel.print("\n✨ Lokarni läuft jetzt! ✨")
  kernel.print(`📊 Backend-URL: http://localhost:${backendPort}`)
  kernel.print(`📊 Frontend-URL: ${frontendUrl}`)
  kernel.print("\nℹ️ Der Browser sollte sich automatisch öffnen.")
  kernel.print("ℹ️ Verwende 'reset.js' zum Beenden der Anwendung.")
  
  return {
    success: true,
    frontend_url: frontendUrl,
    backend_url: `http://localhost:${backendPort}`
  }
}