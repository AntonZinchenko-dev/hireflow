"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Sparkles, Target, TimerReset } from "lucide-react";
import { resolveAppRole } from "@/shared/lib/auth-role";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsPending(false);
      setError(error.message);
      return;
    }

    const role = resolveAppRole(data.user);
    router.push(role === "employer" ? "/vacancies" : "/jobs");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-transparent lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden border-r border-[#3a3d44] bg-gradient-to-br from-[#313338] via-[#2b2d31] to-[#1e1f22] p-12 text-white lg:block">
        <div className="absolute -right-20 -top-20 size-72 rounded-full bg-white/15 blur-3xl" />
        <div className="absolute -bottom-24 left-0 size-80 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="relative space-y-8">
          <div className="space-y-3">
            <h1 className="max-w-md text-4xl font-semibold leading-tight">
              Нанимайте быстрее, а не тяжелее
            </h1>
            <p className="max-w-md text-sm text-white/85">
              HireFlow 2.0 объединяет канбан, профиль кандидата и аналитику конверсии в одном интерфейсе.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <Sparkles className="size-4 shrink-0" />
              <p className="text-sm">Единая доска по всем этапам подбора</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <Target className="size-4 shrink-0" />
              <p className="text-sm">Прозрачная конверсия и узкие места воронки</p>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <TimerReset className="size-4 shrink-0" />
              <p className="text-sm">Меньше ручных апдейтов, больше живой работы</p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-lg border border-[#3a3d44] bg-[#2b2d31]/95 p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.8)]"
        >
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight text-[#f2f3f5]">Вход в HireFlow</h2>
            <p className="text-sm text-[#b5bac1]">Используйте рабочий аккаунт для доступа.</p>
          </div>
          <div className="space-y-3">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 rounded-md"
            />
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-md pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8f95a0] transition hover:bg-[#353841] hover:text-[#dbdee1]"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          {error && <p className="rounded-md border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button type="submit" className="h-11 w-full rounded-md" disabled={isPending}>
            {isPending ? "Входим..." : "Войти"}
          </Button>
          <p className="text-center text-sm text-[#b5bac1]">
            Нет аккаунта?{" "}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
