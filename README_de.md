# 🇩🇪 LokArni – README (Deutsch)

**LokArni** ist eine lokale Medien- und Informationsbibliothek für KI-bezogene Inhalte wie Modelle, Bilder, Videos, Prompts und mehr.

## 🚀 Funktionen
- Assets importieren, verwalten, durchsuchen und favorisieren
- CivitAI-Schnittstelle zur automatisierten Übernahme
- ZIP-Import (mit `assets.json` + Medien)
- SQLite-Datenbank & FastAPI-Backend
- React-Frontend mit kategoriebasierter Sidebar

## 🛠️ Start (lokal)
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
cd frontend
npm install
npm run dev
```

## 📁 Struktur
- `backend/` mit API, DB und Modellen
- `frontend/` mit React-Komponenten
- `import/images/` für Medien
- `.db` & `.gitignore` vorhanden

## 📌 Hinweis
Kategorie „General“ enthält „All Assets“ & „Favorites“ → nicht löschbar.

Mehr dazu im **Kurzeinstieg**.
