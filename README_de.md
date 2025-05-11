![Lokarni Logo](./lokarni_logo.png)

# LokArni

**LokArni** ist eine lokal betriebene Fullstack-Webanwendung zur Organisation, Visualisierung und Wiederverwendung KI-bezogener Inhalte.  
Du kannst Modelle (z. B. LORAs, Checkpoints), Bilder, Videos und begleitende Metadaten zentral speichern, durchsuchen, kategorisieren und zukünftig direkt bearbeiten.

---

## 💡 Ziel des Projekts

LokArni richtet sich an Entwickler:innen, Artists oder Forschende, die mit generativen KI-Systemen arbeiten und ihre Inhalte systematisch verwalten möchten.  
Zu jedem gespeicherten Asset (z. B. LORA-Modell, Bild oder Video) können alle relevanten Informationen gespeichert werden:

- Prompts, Trigger-Wörter und verwendete Ressourcen
- Version, Creator, verwendetes Base-Modell
- Vorschau- und Mediendateien zur direkten Einsicht
- Kopierbare Informationen zur Wiederverwendung in eigenen Projekten

Dadurch wird LokArni zur persönlichen **KI-Wissens- und Medienbibliothek**.

---

## 🚀 Features (Auswahl)

- **Medienbibliothek:** KI-Assets wie Modelle, Bilder, Videos und Metadaten organisieren
- **CivitAI-Import:** Modelle mit Metadaten direkt übernehmen
- **ZIP-Import/Export:** Assets und Medien als ZIP ein- und ausspielen
- **Favoriten & Kategorien:** Assets markieren und strukturieren
- **Suche & Filter:** Assets schnell finden
- **Modernes Frontend:** React + Tailwind + Vite
- **API-first Backend:** FastAPI + SQLite

---

## 🏗️ Projektstruktur

```
LokArni/
├── backend/         # FastAPI-Backend (API, DB, Modelle)
├── frontend/        # React-Frontend (Komponenten, Seiten)
├── import/          # Medienablage (z. B. Bilder, Videos)
├── start_lokarni.bat         # Startet Frontend und Backend automatisiert
├── frontend_start.bat        # Startet nur das Frontend
├── backend_start.bat         # Startet nur das Backend
├── requirements.txt          # Python-Abhängigkeiten
├── package.json              # Frontend-Abhängigkeiten
├── README.md / README_de.md  # Dokumentation
├── LokArni_Kurzeinstieg.md   # Kurzanleitung
├── LICENSE
├── .gitignore
```

---

## ⚡️ Schnellstart

1. **Voraussetzungen:**
   - Python 3.10+
   - Node.js 18+ & npm

2. **Starten:**  
   - Führe `start_lokarni.bat` aus (Windows).  
     → Startet automatisch Backend & Frontend, öffnet die App im Browser.
   - Beim ersten Start werden alle nötigen Daten/Abhängigkeiten automatisch heruntergeladen und installiert.

3. **Manuell (falls nötig):**
   ```bash
   # Backend
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r ../requirements.txt
   uvicorn main:app --reload

   # Frontend
   cd frontend
   npm install
   npm run dev
   ```

   - Frontend: http://localhost:5173  
   - Backend API: http://localhost:8000

---

## 📦 Inhaltstypen

- **Modelle:** (z. B. LORA, Checkpoint, VAE) inkl. Version, Base-Model, Trigger-Wörter
- **Bilder/Videos:** Mit Prompts, Ressourcen, Tags und Vorschau
- **ZIPs:** Enthalten `assets.json` + Medien

---

## 🔗 API-Endpoints (Auszug)

- `GET /api/assets` – Liste aller Assets
- `POST /api/assets` – Neues Asset anlegen
- `GET /api/categories` – Kategorien abrufen
- `POST /api/import/civitai` – Import von CivitAI
- `POST /api/import/zip` – ZIP-Import
- `POST /api/upload` – Datei-Upload

Die vollständige API-Doku findest du unter `/docs` (Swagger), sobald das Backend läuft.

---

## 📝 Geplante Features & To-dos

- [ ] **Editierbare Assets**: Direktes Bearbeiten aller Asset-Felder in der Oberfläche
- [ ] **Bessere Benutzerfreundlichkeit und Fehlerkorrektur**
- [ ] **Settings-Panel**: Einstellungen wie API-Key, Sprache usw. direkt im UI
- [ ] **Mehrsprachigkeit**: Oberfläche auf Deutsch/Englisch
- [ ] **Adminbereiche**: Verwaltung von Kategorien für Admins

---

## 🤝 Mitmachen & Entwicklung

- Pull Requests sind willkommen!
- Bitte Issues für Fehler oder Feature-Wünsche anlegen.
- Code- und PR-Style: Klar, dokumentiert, mit sprechenden Commits.

---

## 📄 Lizenz

MIT License

---

**Viel Spaß mit LokArni!**