import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  const isE2EBypass =
    process.env.NODE_ENV !== "production" &&
    req.cookies.get("e2e-bypass")?.value === "1";

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
    if (pathname === "/login") return res;
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" || pathname === "/login") {
    const role = session.user.app_metadata.role as string | undefined;
    const landingPath = role === "admin" ? "/vacancies" : "/analytics";
    return NextResponse.redirect(new URL(landingPath, req.url));
  }

  const role = session.user.app_metadata.role as string | undefined;
  if (pathname.startsWith("/vacancies") && role !== "admin") {
    return NextResponse.redirect(new URL("/analytics", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/", "/login", "/board/:path*", "/vacancies/:path*", "/analytics/:path*"],
};
