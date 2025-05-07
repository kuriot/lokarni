module.exports = async ({ $ }) => {
  await $`pip install -r requirements.txt`;
  await $`cd frontend && npm install`;
};
