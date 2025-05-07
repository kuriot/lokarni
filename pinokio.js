{
  "name": "Lokarni",
  "description": "Lokale Mediathek für KI-Modelle, Prompts und Medien mit CivitAI-Import.",
  "type": "web",
  "icon": "lokarni-icon.png",
  "setup": {
    "scripts": {
      "python-deps": "pip install -r requirements.txt",
      "frontend-deps": "cd frontend && npm install"
    }
  },
  "start": {
    "scripts": {
      "backend": "uvicorn backend.main:app --port 7860",
      "frontend": "cd frontend && npm run dev"
    }
  },
  "stop": {
    "scripts": {
      "backend": "pkill -f 'uvicorn'",
      "frontend": "pkill -f 'vite'"
    }
  },
  "entry": "http://localhost:5173"
}

