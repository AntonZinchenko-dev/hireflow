"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/lib/supabase-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email, password
        });
        if (error) { setError(error.message); return; }
        router.push("/board");
        router.refresh();
    }
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate50">
            <form onSubmit={handleSubmit} className="w-80 space-y-4 rounded-xl
border bg-white p-6 shadow-sm">
                <h1 className="text-xl font-bold text-slate-800">Вход в HireFlow</h1>
                <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Пароль" value={password}
                    onChange={(e) => setPassword(e.target.value)} required />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" className="w-full">Войти</Button>
            </form>
        </main>
    );
}
