import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { PendingTaskState } from "./pendingTask";

export type SessionBinding = {
  pendingTask: PendingTaskState | null;
  blockedPhrases: string[];
};

const dataDir = path.join(process.cwd(), ".anyu-data");
const dataFile = path.join(dataDir, "session-v6-binding.json");
const memory = new Map<string, SessionBinding>();
let loaded = false;
let writeQueue: Promise<void> = Promise.resolve();

type DiskShape = Record<string, SessionBinding>;

async function readDisk(): Promise<DiskShape> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const j = JSON.parse(raw) as DiskShape;
    return j && typeof j === "object" ? j : {};
  } catch {
    return {};
  }
}

async function ensureLoaded(): Promise<void> {
  if (loaded) return;
  loaded = true;
  const disk = await readDisk();
  for (const [sid, row] of Object.entries(disk)) {
    if (!row || typeof row !== "object") continue;
    memory.set(sid, {
      pendingTask: row.pendingTask ?? null,
      blockedPhrases: Array.isArray(row.blockedPhrases) ? row.blockedPhrases.slice(-12) : [],
    });
  }
}

function snapshot(): DiskShape {
  const out: DiskShape = {};
  for (const [k, v] of memory.entries()) {
    out[k] = { pendingTask: v.pendingTask, blockedPhrases: v.blockedPhrases.slice(-12) };
  }
  return out;
}

function enqueuePersist(): void {
  writeQueue = writeQueue
    .then(async () => {
      await mkdir(dataDir, { recursive: true });
      await writeFile(dataFile, JSON.stringify(snapshot()), "utf8");
    })
    .catch(() => {});
}

export async function getSessionBinding(sessionId: string | null): Promise<SessionBinding> {
  if (!sessionId) return { pendingTask: null, blockedPhrases: [] };
  await ensureLoaded();
  return (
    memory.get(sessionId) ?? {
      pendingTask: null,
      blockedPhrases: [],
    }
  );
}

export async function setSessionBinding(sessionId: string | null, next: SessionBinding): Promise<void> {
  if (!sessionId) return;
  await ensureLoaded();
  memory.set(sessionId, {
    pendingTask: next.pendingTask,
    blockedPhrases: next.blockedPhrases.slice(-12),
  });
  enqueuePersist();
}
