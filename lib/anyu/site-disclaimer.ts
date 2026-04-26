/**
 * 官网 `/cn/*` 免责阅读确认（Spec §8：配合 middleware，不仅依赖单页勾选）。
 * Edge-safe：仅常量与纯函数。
 */

export const ANYU_DISCLAIMER_COOKIE = "anyu_disclaimer_ack" as const;
export const ANYU_DISCLAIMER_COOKIE_VALUE = "1" as const;

/** 未勾选时仍可访问的路径（同意前允许阅读原则与安全说明） */
export const CN_PUBLIC_PATH_PREFIXES = [
  "/cn/disclaimer",
  "/cn/ethics",
  "/cn/safety",
] as const;

export function isDisclaimerAcknowledged(cookieValue: string | undefined): boolean {
  return cookieValue === ANYU_DISCLAIMER_COOKIE_VALUE;
}

/** `/cn` 及子路径是否必须先完成免责确认 */
export function cnPathRequiresDisclaimerAck(pathname: string): boolean {
  if (!pathname.startsWith("/cn")) return false;
  return !CN_PUBLIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * 防开放重定向：`next` 必须为站内 `/cn` 相对路径。
 */
export function sanitizeDisclaimerNext(next: string | undefined): string {
  if (!next || typeof next !== "string") return "/cn";
  const trimmed = next.trim();
  if (!trimmed.startsWith("/cn")) return "/cn";
  if (trimmed.startsWith("//") || trimmed.includes("://")) return "/cn";
  if (trimmed.includes("..")) return "/cn";
  return trimmed;
}
