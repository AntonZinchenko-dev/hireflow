"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BriefcaseBusiness, LogOut, Search, User } from "lucide-react";
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
      <header className="sticky top-0 z-30 border-b border-[rgba(0,0,0,0.09)] bg-[#f7f7f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href={homeHref} className="flex items-center gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#cc2229] text-white shadow-sm">
              <Search className="size-4" />
            </span>
            <span className="text-sm font-semibold tracking-wide text-[#1a1a1a]">Работа.Найм</span>
          </Link>
          <nav className="flex max-w-full items-center gap-1.5 overflow-x-auto rounded-xl border border-[rgba(0,0,0,0.09)] bg-white p-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "h-9 rounded-lg px-3.5 text-[#6b6b6b] transition",
                    isActive && "bg-[#cc2229] text-white hover:text-white"
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
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 rounded-md px-3.5")}
          >
            <LogOut className="size-4" />
            Выход
          </button>
        </div>
        <div className="mx-auto w-full max-w-[1600px] px-4 pb-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b6b6b]">{sectionTitle}</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
