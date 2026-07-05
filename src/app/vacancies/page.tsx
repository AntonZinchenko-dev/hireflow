// src/app/vacancies/page.tsx

import Link from "next/link";
import { getVacancies } from "@/features/vacancy-list/api/actions";
import { buttonVariants } from "@/components/ui/button";

type VacancyListItem = {
    id: string;
    title: string;
    department: string;
    _count: {
        candidates: number;
    };
};

export default async function VacanciesPage() {
    const vacancies: VacancyListItem[] = await getVacancies();
    return (
        <main className="mx-auto max-w-3xl p-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Вакансии</h1>
                <Link href="/vacancies/new" className={buttonVariants()}>
                    Создать вакансию
                </Link>
            </div>
            <ul className="space-y-3">
                {vacancies.map((v) => (
                    <li key={v.id}>
                        <Link href={`/board/${v.id}`}
                            className="block rounded-lg border p-4 hover:bg-slate-50">
                            <div className="font-semibold text-slate-800">{v.title}</div>
                            <div className="text-sm text-slate-500">{v.department} ·
                                {v._count.candidates} кандидатов</div>
                        </Link>
                    </li>
                ))}
            </ul>
        </main>
    );
}