# LokArni

**LokArni** ist eine lokal betriebene Fullstack-Webanwendung zur Organisation, Visualisierung und Wiederverwendung KI-bezogener Inhalte.  
Sie ermöglicht es, Modelle (z. B. LORAs, Checkpoints), Bilder, Videos und begleitende Metadaten zentral zu speichern, zu durchsuchen und zu kategorisieren.

### 💡 Ziel des Projekts

LokArni richtet sich an Entwickler:innen, Artists oder Forschende, die mit generativen KI-Systemen arbeiten und ihre Inhalte systematisch verwalten möchten.  
Zu jedem gespeicherten Asset (z. B. LORA-Modell, Bild oder Video) können alle relevanten Informationen gespeichert werden:

- Prompts, Trigger-Wörter und verwendete Ressourcen
- Version, Creator, verwendetes Base-Modell
- Vorschau- und Mediendateien zur direkten Einsicht
- Kopierbare Informationen zur Wiederverwendung in eigenen Projekten

Dadurch wird LokArni zur persönlichen **KI-Wissens- und Medienbibliothek**.

## 🔧 Backend (FastAPI + SQLAlchemy)

### Hauptkomponenten

- `main.py`: Einstiegspunkt der FastAPI-Anwendung. Bindet Routen, konfiguriert CORS, mountet statische Medien, initialisiert die Datenbankstruktur.
- `models.py`: SQLAlchemy-Modelle für die Tabellen `Asset`, `Category`, `SubCategory`
- `schemas.py`: Pydantic-Schemas für API-Datenvalidierung (`AssetCreate`, `AssetUpdate`, `CategoryCreate`, ...)
- `routes/`: Enthält alle API-Endpunkte, aufgeteilt nach Funktion:
  - `asset_routes.py`: CRUD-Operationen für Assets, Suche, Favoritenfunktion
  - `category_routes.py`: Kategorien und Subkategorien, inkl. geschützte Titel
  - `civitai_import.py`: Import von CivitAI-Modellen inkl. Medien und Metadaten
  - `import_zip_route.py`: ZIP-Import und -Export von Assets + Medien
  - `upload_routes.py`: Datei-Uploads über Formular oder URL
- `crud/`: Zugriffsfunktionen für die Datenbank
- `database.py`: Verbindung und Session-Handling zur SQLite-Datenbank

### Datenpersistenz

- SQLite (`lokarni.db`)
- Medienpfade in `/import/images/{typ}` gespeichert

---

## 🧩 Frontend (React + Tailwind + Vite)

### Struktur

- `App.jsx`: Einstiegspunkt, steuert Kategorienavigation, API-Aufrufe, UI-Darstellung
- `components/`: Wiederverwendbare UI-Elemente wie Grid, Modal, Sidebar
- `content/`: Logische Seiten: Add, Manage, Settings, Search
- `api/`: API-Zugriff (z. B. auf Kategorien)

### Kommunikation

- API-Aufrufe an `http://localhost:8000/api/...`
- Dynamisches Nachladen von Assets basierend auf Kategorie- oder Favoritenstatus

---

## 🔗 Datenfluss / Systemübersicht

```
Frontend (React)
  └─ App.jsx
      └─ API Layer (fetch, category.js, ...)
          └─ FastAPI (main.py)
              ├─ asset_routes.py
              ├─ category_routes.py
              ├─ civitai_import.py
              ├─ import_zip_route.py
              └─ upload_routes.py
                  ├─ models.py
                  └─ schemas.py
                      └─ SQLite DB (lokarni.db)
                      └─ Medien: /import/images/{typ}
```

---

## 🧠 Hinweis zu `sync_images_to_database.py`

Diese Datei diente vermutlich Testzwecken und ist durch den ZIP-Import und die Upload-Logik obsolet. Sie kann archiviert oder entfernt werden, sofern nicht explizit benötigt.

---

## 📦 Projektstruktur (Auszug)

```
LokArni/
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── crud/
│   └── routes/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   └── content/
├── import/images/
├── lokarni.db
├── assets.csv
├── start_*.bat
```

---

## 🚧 Geplante Features & To-dos

- [ ] Nutzer-Authentifizierung (z. B. JWT, Login-Maske)
- [ ] Admin-Bereich zur Verwaltung von Assets & Kategorien
- [ ] Validierung hochgeladener Dateien
- [ ] Erweiterte Suche (z. B. mit Gewichtung, mehreren Filtern)
- [ ] Deployment (Docker, Uvicorn, .env-Handling für API-Keys)
- [ ] Settings-Panel im Frontend (z. B. API-Key speichern, Vorschauoptionen)
- [ ] Logging, Monitoring & Fehlerbehandlung (Sentry, Logs etc.)
- [ ] Mehrsprachigkeit (i18n) im Frontend (optional)
- [ ] Mobile/Responsive-Optimierung (Layout, Performance)
- [ ] Unit-Tests für Backend (z. B. Pytest mit FastAPI-TestClient)