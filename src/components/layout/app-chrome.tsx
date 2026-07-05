"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BriefcaseBusiness, KanbanSquare, LogOut } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/shared/lib/supabase-client";
import { cn } from "@/shared/lib/utils";

const navItems = [
  { href: "/board", label: "Доска", icon: KanbanSquare },
  { href: "/vacancies", label: "Вакансии", icon: BriefcaseBusiness },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const hideNavigation = pathname === "/login";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/board" className="text-sm font-semibold tracking-wide text-slate-800">
            HireFlow
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                    "px-3"
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
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "px-3")}
          >
            <LogOut className="size-4" />
            Выйти
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
