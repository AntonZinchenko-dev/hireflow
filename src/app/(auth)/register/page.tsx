"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";

type AccountType = "employer" | "candidate";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    let supabase;
    try {
      supabase = createClient();
    } catch {
      setIsPending(false);
      setError("Конфигурация Supabase не найдена. Проверьте переменные окружения.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: accountType,
        },
      },
    });

    if (signUpError) {
      setIsPending(false);
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      router.push(accountType === "employer" ? "/vacancies" : "/jobs");
      router.refresh();
      return;
    }

    setIsPending(false);
    setMessage("Готово! Проверьте почту и подтвердите аккаунт, затем войдите.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.3)]"
      >
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Create account</p>
          <h2 className="text-3xl tracking-tight text-foreground">Регистрация</h2>
          <p className="text-sm text-muted-foreground">Выберите тип аккаунта и создайте доступ.</p>
        </div>
        <div className="flex gap-2 rounded-lg border border-border bg-secondary p-1">
          <button
            type="button"
            onClick={() => setAccountType("candidate")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              accountType === "candidate" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Я кандидат
          </button>
          <button
            type="button"
            onClick={() => setAccountType("employer")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              accountType === "employer" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"
            }`}
          >
            Я работодатель
          </button>
        </div>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Имя и фамилия"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="h-11 rounded-md"
          />
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
              minLength={6}
              className="h-11 rounded-md pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Badge variant="outline" className="w-full justify-center py-1.5 text-muted-foreground">
          Тип аккаунта: {accountType === "employer" ? "Работодатель" : "Кандидат"}
        </Badge>
        {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {message && <p className="rounded-md border border-emerald-400/40 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        <Button type="submit" className="h-11 w-full rounded-md" disabled={isPending}>
          {isPending ? "Создаем аккаунт..." : "Создать аккаунт"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-primary hover:text-primary/80">
            Войти
          </Link>
        </p>
      </form>
    </main>
  );
}
