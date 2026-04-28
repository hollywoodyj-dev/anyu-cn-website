/**
 * Wisewave JSONL V2：id, style, risk_level, tags, turns[{role,text}]
 * 用法：node scripts/validate-anyu-training-v2.mjs [path/to/file.jsonl]
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const base = process.cwd();
const defaultRel = "docs/anyu/eval/anyu_dialogue_multiturn_v2_batch1_030.jsonl";

const STYLES = new Set(["cantonese_chat", "mandarin_gentle"]);
const RISKS = new Set(["L0", "L1", "L2", "L3", "L4"]);
const ROLES = new Set(["user", "assistant"]);

function parseJsonl(text, file) {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch {
        throw new Error(`Invalid JSON at ${file}:${i + 1}`);
      }
    });
}

function validateRow(row, file, lineIndex) {
  const p = `${file}:${lineIndex}`;
  const errs = [];
  if (typeof row.id !== "string" || !row.id.trim()) errs.push(`${p} missing id`);
  if (!STYLES.has(row.style)) errs.push(`${p} invalid style: ${row.style}`);
  if (!RISKS.has(row.risk_level)) errs.push(`${p} invalid risk_level: ${row.risk_level}`);
  if (!Array.isArray(row.tags) || row.tags.length === 0) errs.push(`${p} tags must be non-empty array`);
  if (row.tags && !row.tags.every((t) => typeof t === "string" && t.trim())) {
    errs.push(`${p} tags must be non-empty strings`);
  }
  const turns = row.turns;
  if (!Array.isArray(turns) || turns.length < 4 || turns.length > 8) {
    errs.push(`${p} turns must have 4–8 messages (2–4 来回)`);
  } else if (turns.length % 2 !== 0) {
    errs.push(`${p} turns length must be even`);
  } else {
    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      if (!t || typeof t.role !== "string" || typeof t.text !== "string" || !t.text.trim()) {
        errs.push(`${p} turn ${i} invalid`);
        break;
      }
      if (!ROLES.has(t.role)) errs.push(`${p} turn ${i} bad role`);
      const want = i % 2 === 0 ? "user" : "assistant";
      if (t.role !== want) errs.push(`${p} turn ${i} expected role ${want}`);
    }
  }
  return errs;
}

async function loadRows(abs) {
  const text = await readFile(abs, "utf8");
  const trimmed = text.trimStart();
  if (trimmed.startsWith("[") || abs.endsWith(".json")) {
    try {
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("JSON root must be an array");
      return arr;
    } catch {
      throw new Error(`Invalid JSON array: ${abs}`);
    }
  }
  return parseJsonl(text, abs);
}

async function main() {
  const rel = process.argv[2] ?? defaultRel;
  const abs = path.isAbsolute(rel) ? rel : path.join(base, rel);
  const rows = await loadRows(abs);
  const failures = [];
  if (rows.length === 0) failures.push("No rows");

  rows.forEach((row, i) => {
    failures.push(...validateRow(row, rel, i + 1));
  });

  const ids = rows.map((r) => r.id);
  const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dup.length) failures.push(`duplicate id: ${[...new Set(dup)].join(", ")}`);

  if (failures.length) {
    console.error("V2 validation failed:");
    for (const f of failures) console.error("-", f);
    process.exit(1);
  }

  console.log("V2 validation passed:", abs);
  console.log("Rows:", rows.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
