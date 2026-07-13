// src/app/analytics/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma-client";
import { getAggregateFunnelData, getFunnelData } from
    "@/features/analytics-dashboard/api/getFunnelData";
import { FunnelChart } from "@/features/analytics-dashboard/ui/FunnelChart";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";

type AnalyticsPageProps = {
    searchParams?: Promise<{
        vacancy?: string;
    }>;
};

export const dynamic = "force-dynamic";

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
    const session = await getServerSession();
    if (!session) {
        redirect("/login");
    }
    if (resolveAppRole(session.user) !== "employer") {
        redirect("/jobs");
    }

    const resolvedSearchParams = await searchParams;
    const vacancies = await prisma.vacancy.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            title: true,
            status: true,
        },
    });

    if (vacancies.length === 0) {
        return (
            <section className="hf-card p-10">
                <h1 className="text-xl font-semibold text-foreground">Пока нет данных для аналитики</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Сначала создайте вакансию и добавьте кандидатов, чтобы увидеть воронку.
                </p>
                <Link href="/vacancies/new" className={`${buttonVariants()} mt-5 rounded-xl`}>
                    Создать вакансию
                </Link>
            </section>
        );
    }

    const requestedVacancyId = resolvedSearchParams?.vacancy;
    const selectedVacancy = requestedVacancyId
        ? vacancies.find((vacancy) => vacancy.id === requestedVacancyId) ?? null
        : null;
    const funnel = selectedVacancy ? await getFunnelData(selectedVacancy.id) : await getAggregateFunnelData();
    const totalCandidates = funnel[0]?.count ?? 0;
    const finalCandidates = funnel.at(-1)?.count ?? 0;
    const endToEndConversion = totalCandidates > 0
        ? Math.round((finalCandidates / totalCandidates) * 100)
        : 0;
    const stageConversions = funnel.slice(1).map((point) => point.conversionRate);
    const averageStageConversion = stageConversions.length > 0
        ? Math.round(stageConversions.reduce((sum, value) => sum + value, 0) / stageConversions.length)
        : 0;
    const biggestDrop = funnel.slice(1).reduce<{
        stageName: string;
        drop: number;
    }>((current, point, index) => {
        const previousCount = funnel[index]?.count ?? point.count;
        const drop = Math.max(0, previousCount - point.count);
        if (drop > current.drop) {
            return { stageName: point.stageName, drop };
        }
        return current;
    }, { stageName: "-", drop: 0 });
    const analyticsTitle = selectedVacancy ? `Воронка: ${selectedVacancy.title}` : "Воронка: Все вакансии";
    const analyticsSubtitle = selectedVacancy
        ? "Показатели и конверсия по выбранной вакансии."
        : "Суммарная конверсия по всем активным и закрытым вакансиям.";

    return (
        <section className="hf-page">
            <div className="hf-card p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="hf-section-label">Funnel Overview</p>
                        <h1 className="mt-1 text-2xl font-semibold text-foreground">{analyticsTitle}</h1>
                        <p className="mt-1 text-sm text-muted-foreground">{analyticsSubtitle}</p>
                    </div>
                    <form method="get" className="flex w-full max-w-sm flex-col gap-2 sm:w-auto">
                        <select
                            name="vacancy"
                            defaultValue={selectedVacancy?.id ?? "all"}
                            className="h-10 rounded-xl border border-input bg-input-background px-3 text-sm text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
                        >
                            <option value="all" className="bg-card text-foreground">Все вакансии</option>
                            {vacancies.map((vacancy) => (
                                <option key={vacancy.id} value={vacancy.id} className="bg-card text-foreground">
                                    {vacancy.title} ({vacancy.status === "open" ? "Открыта" : "Закрыта"})
                                </option>
                            ))}
                        </select>
                        <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                            Показать
                        </button>
                    </form>
                </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm text-muted-foreground">Входящий поток</p>
                    <p className="text-2xl font-semibold text-foreground">{totalCandidates}</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm text-muted-foreground">Финальный этап</p>
                    <p className="text-2xl font-semibold text-foreground">{finalCandidates}</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm text-muted-foreground">End-to-end конверсия</p>
                    <p className="text-2xl font-semibold text-primary">{endToEndConversion}%</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm text-muted-foreground">Средняя конверсия этапов</p>
                    <p className="text-2xl font-semibold text-foreground">{averageStageConversion}%</p>
                </div>
                <div className="rounded-xl border border-border bg-card px-4 py-3">
                    <p className="text-sm text-muted-foreground">Самый узкий этап</p>
                    <p className="text-sm font-semibold text-foreground">{biggestDrop.stageName}</p>
                    <p className="text-xs text-destructive">Потеря: {biggestDrop.drop}</p>
                </div>
            </div>
            {funnel.length === 0 ? (
                <div className="hf-card p-8 text-sm text-muted-foreground">
                    Для выбранной вакансии пока нет этапов воронки.
                </div>
            ) : (
                <div className="hf-card p-5">
                    <FunnelChart data={funnel} />
                </div>
            )}
        </section>
    );
}
