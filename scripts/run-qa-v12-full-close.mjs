/**
 * V1.2 Priority E — full close: `qa-v12` + chained v7 / v7.1 / v11 (same QA_BASE_URL).
 *
 *   npm run dev
 *   set QA_BASE_URL=http://localhost:3000
 *   npm run qa:v12:close
 *
 * Cross-platform: sets QA_RUN_CHAINED_REGRESSION=1 for the child process.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const env = {
  ...process.env,
  QA_RUN_CHAINED_REGRESSION: "1",
};

console.log("[qa:v12:close] V1.2 Priority E — v12 + chained v7 / v7.1 / v11 tone / v11 host\n");

const r = spawnSync(process.execPath, [join(root, "scripts", "qa-v12-notification-consent.mjs")], {
  cwd: root,
  env,
  stdio: "inherit",
});

process.exit(r.status === 0 ? 0 : 1);
