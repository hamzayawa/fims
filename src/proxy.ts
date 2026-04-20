import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes mapping
  if (
    pathname === "/" ||
    pathname.startsWith("/api/auth") ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Session fetching via better-fetch (BetterAuth's recommended approach for edge)
  const { data: session } = await betterFetch<any>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  );

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = session.user.role;

  // Basic RBAC
  // FieldAgents should not access users/reports/alerts creation
  if (role === "FIELD_AGENT" || role === "VIEWER") {
    if (pathname.startsWith("/settings/users") || pathname.startsWith("/alerts/new")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Viewers shouldn't access ANY create/edit routes
  if (role === "VIEWER") {
    if (pathname.includes("/new") || pathname.includes("/edit")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Data officers shouldn't access users config
  if (role === "DATA_OFFICER" && pathname.startsWith("/settings/users")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
