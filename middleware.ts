import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const profileSession = req.cookies.get("profile_session");

  // Protect Admin Routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!profileSession) {
      const url = new URL("/login", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Redirect to Admin if already logged in
  if (req.nextUrl.pathname === "/login") {
    if (profileSession) {
      const url = new URL("/admin", req.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
