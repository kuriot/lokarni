module.exports = async ({ $ }) => {
  await $`pkill -f uvicorn`;
  await $`pkill -f vite`;
};
