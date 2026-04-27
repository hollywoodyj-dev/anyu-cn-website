import { readFile } from "node:fs/promises";
import path from "node:path";

const base = process.cwd();

const singleFiles = [
  "docs/anyu/eval/anyu_household_response_batch1_001_025.jsonl",
  "docs/anyu/eval/anyu_household_response_batch1_026_050.jsonl",
  "docs/anyu/eval/anyu_household_response_batch2_051_100.jsonl",
];

const dialogueFile = "docs/anyu/eval/anyu_continuous_dialogue_3turn_batch1.jsonl";

function parseJsonl(text, file) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSONL at ${file}:${i + 1}`);
      }
    });
}

function validateRisk(risk) {
  return ["L0", "L1", "L2", "L3", "L4"].includes(risk);
}

async function load(file) {
  const abs = path.join(base, file);
  const text = await readFile(abs, "utf8");
  return parseJsonl(text, file);
}

async function main() {
  const singleRows = (await Promise.all(singleFiles.map(load))).flat();
  const dialogues = await load(dialogueFile);
  const failures = [];

  for (const row of singleRows) {
    if (typeof row.id !== "number") failures.push(`single id missing: ${JSON.stringify(row)}`);
    if (!row.input || !row.response) failures.push(`single text missing at id=${row.id}`);
    if (!validateRisk(row.risk_level)) failures.push(`single invalid risk at id=${row.id}`);
  }

  const ids = singleRows.map((r) => r.id).sort((a, b) => a - b);
  const missing = [];
  for (let i = 1; i <= 100; i++) {
    if (!ids.includes(i)) missing.push(i);
  }

  for (const d of dialogues) {
    if (!Array.isArray(d.turns) || d.turns.length !== 3) {
      failures.push(`dialogue must contain 3 turns: ${JSON.stringify(d.scene)}`);
      continue;
    }
    if (!validateRisk(d.risk_level)) failures.push(`dialogue invalid risk: ${d.scene}`);
    for (const t of d.turns) {
      if (!t.user || !t.assistant) failures.push(`dialogue turn missing text: ${d.scene}`);
    }
  }

  if (failures.length) {
    console.error("Dataset validation failed:");
    for (const f of failures) console.error(`- ${f}`);
    process.exit(1);
  }

  console.log("Dataset validation passed.");
  console.log(`Single-turn samples: ${singleRows.length}`);
  console.log(`3-turn scenarios: ${dialogues.length}`);
  if (missing.length) {
    console.log(`Missing single-turn ids: ${missing.join(", ")}`);
  } else {
    console.log("Single-turn ids complete: 1-100.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
