import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, AUTH_COOKIE_NAME } from "@/lib/token";

const ADMIN_EMAIL = "miadkhan.official1@gmail.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isAdminRoute = pathname.startsWith("/admin");
  const isStudentRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/practice") ||
    pathname.startsWith("/results");

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  // 1. If authenticated and visiting /login or /register, redirect to appropriate destination
  if (user && isAuthRoute) {
    if (user.role === "admin" || user.email.toLowerCase() === ADMIN_EMAIL) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. If NOT authenticated and visiting protected routes, redirect to /login
  if (!user && (isAdminRoute || isStudentRoute)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 3. If authenticated student attempting to access /admin, block and redirect to /dashboard
  if (user && isAdminRoute) {
    const isAdmin =
      user.role === "admin" || user.email.toLowerCase() === ADMIN_EMAIL;
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, manifest.json
     * - images and fonts
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
