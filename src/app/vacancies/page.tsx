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
  const totalCandidates = vacancies.reduce((sum, vacancy) => sum + vacancy._count.candidates, 0);

  return (
    <section className="hf-page">
      <div className="hf-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="hf-section-label">Pipeline Control</p>
            <h1 className="hf-title">Вакансии</h1>
            <p className="hf-subtitle">Запускайте позиции и открывайте канбан в один клик.</p>
          </div>
          <Link href="/vacancies/new" className={buttonVariants()}>
            Создать вакансию
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-slate-500">Всего вакансий</p>
            <p className="text-lg font-semibold text-slate-900">{vacancies.length}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-slate-500">Кандидатов в работе</p>
            <p className="text-lg font-semibold text-slate-900">{totalCandidates}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2">
            <p className="text-slate-500">Среднее на вакансию</p>
            <p className="text-lg font-semibold text-slate-900">
              {vacancies.length ? Math.round(totalCandidates / vacancies.length) : 0}
            </p>
          </div>
        </div>
      </div>
      {vacancies.length === 0 ? (
        <div className="hf-card p-10 text-sm text-slate-500">
          Пока нет вакансий. Создайте первую, чтобы запустить воронку найма.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vacancies.map((v) => (
            <li key={v.id}>
              <Link
                href={`/board/${v.id}`}
                className="group block rounded-2xl border border-slate-200/90 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
              >
                <p className="text-lg font-semibold text-slate-900 transition group-hover:text-indigo-700">{v.title}</p>
                <p className="mt-1 text-sm text-slate-500">{v.department}</p>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Кандидаты: {v._count.candidates}</span>
                  <span className="text-sm font-semibold text-indigo-700">Открыть канбан →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}