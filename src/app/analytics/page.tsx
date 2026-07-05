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
            <section className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
                <h1 className="text-xl font-semibold text-slate-900">Пока нет данных для аналитики</h1>
                <p className="mt-2 text-sm text-slate-500">
                    Сначала создайте вакансию и добавьте кандидатов, чтобы увидеть воронку.
                </p>
                <Link href="/vacancies/new" className={`${buttonVariants()} mt-5`}>
                    Создать вакансию
                </Link>
            </section>
        );
    }
    const funnel = await getFunnelData(vacancy.id);
    return (
        <section className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Воронка: {vacancy.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Актуальная конверсия по этапам подбора для последней вакансии.
                </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <FunnelChart data={funnel} />
            </div>
        </section>
    );
}
