#!/usr/bin/env node
/**
 * Run a command with `.grok/app-env.json` merged into its environment.
 *
 * `dev`, `build` and `preview` can route through this wrapper so env flags
 * stay consistent. On Windows, local binaries (vite) must be on PATH and
 * spawn must use shell:true so vite.cmd resolves.
 */
import { spawn } from "node:child_process";
import { readFileSync, realpathSync } from "node:fs";
import { constants as osConstants } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ENV_REL_PATH = ".grok/app-env.json";

const VITE_PREFIX = "VITE_";

export function parseAppEnv(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const env = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (!key.startsWith(VITE_PREFIX)) continue;
    if (typeof value !== "string") continue;
    env[key] = value;
  }
  return env;
}

export function readAppEnv(root) {
  try {
    return parseAppEnv(readFileSync(join(root, APP_ENV_REL_PATH), "utf8"));
  } catch {
    return {};
  }
}

export function mergeAppEnv(appEnv, processEnv) {
  return { ...appEnv, ...processEnv };
}

export function exitStatusFromChild(code, signal) {
  if (signal) {
    const signo = osConstants.signals[signal];
    return 128 + (typeof signo === "number" ? signo : 1);
  }
  return code ?? 1;
}

export function projectRoot() {
  return dirname(dirname(fileURLToPath(import.meta.url)));
}

export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

function main(argv) {
  const [command, ...args] = argv;
  if (!command) {
    console.error("usage: node scripts/with-app-env.mjs <command> [args…]");
    process.exit(2);
  }

  const root = projectRoot();
  const env = mergeAppEnv(readAppEnv(root), process.env);

  // Put node_modules/.bin first so `vite` resolves on Windows and Unix
  const binDir = join(root, "node_modules", ".bin");
  const sep = process.platform === "win32" ? ";" : ":";
  const existing = env.PATH || env.Path || "";
  env.PATH = `${binDir}${sep}${existing}`;
  env.Path = env.PATH;

  const child = spawn(command, args, {
    stdio: "inherit",
    env,
    shell: true,
    cwd: root,
  });

  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      try {
        child.kill(signal);
      } catch {
        /* ignore */
      }
    });
  }

  child.on("error", (err) => {
    console.error(`[with-app-env] failed to run ${command}:`, err?.message || err);
    console.error(`[with-app-env] tip: run "npm install" then "npm run dev" (uses vite directly).`);
    process.exit(127);
  });

  child.on("exit", (code, signal) => {
    process.exit(exitStatusFromChild(code, signal));
  });
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}
