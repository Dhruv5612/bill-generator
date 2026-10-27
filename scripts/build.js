const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("==> Building client with Vite...");
execSync("pnpm --filter client run build", { stdio: "inherit" });

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const clientDist = path.join(rootDir, "client", "dist");
const apiDir = path.join(rootDir, "api");
const serverDir = path.join(rootDir, "server");

console.log("==> Ensuring dist directory exists and is clean...");
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

console.log("==> Copying client build to root dist/...");
fs.cpSync(clientDist, distDir, { recursive: true });

console.log("==> Build and packaging completed successfully!");

