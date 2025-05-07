module.exports = async ({ $ }) => {
  console.log("Installing backend dependencies...");
  await $`pip install -r requirements.txt`;
  
  console.log("Installing frontend dependencies...");
  await $`cd frontend && npm install`;
  
  console.log("Installation completed!");
};