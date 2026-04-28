import type { AnYuMode } from "@/lib/anyu-response/householdStyle";
import type { RiskLevel } from "@/lib/anyu/risk/evaluate";
import { getPrismaClient } from "@/lib/server/prisma";
import type { AnYuStyle } from "./styleRouter";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
  turnIndex: number;
  mode?: AnYuMode;
  style?: AnYuStyle;
  riskLevel?: RiskLevel;
  createdAt: string;
};

const DEFAULT_RECENT_TURNS_LIMIT = 6;
const MAX_RECENT_TURNS_LIMIT = 10;
const STORE_LIMIT_PER_SESSION = 40;
const inMemorySessions = new Map<string, ConversationTurn[]>();
const dataDir = path.join(process.cwd(), ".anyu-data");
const dataFile = path.join(dataDir, "conversation-turns.json");
let loadedFromDisk = false;
let writeQueue: Promise<void> = Promise.resolve();
let prismaReady: boolean | null = null;

type SessionStore = Record<string, ConversationTurn[]>;

async function readStoreFromDisk(): Promise<SessionStore> {
  try {
    const raw = await readFile(dataFile, "utf8");
    const json = JSON.parse(raw) as SessionStore;
    return json && typeof json === "object" ? json : {};
  } catch {
    return {};
  }
}

async function ensureLoaded(): Promise<void> {
  if (loadedFromDisk) return;
  loadedFromDisk = true;
  const store = await readStoreFromDisk();
  for (const [sid, turns] of Object.entries(store)) {
    if (!Array.isArray(turns)) continue;
    inMemorySessions.set(sid, turns.slice(-STORE_LIMIT_PER_SESSION));
  }
}

function snapshotStore(): SessionStore {
  const out: SessionStore = {};
  for (const [sid, turns] of inMemorySessions.entries()) {
    out[sid] = turns.slice(-STORE_LIMIT_PER_SESSION);
  }
  return out;
}

function enqueuePersist(): void {
  writeQueue = writeQueue
    .then(async () => {
      await mkdir(dataDir, { recursive: true });
      await writeFile(dataFile, JSON.stringify(snapshotStore()), "utf8");
    })
    .catch(() => {
      // ignore disk persistence failure; keep serving from memory
    });
}

async function ensurePrismaReady(): Promise<boolean> {
  if (prismaReady !== null) return prismaReady;
  try {
    const prisma = getPrismaClient();
    await prisma.$connect();
    prismaReady = true;
    return true;
  } catch {
    prismaReady = false;
    return false;
  }
}

export async function getRecentTurns(
  sessionId: string | null,
  requested = DEFAULT_RECENT_TURNS_LIMIT,
): Promise<ConversationTurn[]> {
  if (!sessionId) return [];
  const n = Math.min(MAX_RECENT_TURNS_LIMIT, Math.max(1, Math.floor(requested)));
  if (await ensurePrismaReady()) {
    try {
      const prisma = getPrismaClient();
      const rows = await prisma.elderChatTurn.findMany({
        where: { sessionId },
        orderBy: { createdAt: "desc" },
        take: n,
      });
      return rows
        .slice()
        .reverse()
        .map((r) => ({
          role: r.role === "assistant" ? "assistant" : "user",
          content: r.content,
          turnIndex: r.turnIndex,
          mode: (r.mode as AnYuMode | null) ?? undefined,
          style: (r.style as AnYuStyle | null) ?? undefined,
          riskLevel: (r.riskLevel as RiskLevel | null) ?? undefined,
          createdAt: r.createdAt.toISOString(),
        }));
    } catch {
      // fallback to file-backed memory
    }
  }
  await ensureLoaded();
  const turns = inMemorySessions.get(sessionId) ?? [];
  return turns.slice(-n);
}

export async function appendTurn(
  sessionId: string | null,
  turn: Omit<ConversationTurn, "createdAt"> & { locale?: string },
): Promise<void> {
  if (!sessionId) return;
  if (await ensurePrismaReady()) {
    try {
      const prisma = getPrismaClient();
      await prisma.elderChatSession.upsert({
        where: { id: sessionId },
        update: {
          style: turn.style ?? undefined,
          locale: turn.locale ?? undefined,
        },
        create: {
          id: sessionId,
          style: turn.style ?? undefined,
          locale: turn.locale ?? "zh",
        },
      });
      await prisma.elderChatTurn.create({
        data: {
          sessionId,
          role: turn.role,
          content: turn.content,
          turnIndex: turn.turnIndex,
          mode: turn.mode ?? null,
          style: turn.style ?? null,
          riskLevel: turn.riskLevel ?? null,
        },
      });
      return;
    } catch {
      // fallback to file-backed memory
    }
  }
  await ensureLoaded();
  const turns = inMemorySessions.get(sessionId) ?? [];
  const rest = { ...turn };
  delete rest.locale;
  turns.push({ ...rest, createdAt: new Date().toISOString() });
  if (turns.length > STORE_LIMIT_PER_SESSION) {
    turns.splice(0, turns.length - STORE_LIMIT_PER_SESSION);
  }
  inMemorySessions.set(sessionId, turns);
  enqueuePersist();
}
