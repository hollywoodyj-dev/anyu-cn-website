import { NextResponse } from "next/server";
import {
  ANYU_DISCLAIMER_COOKIE,
  ANYU_DISCLAIMER_COOKIE_VALUE,
  sanitizeDisclaimerNext,
} from "@/lib/anyu/site-disclaimer";

export const runtime = "nodejs";

/**
 * POST /api/cn/disclaimer-ack — 设置 HttpOnly cookie，供 middleware 放行 `/cn/*`。
 * 与免责页勾选配合使用（Implementation Spec §8：服务端确认，不仅前端 Link）。
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const nextHref = sanitizeDisclaimerNext(url.searchParams.get("next") ?? undefined);
  const accept = req.headers.get("accept") ?? "";
  const wantsHtml = accept.includes("text/html");
  const res = wantsHtml
    ? NextResponse.redirect(new URL(nextHref, url.origin))
    : NextResponse.json({ ok: true, next: nextHref });
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set({
    name: ANYU_DISCLAIMER_COOKIE,
    value: ANYU_DISCLAIMER_COOKIE_VALUE,
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 400,
  });
  return res;
}
