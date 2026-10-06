import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

const MANAGER_ROLES = new Set(["OWNER", "MANAGER"]);
const DASHBOARD_PREFIXES = ["/dashboard", "/orders", "/warehouse", "/employees", "/analytics"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isDashboardPath = DASHBOARD_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isDashboardPath && !MANAGER_ROLES.has(session.role)) {
    return NextResponse.redirect(new URL("/my-tasks", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/warehouse/:path*",
    "/employees/:path*",
    "/analytics/:path*",
    "/my-tasks/:path*",
    "/my-stats/:path*",
  ],
};
