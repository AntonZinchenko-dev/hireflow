// src/app/analytics/page.tsx
import { prisma } from "@/shared/lib/prisma-client";
import { getFunnelData } from
    "@/features/analytics-dashboard/api/getFunnelData";
import { FunnelChart } from "@/features/analytics-dashboard/ui/FunnelChart";

export default async function AnalyticsPage() {
    const vacancy = await prisma.vacancy.findFirst({
        orderBy: {
            createdAt:
                "desc"
        }
    });
    if (!vacancy) return <p className="p-8">Нет вакансий для анализа.</p>;
    const funnel = await getFunnelData(vacancy.id);
    return (
        <main className="mx-auto max-w-3xl p-8">
            <h1 className="mb-6 text-2xl font-bold text-slate-800">Воронка:
                {vacancy.title}</h1>
            <FunnelChart data={funnel} />
        </main>
    );
}
