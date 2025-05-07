# 🚀 LokArni – Kurzeinstieg für Nutzer:innen

Willkommen bei **LokArni**, deiner lokalen Medien- und Informationsbibliothek für KI-bezogene Inhalte wie LORAs, Bilder, Videos und mehr.

---

## 🛠️ Was du mit LokArni machen kannst

- Eigene KI-Modelle (z. B. LORAs, Checkpoints) speichern und verwalten
- Bilder & Videos importieren und mit Prompts, Tags, Metadaten versehen
- Inhalte nach Kategorie durchsuchen, sortieren und favorisieren
- CivitAI-Modelle direkt über die API importieren
- ZIP-Dateien mit Medien + Metainformationen hochladen oder exportieren

---

## 🧭 Aufbau der Anwendung

- **Frontend**: moderne Oberfläche mit Sidebar-Navigation
  - Ansicht „Add“ → Inhalte hinzufügen (z. B. manuell, über ZIP oder CivitAI)
  - Ansicht „Manage“ → bestehende Assets durchsuchen, bearbeiten oder löschen
  - Ansicht „Search“ → Filter- & Stichwortsuche nach Tags, Prompts etc.
  - Ansicht „Settings“ → API-Key für CivitAI und andere Optionen

- **Backend**: FastAPI-Anwendung mit SQLite-Datenbank
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

- Jeder Asset-Eintrag kann **einer Subkategorie zugeordnet** werden
- Diese Einordnung ermöglicht eine gezielte Filterung und strukturierte Darstellung im Frontend
- Beim ersten Start werden Standardkategorien automatisch angelegt (inkl. Favoriten-Kategorie)
- Du kannst eigene Kategorien und Subkategorien über das Backend oder direkt im Code erweitern

---

## 📦 Inhaltstypen

- **Modelle**: z. B. LORA, Checkpoint, VAE → inkl. Version, Base-Model, Trigger-Wörter
- **Bilder/Videos**: mit Prompts, Ressourcen, Tags und Vorschau
- **ZIPs**: beinhalten `assets.json` + Medien → ideal für Backup oder Massenimport

---

## 🔄 Importmöglichkeiten

- **ZIP-Datei** (über /api/assets/import):
  - Enthält `assets.json` + Ordner `media/`
  - Wird automatisch analysiert und in die DB übernommen

- **CivitAI-Modell** (über /api/import/from-civitai):
  - Einfach Link einfügen oder über ID abrufen
  - Bilder + Metadaten werden automatisch gespeichert

- **Einzelbild**: per Datei-Upload oder URL (z. B. Referenzbild oder Render)

---

## 📝 Hinweise

- Die Anwendung läuft lokal unter `http://localhost:8000` (Backend) und `http://localhost:5173` (Frontend)
- Der Medienpfad beginnt immer mit `/import/images/{typ}`
- Die SQLite-Datenbank (`lokarni.db`) kann direkt gesichert werden
- API-Key für CivitAI wird per Cookie oder manuell im Frontend gespeichert

---

## 📣 Weitere Hilfe

- Lies die `README.md` für technische Hintergründe
- Sieh dir das Planungsboard an für geplante Features
- Für Entwickler: `main.py`, `models.py`, `routes/` und `App.jsx` sind die Schlüsseldateien

Viel Spaß mit deiner eigenen KI-Mediathek! ✨