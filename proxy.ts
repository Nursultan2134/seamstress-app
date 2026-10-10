import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const MANAGER_ROLES = new Set(["OWNER", "MANAGER"]);
const DASHBOARD_PREFIXES = ["/dashboard", "/orders", "/warehouse", "/employees", "/analytics"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Session cookies are long-lived (30 days) and only signature-verified above,
  // so a deactivated employee's existing cookie would otherwise keep working
  // until it expires. Re-check against the DB on every request.
  const employee = await prisma.employee.findUnique({
    where: { id: session.employeeId },
    select: { isActive: true },
  });

  if (!employee || !employee.isActive) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_COOKIE);
    return response;
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
