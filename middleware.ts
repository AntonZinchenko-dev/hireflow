import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveAppRole } from "@/shared/lib/auth-role";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const isForceAnon =
    process.env.NODE_ENV !== "production" &&
    req.cookies.get("e2e-force-anon")?.value === "1";
  const isE2EBypass =
    process.env.NODE_ENV !== "production" &&
    req.cookies.get("e2e-bypass")?.value === "1" &&
    pathname.startsWith("/board");

  if (isForceAnon) {
    if (pathname === "/login" || pathname === "/register") return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isE2EBypass) {
    return res;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list) => list.forEach(({ name, value }) => res.cookies.set(name, value)),
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (pathname === "/login" || pathname === "/register") return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = resolveAppRole(session.user);

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    const landingPath = role === "employer" ? "/vacancies" : "/jobs";
    return NextResponse.redirect(new URL(landingPath, req.url));
  }

  if (role !== "employer" && (pathname.startsWith("/vacancies") || pathname.startsWith("/board") || pathname.startsWith("/analytics"))) {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }

  if (role !== "candidate" && (pathname.startsWith("/jobs") || pathname.startsWith("/me"))) {
    return NextResponse.redirect(new URL("/vacancies", req.url));
  }

  if (role === "candidate" && pathname.startsWith("/jobs/")) {
    return NextResponse.redirect(new URL("/jobs", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/board",
    "/board/:path*",
    "/vacancies",
    "/vacancies/:path*",
    "/analytics",
    "/analytics/:path*",
    "/jobs",
    "/jobs/:path*",
    "/me",
    "/me/:path*",
  ],
};
