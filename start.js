module.exports = async ({ $ }) => {
  $.spawn`uvicorn backend.main:app --port 8000`;
  $.spawn`cd frontend && npm run dev`;
};
