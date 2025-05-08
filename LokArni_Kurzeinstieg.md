Willkommen bei **LokArni** – deiner lokalen Medien- und Informationsbibliothek für KI-Modelle, Bilder, Videos, Prompts und mehr!

---

## 🛠️ Was kannst du mit LokArni machen?

- Eigene KI-Modelle (z. B. LORAs, Checkpoints) speichern, suchen und verwalten
- Bilder & Videos importieren, mit Prompts, Tags und Metadaten versehen
- Inhalte nach Kategorie durchsuchen, sortieren und als Favoriten markieren
- CivitAI-Modelle direkt per Link oder ID importieren
- ZIP-Dateien mit Medien & Metainformationen bequem hochladen oder exportieren

---

## 🚀 Schnellstart

**Voraussetzungen:**  
- Python 3.10+  
- Node.js 18+ & npm

**Empfohlene Startreihenfolge beim ersten Mal:**  
1. **Backend starten:**  
   Führe `backend_start.bat` aus und warte, bis alle Abhängigkeiten installiert und das Backend bereit ist.
2. **Frontend starten:**  
   Führe anschließend `frontend_start.bat` aus und warte, bis alle npm-Abhängigkeiten installiert und das Frontend bereit ist.
3. **Gesamte Anwendung starten:**  
   Danach kannst du wie gewohnt `start_lokarni.bat` ausführen, um alles automatisch zu starten und das Frontend im Browser zu öffnen.

> **Hinweis:**  
> Beim ersten Start müssen die Abhängigkeiten für Backend und Frontend einmalig installiert werden. Erst danach funktioniert der automatische Start reibungslos.

**Alternativ (z. B. auf Linux/Mac):**

```bash
# Backend starten
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload

# Frontend starten
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend (API): http://localhost:8000

---

## 🧭 Aufbau der Anwendung

- **Frontend:** Moderne Oberfläche mit Sidebar-Navigation
  - „Add“ → Inhalte hinzufügen (manuell, ZIP, CivitAI)
  - „Manage“ → Assets durchsuchen, bearbeiten, löschen
  - „Search“ → Filter- & Stichwortsuche nach Tags, Prompts etc.
  - „Settings“ → API-Key, Sprache, Optionen (geplant)

- **Backend:** FastAPI-Anwendung mit SQLite-Datenbank
  - Routen für Assets, Kategorien, Uploads, Importe
  - Datenmodelle für strukturierte Verwaltung von Inhalten

---

## 🗂️ Kategorien & Unterkategorien

LokArni organisiert Inhalte in **Kategorien** (z. B. „Modelle“, „Stile“) und **Subkategorien** (z. B. „Checkpoint“, „Lora“, „Concept“, „Style“).

Beispielstruktur:

```
Modelle
 ├── Checkpoint
 ├── Lora
 └── VAE

Konzepte & Stile
 ├── Concept
 ├── Style
 └── Charakter
```

- Wenn ein Asset eingetragen wird (mit allen Informationen), wird die passende Subkategorie **automatisch anhand der Informationen** (außer Titel und Beschreibung) ermittelt – sobald das jeweilige Subkategorie-Wort in den Daten vorkommt, wird diese zugeordnet.
- Beim ersten Start werden Standardkategorien automatisch angelegt (inkl. Favoriten)
- Eigene Kategorien/Subkategorien lassen sich über das Frontend oder Backend verwalten (Adminbereich geplant)

---

## 📦 Inhaltstypen & Importe

- **Modelle:** LORA, Checkpoint, VAE – inkl. Version, Base Model, Trigger-Wörter
- **Bilder/Videos:** Mit Prompts, Ressourcen, Tags, Vorschau
- **ZIP-Archiv:** Enthält `assets.json` + Medien (für Backup oder Massenimport)
- **CivitAI-Link:** Direktimport von Modellen & Metadaten

---

## 📝 Geplante Features

- Editierbare Assets direkt in der Oberfläche
- Verbesserte Benutzerfreundlichkeit & Fehlerkorrektur
- Settings-Panel und Mehrsprachigkeit (DE/EN)
- Adminbereich zur Kategorie/Asset-Verwaltung

---

## ❓ Hinweise & Hilfe

- Die Anwendung läuft lokal unter `http://localhost:8000` (Backend) und `http://localhost:5173` (Frontend)
- Medien werden immer unter `/import/images/{typ}` abgelegt
- Die SQLite-Datenbank (`lokarni.db`) kann direkt gesichert oder verschoben werden
- API-Key für CivitAI wird im Frontend gespeichert (Settings-Panel geplant)

Für technische Details lies die `README.md`.  
Bei Fragen oder Problemen: Issues auf GitHub öffnen.

Viel Spaß mit deiner eigenen KI-Mediathek! ✨
