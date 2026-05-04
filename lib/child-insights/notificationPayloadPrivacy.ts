/**
 * V1.2 Priority D (Nova) — family-facing notification payloads must not carry
 * raw user verbatim, assistant full text, session ids, or chat-log-shaped blobs.
 * Allowed: short status-style copy, risk context, gentle actions, timestamps.
 */

const FORBIDDEN_SNIPPETS =
  /assistant_message|user_message|session[_-]?id|ConversationSignal|rawText|聊天记录|role\s*:\s*(user|assistant)/i;

const UUID_LIKE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;

export function containsForbiddenNotificationLeak(text: string): boolean {
  return FORBIDDEN_SNIPPETS.test(text);
}

export function stripSessionAndUuidNoise(text: string): string {
  return text.replace(UUID_LIKE, "").replace(/\s{2,}/g, " ").trim();
}

const MAX_NOTIFICATION_TITLE = 80;
const MAX_NOTIFICATION_MESSAGE = 900;

/** Final pass before persisting or returning app / email / SMS / push notification copy. */
export function normalizeFamilyNotificationStrings(
  title: string,
  message: string,
): { title: string; message: string } {
  let t = stripSessionAndUuidNoise(title).slice(0, MAX_NOTIFICATION_TITLE);
  let m = stripSessionAndUuidNoise(message).slice(0, MAX_NOTIFICATION_MESSAGE);
  if (containsForbiddenNotificationLeak(t)) t = "提醒";
  if (containsForbiddenNotificationLeak(m)) m = "有一条新的家庭提醒，请在应用内查看。";
  return { title: t || "提醒", message: m || "有一条新的家庭提醒。" };
}

/** `parentDisplayName` and similar — interpolates into notification templates. */
export function sanitizeParentLabelForNotification(label: string): string {
  const stripped = stripSessionAndUuidNoise(label.replace(/[\u0000-\u001F\u007F]/g, ""));
  const collapsed = stripped.replace(/\s+/g, " ").trim();
  const cut = collapsed.slice(0, 24);
  if (containsForbiddenNotificationLeak(cut)) return "家人";
  return cut || "家人";
}

/** DailySummary `keyMessages` JSON entries exposed on child APIs — reject legacy verbatim. */
export function scrubDailyKeyMessageLineForChild(s: string): string | null {
  const t = stripSessionAndUuidNoise(s).trim();
  if (!t) return null;
  if (containsForbiddenNotificationLeak(t)) return null;
  if (/\n/.test(s)) return null;
  if (t.length > 48) return null;
  return t;
}

/** Dashboard memory teaser: never surface long / blocked blobs as “preview”. */
export function curatedMemoryDashboardExcerpt(content: string, tag: string): string {
  const t = content.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (containsForbiddenNotificationLeak(t) || t.length > 48 || /\n/.test(t)) {
    return tag === "family" ? "有关于家人的一条记录。" : "有关于情绪的一条记录。";
  }
  return t.length > 36 ? `${t.slice(0, 36)}…` : t;
}
