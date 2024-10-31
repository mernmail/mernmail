const handler = require("./handler.js");
const path = require("path");
// Environment variables are already loaded in the "handler.js" file

const port = process.env.PORT || 3000;

const { execSync } = require("child_process");
let latestCommitDate = null;
try {
  const env = { ...process.env, GIT_DIR: path.join(__dirname, "../.git") };
  latestCommitDate = new Date(
    execSync("git log -1 --format=%cd", {
      env: env,
      stdio: ["ignore", "pipe", "ignore"]
    })
      .toString()
      .trim()
  );
  // eslint-disable-next-line no-unused-vars
} catch (err) {
  // The latest commit date is unknown
}

console.log(
  `Latest commit date: ${latestCommitDate ? latestCommitDate.toDateString() : "Unknown"}`
);

handler.listen(port, () => {
  console.log(`MERNMail is listening on port ${port}`);
});
