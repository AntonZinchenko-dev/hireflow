import { beforeEach, describe, expect, it, vi } from "vitest";
import { createServerClient } from "@supabase/ssr";
import { middleware } from "../../middleware";

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("next/server", () => ({
  NextResponse: {
    next: () => ({ type: "next", cookies: { set: vi.fn() } }),
    redirect: (url: URL) => ({ type: "redirect", url: url.toString() }),
  },
}));

type SessionUser = {
  app_metadata?: { role?: string };
  user_metadata?: { role?: string };
};

function makeRequest(pathname: string) {
  return {
    url: `http://localhost:3000${pathname}`,
    nextUrl: { pathname },
    cookies: {
      get: vi.fn(),
      getAll: vi.fn(() => []),
    },
  } as unknown as Parameters<typeof middleware>[0];
}

function mockSession(user: SessionUser | null) {
  vi.mocked(createServerClient).mockReturnValue({
    auth: {
      getSession: vi.fn(async () => ({
        data: {
          session: user ? { user } : null,
        },
      })),
    },
  } as unknown as ReturnType<typeof createServerClient>);
}

describe("middleware auth and role routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("allows anonymous access to /login and redirects anonymous from private pages", async () => {
    mockSession(null);
    const loginResult = await middleware(makeRequest("/login"));
    expect((loginResult as { type: string }).type).toBe("next");

    const jobsResult = await middleware(makeRequest("/jobs"));
    expect((jobsResult as { type: string; url: string }).type).toBe("redirect");
    expect((jobsResult as { type: string; url: string }).url).toContain("/login");
  });

  it("redirects employer from root to /vacancies", async () => {
    mockSession({ app_metadata: { role: "admin" } });
    const result = await middleware(makeRequest("/"));
    expect((result as { url: string }).url).toContain("/vacancies");
  });

  it("redirects candidate from root to /jobs", async () => {
    mockSession({ app_metadata: { role: "candidate" } });
    const result = await middleware(makeRequest("/"));
    expect((result as { url: string }).url).toContain("/jobs");
  });

  it("blocks candidate from employer pages", async () => {
    mockSession({ app_metadata: { role: "candidate" } });
    const result = await middleware(makeRequest("/vacancies"));
    expect((result as { url: string }).url).toContain("/jobs");
  });

  it("blocks employer from candidate pages", async () => {
    mockSession({ app_metadata: { role: "admin" } });
    const result = await middleware(makeRequest("/me"));
    expect((result as { url: string }).url).toContain("/vacancies");
  });

  it("redirects candidate from nested jobs route back to /jobs", async () => {
    mockSession({ app_metadata: { role: "candidate" } });
    const result = await middleware(makeRequest("/jobs/some-vacancy"));
    expect((result as { url: string }).url).toContain("/jobs");
  });
});
