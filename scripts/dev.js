const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const pnpmCmd = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

console.log("Starting backend server and frontend client...");

const server = spawn("node", ["server/server.js"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: true,
});

const client = spawn(pnpmCmd, ["--filter", "client", "dev"], {
  cwd: rootDir,
  stdio: "inherit",
  shell: true,
});

function cleanup() {
  if (server) server.kill();
  if (client) client.kill();
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);

