// src/app/analytics/page.tsx
import Link from "next/link";
import { prisma } from "@/shared/lib/prisma-client";
import { getFunnelData } from
    "@/features/analytics-dashboard/api/getFunnelData";
import { FunnelChart } from "@/features/analytics-dashboard/ui/FunnelChart";
import { buttonVariants } from "@/components/ui/button";

export default async function AnalyticsPage() {
    const vacancy = await prisma.vacancy.findFirst({
        orderBy: {
            createdAt:
                "desc"
        }
    });
    if (!vacancy) {
        return (
            <section className="hf-card p-10">
                <h1 className="text-xl font-semibold text-slate-900">Пока нет данных для аналитики</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Сначала создайте вакансию и добавьте кандидатов, чтобы увидеть воронку.
                </p>
                <Link href="/vacancies/new" className={`${buttonVariants()} mt-5 rounded-xl`}>
                    Создать вакансию
                </Link>
            </section>
        );
    }
    const funnel = await getFunnelData(vacancy.id);
    const totalCandidates = funnel[0]?.count ?? 0;
    const finalCandidates = funnel.at(-1)?.count ?? 0;
    const endToEndConversion = totalCandidates > 0
        ? Math.round((finalCandidates / totalCandidates) * 100)
        : 0;

    return (
        <section className="hf-page">
            <div className="hf-card p-6">
                <p className="hf-section-label">Funnel Overview</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-900">Воронка: {vacancy.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Актуальная конверсия по этапам подбора для последней вакансии.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3">
                    <p className="text-sm text-slate-500">Входящий поток</p>
                    <p className="text-2xl font-semibold text-slate-900">{totalCandidates}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3">
                    <p className="text-sm text-slate-500">Финальный этап</p>
                    <p className="text-2xl font-semibold text-slate-900">{finalCandidates}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/85 px-4 py-3">
                    <p className="text-sm text-slate-500">End-to-end конверсия</p>
                    <p className="text-2xl font-semibold text-indigo-700">{endToEndConversion}%</p>
                </div>
            </div>
            <div className="hf-card p-5">
                <FunnelChart data={funnel} />
            </div>
        </section>
    );
}
