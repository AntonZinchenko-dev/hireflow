"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LogOut, Sparkles, User } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/shared/lib/supabase-client";
import { cn } from "@/shared/lib/utils";
import { resolveAppRole, type AppRole } from "@/shared/lib/auth-role";

const employerNavItems = [
  { href: "/vacancies", label: "Вакансии", icon: BriefcaseBusiness },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

const candidateNavItems = [
  { href: "/jobs", label: "Вакансии", icon: BriefcaseBusiness },
  { href: "/me", label: "Профиль", icon: User },
];

const employerPageTitles: Record<string, string> = {
  "/vacancies": "Управление вакансиями",
  "/analytics": "Метрики и конверсия",
  "/board": "Канбан вакансии",
};

const candidatePageTitles: Record<string, string> = {
  "/jobs": "Открытые вакансии",
  "/me": "Личный кабинет",
};

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<AppRole>(
    pathname.startsWith("/jobs") || pathname.startsWith("/me") ? "candidate" : "employer"
  );

  const hideNavigation = pathname === "/login" || pathname === "/register";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      setRole(resolveAppRole(data.user));
    });
  }, []);

  if (hideNavigation) {
    return <>{children}</>;
  }

  const navItems = role === "employer" ? employerNavItems : candidateNavItems;
  const pageTitles = role === "employer" ? employerPageTitles : candidatePageTitles;
  const homeHref = role === "employer" ? "/vacancies" : "/jobs";

  const activeSection = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  )?.href;
  const sectionTitle =
    (activeSection && pageTitles[activeSection]) ??
    Object.entries(pageTitles).find(([key]) => pathname.startsWith(`${key}/`))?.[1] ??
    "Главная";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
              <Sparkles className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-900">HireFlow 2.0</span>
          </Link>
          <nav className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white/85 p-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-9 rounded-xl px-3.5 text-slate-600 transition",
                    isActive && "bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:text-white"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-xl px-3.5")}
          >
            <LogOut className="size-4" />
            Выход
          </button>
        </div>
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-4 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">{sectionTitle}</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
