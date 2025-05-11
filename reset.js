// reset.js - Pinokio Reset für Lokarni
const os = require('os')

/**
 * Reset Script für Lokarni im Pinokio-Framework
 * 
 * Dieser Reset führt folgende Schritte aus:
 * 1. Beendet alle laufenden Server-Prozesse
 * 2. Bereinigt den Status
 */
module.exports = async (kernel) => {
  kernel.print("🛑 Beende Lokarni-Server...")
  
  // PIDs aus dem Speicher abrufen
  const backendPid = kernel.memory.get('backend_pid')
  const frontendPid = kernel.memory.get('frontend_pid')
  
  // 1. Frontend-Server beenden
  if (frontendPid) {
    kernel.print(`⏳ Beende Frontend-Server (PID: ${frontendPid})...`)
    try {
      await kernel.kill(frontendPid)
      kernel.print("✅ Frontend-Server beendet")
    } catch (e) {
      kernel.print(`⚠️ Fehler beim Beenden des Frontend-Servers: ${e.message}`)
    }
  } else {
    kernel.print("ℹ️ Kein laufender Frontend-Server gefunden")
  }
  
  // 2. Backend-Server beenden
  if (backendPid) {
    kernel.print(`⏳ Beende Backend-Server (PID: ${backendPid})...`)
    try {
      await kernel.kill(backendPid)
      kernel.print("✅ Backend-Server beendet")
    } catch (e) {
      kernel.print(`⚠️ Fehler beim Beenden des Backend-Servers: ${e.message}`)
      
      // Auf Windows müssen wir ggf. mehr Prozesse beenden
      if (os.platform() === 'win32') {
        try {
          // Python-Prozesse suchen und beenden
          kernel.print("🔍 Suche nach Python-Prozessen, die uvicorn ausführen...")
          await kernel.exec({
            cmd: 'taskkill /F /IM python.exe /FI "WINDOWTITLE eq uvicorn*"'
          })
          kernel.print("✅ Zusätzliche Python-Prozesse beendet")
        } catch (taskKillErr) {
          // Ignorieren wir, falls keine passenden Prozesse gefunden wurden
        }
      }
    }
  } else {
    kernel.print("ℹ️ Kein laufender Backend-Server gefunden")
  }
  
  // 3. Speicher bereinigen
  kernel.memory.set('backend_pid', null)
  kernel.memory.set('frontend_pid', null)
  
  kernel.print("\n✅ Lokarni wurde erfolgreich beendet!")
  kernel.print("ℹ️ Du kannst die Anwendung jederzeit mit 'start.js' erneut starten.")
  
  return { success: true }
}