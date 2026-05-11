import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export const proxy = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Role-based redirection for dashboard
    if (path === "/") {
      if (token?.role === "Doctor") {
        return NextResponse.redirect(new URL("/patients", req.url));
      }
      if (token?.role === "Billing Staff") {
        return NextResponse.redirect(new URL("/billing", req.url));
      }
    }

    // Permission checks for sensitive clinical modules
    if (path.startsWith("/settings") && !token?.permissions?.includes("can_manage_users")) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    if (path.startsWith("/staff") && !token?.permissions?.includes("can_manage_users")) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    if (path.startsWith("/billing") && !token?.permissions?.includes("can_view_billing")) {
      return NextResponse.rewrite(new URL("/403", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect all routes except login, public assets, and api routes
export const config = {
  matcher: [
    // Protect all routes except these specific ones
    "/((?!api|login|auth|icons|public|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};
