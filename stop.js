module.exports = async ({ $ }) => {
  console.log("Stopping backend server...");
  try {
    await $`pkill -f uvicorn`;
  } catch (e) {
    console.log("No uvicorn process found or already stopped");
  }
  
  console.log("Stopping frontend server...");
  try {
    await $`pkill -f vite`;
  } catch (e) {
    console.log("No vite process found or already stopped");
  }
  
  console.log("Lokarni has been stopped");
};