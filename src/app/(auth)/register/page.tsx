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
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

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
        className="w-full max-w-md space-y-6 rounded-lg border border-[#3a3d44] bg-[#2b2d31]/95 p-8 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.8)]"
      >
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-indigo-600">Create account</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[#f2f3f5]">Регистрация</h2>
          <p className="text-sm text-[#b5bac1]">Выберите тип аккаунта и создайте доступ.</p>
        </div>
        <div className="flex gap-2 rounded-lg border border-[#3a3d44] bg-[#232428] p-1">
          <button
            type="button"
            onClick={() => setAccountType("candidate")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              accountType === "candidate" ? "bg-[#313338] text-indigo-300 shadow-sm" : "text-[#8f95a0]"
            }`}
          >
            Я кандидат
          </button>
          <button
            type="button"
            onClick={() => setAccountType("employer")}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
              accountType === "employer" ? "bg-[#313338] text-indigo-300 shadow-sm" : "text-[#8f95a0]"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8f95a0] transition hover:bg-[#353841] hover:text-[#dbdee1]"
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <Badge variant="outline" className="w-full justify-center py-1.5 text-[#b5bac1]">
          Тип аккаунта: {accountType === "employer" ? "Работодатель" : "Кандидат"}
        </Badge>
        {error && <p className="rounded-md border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-300">{error}</p>}
        {message && <p className="rounded-md border border-emerald-900/40 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-300">{message}</p>}
        <Button type="submit" className="h-11 w-full rounded-md" disabled={isPending}>
          {isPending ? "Создаем аккаунт..." : "Создать аккаунт"}
        </Button>
        <p className="text-center text-sm text-[#b5bac1]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
            Войти
          </Link>
        </p>
      </form>
    </main>
  );
}
