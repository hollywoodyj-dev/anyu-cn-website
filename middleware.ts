import { NextResponse, type NextRequest } from "next/server";
import {
  ANYU_DISCLAIMER_COOKIE,
  cnPathRequiresDisclaimerAck,
  isDisclaimerAcknowledged,
} from "@/lib/anyu/site-disclaimer";

export function middleware(req: NextRequest) {
  if (process.env.ANYU_SKIP_DISCLAIMER_MIDDLEWARE === "1") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;
  if (!cnPathRequiresDisclaimerAck(pathname)) {
    return NextResponse.next();
  }

  const cookieVal = req.cookies.get(ANYU_DISCLAIMER_COOKIE)?.value;
  if (isDisclaimerAcknowledged(cookieVal)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/cn/disclaimer";
  const dest = pathname + (req.nextUrl.search ?? "");
  url.searchParams.set("next", dest);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/cn/:path*"],
};
