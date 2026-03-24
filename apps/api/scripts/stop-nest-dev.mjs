import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(process.cwd());
const thisPid = process.pid;

function readPortFromEnv() {
  const envPath = resolve(projectRoot, ".env");
  if (!existsSync(envPath)) return 8000;

  const env = readFileSync(envPath, "utf8");
  const match = env.match(/^PORT=(\d+)$/m);
  if (!match) return 8000;

  const port = Number(match[1]);
  return Number.isFinite(port) && port > 0 ? port : 8000;
}

function listProjectProcessEntries() {
  const output = execSync("ps -Ao pid=,command=", { encoding: "utf8" });
  const lines = output.split("\n").filter(Boolean);

  return lines
    .map((line) => {
      const match = line.trim().match(/^(\d+)\s+(.*)$/);
      if (!match) return null;
      return { pid: Number(match[1]), cmd: match[2] };
    })
    .filter((entry) => {
      if (!entry) return false;
      if (!Number.isFinite(entry.pid) || entry.pid <= 0 || entry.pid === thisPid) return false;
      return entry.cmd.includes(projectRoot);
    });
}

function listListeningPids(port) {
  try {
    const output = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, { encoding: "utf8" });
    return output
      .split("\n")
      .map((line) => Number(line.trim()))
      .filter((pid) => Number.isFinite(pid) && pid > 0 && pid !== thisPid);
  } catch {
    return [];
  }
}

function listNestDevPids() {
  const entries = listProjectProcessEntries();
  const port = readPortFromEnv();
  const listeners = new Set(listListeningPids(port));

  return entries
    .filter((entry) => {
      const isNestWatch = entry.cmd.includes("nest.js start");
      const hasWatchFlag = entry.cmd.includes("--watch");
      const isProjectMain = entry.cmd.includes(`${projectRoot}/dist/main`);
      const isNestForkedTypeChecker = entry.cmd.includes("forked-type-checker.js");
      const listensOnApiPort = listeners.has(entry.pid);
      return (
        (isNestWatch && hasWatchFlag) ||
        (isProjectMain && listensOnApiPort) ||
        isNestForkedTypeChecker
      );
    })
    .map((entry) => ({ pid: entry.pid }));
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const targets = listNestDevPids();
if (targets.length === 0) {
  console.log("[dev-guard] No existing nest dev process found.");
  process.exit(0);
}

for (const { pid } of targets) {
  try {
    process.kill(pid, "SIGTERM");
  } catch {}
}

const waitUntil = Date.now() + 1500;
while (Date.now() < waitUntil) {
  if (targets.every(({ pid }) => !isAlive(pid))) break;
}

for (const { pid } of targets) {
  if (isAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {}
  }
}

console.log(`[dev-guard] Stopped ${targets.length} existing nest dev process(es).`);
