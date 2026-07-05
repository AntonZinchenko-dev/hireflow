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
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Вакансии</h1>
          <p className="text-sm text-slate-500">Управляйте позициями и переходите в доску кандидатов.</p>
        </div>
        <Link href="/vacancies/new" className={buttonVariants()}>
          Создать вакансию
        </Link>
      </div>
      {vacancies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
          Пока нет вакансий. Создайте первую, чтобы начать работу с доской и аналитикой.
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {vacancies.map((v) => (
            <li key={v.id}>
              <Link
                href={`/board/${v.id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow"
              >
                <div className="font-semibold text-slate-900">{v.title}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {v.department} · {v._count.candidates} кандидатов
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}