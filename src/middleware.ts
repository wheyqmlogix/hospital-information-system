import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/crypto";

const protectedRoutes = ["/", "/admissions", "/patients", "/beds", "/inventory", "/lab", "/billing", "/reports", "/settings"];
const publicRoutes = ["/login"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => {
    if (route === "/") return path === "/";
    return path.startsWith(route);
  });
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get("session")?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isPublicRoute && session && path === "/login") {
    return NextResponse.redirect(new URL("/admissions", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
