module.exports = {
  name: "Lokarni",
  description: "A local media library for managing AI models, prompts, and media, featuring CivitAI import functionality.",
  type: "web",
  icon: "lokarni-icon.png",
  setup: {
    scripts: {
      "python-deps": "pip install -r requirements.txt",
      "frontend-deps": "cd frontend && npm install"
    }
  },
  start: {
    scripts: {
      backend: "uvicorn backend.main:app --port 8000",
      frontend: "cd frontend && npm run dev"
    }
  },
  stop: {
    scripts: {
      backend: "pkill -f 'uvicorn'",
      frontend: "pkill -f 'vite'"
    }
  },
  entry: "http://localhost:5173"
};
