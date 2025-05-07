module.exports = async ({ $ }) => {
  console.log("Starting backend server...");
  $.spawn`cd backend && uvicorn main:app --port 8000`;
  
  console.log("Starting frontend development server...");
  $.spawn`cd frontend && npm run dev`;
  
  console.log("Lokarni is running!");
  console.log("- Backend: http://localhost:8000");
  console.log("- Frontend: http://localhost:5173");
};