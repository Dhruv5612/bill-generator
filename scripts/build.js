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

console.log("==> Ensuring dist directory exists...");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log("==> Copying client build to root dist/...");
fs.cpSync(clientDist, distDir, { recursive: true });

console.log("==> Copying api/ to dist/api/ for Vercel functions detection...");
fs.cpSync(apiDir, path.join(distDir, "api"), { recursive: true });

console.log("==> Copying server/ to dist/server/ (excluding node_modules)...");
fs.cpSync(serverDir, path.join(distDir, "server"), {
  recursive: true,
  filter: (src) => {
    const basename = path.basename(src);
    return basename !== "node_modules" && basename !== ".env";
  },
});

console.log("==> Build and packaging completed successfully!");
