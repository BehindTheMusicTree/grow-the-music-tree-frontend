const { spawn } = require("child_process");
const path = require("path");

// Start the development server
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const server = spawn(npm, ["start"], {
  stdio: "inherit",
  env: { ...process.env, BROWSER: "none" }, // Prevent opening browser automatically
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

process.on("SIGTERM", () => {
  server.kill();
  process.exit();
});

process.on("SIGINT", () => {
  server.kill();
  process.exit();
});
