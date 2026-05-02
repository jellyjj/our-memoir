import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "couple-auth";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has(COOKIE_NAME);
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isApiAuth = request.nextUrl.pathname.startsWith("/api/auth");
  const isStatic = request.nextUrl.pathname.startsWith("/uploads");

  if (isStatic) return NextResponse.next();

  if (!isAuthenticated && !isLoginPage && !isApiAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
