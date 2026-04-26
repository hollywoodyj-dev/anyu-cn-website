import { NextResponse } from "next/server";
import {
  ANYU_DISCLAIMER_COOKIE,
  ANYU_DISCLAIMER_COOKIE_VALUE,
} from "@/lib/anyu/site-disclaimer";

export const runtime = "nodejs";

/**
 * POST /api/cn/disclaimer-ack — 设置 HttpOnly cookie，供 middleware 放行 `/cn/*`。
 * 与免责页勾选配合使用（Implementation Spec §8：服务端确认，不仅前端 Link）。
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
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
