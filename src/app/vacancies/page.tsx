// src/app/vacancies/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getVacancies } from "@/features/vacancy-list/api/actions";
import { buttonVariants } from "@/components/ui/button";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";

type VacancyListItem = {
    id: string;
    title: string;
    department: string;
    _count: {
        candidates: number;
    };
};

export default async function VacanciesPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (resolveAppRole(session.user) !== "employer") {
    redirect("/jobs");
  }

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
          <div className="rounded-xl border border-[#3a3d44] bg-[#1f2125]/90 px-3 py-2">
            <p className="text-[#b5bac1]">Всего вакансий</p>
            <p className="text-lg font-semibold text-[#f2f3f5]">{vacancies.length}</p>
          </div>
          <div className="rounded-xl border border-[#3a3d44] bg-[#1f2125]/90 px-3 py-2">
            <p className="text-[#b5bac1]">Кандидатов в работе</p>
            <p className="text-lg font-semibold text-[#f2f3f5]">{totalCandidates}</p>
          </div>
          <div className="rounded-xl border border-[#3a3d44] bg-[#1f2125]/90 px-3 py-2">
            <p className="text-[#b5bac1]">Среднее на вакансию</p>
            <p className="text-lg font-semibold text-[#f2f3f5]">
              {vacancies.length ? Math.round(totalCandidates / vacancies.length) : 0}
            </p>
          </div>
        </div>
      </div>
      {vacancies.length === 0 ? (
        <div className="hf-card p-10 text-sm text-[#b5bac1]">
          Пока нет вакансий. Создайте первую, чтобы запустить воронку найма.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vacancies.map((v) => (
            <li key={v.id}>
              <Link
                href={`/board/${v.id}`}
                className="group block rounded-2xl border border-[#3a3d44] bg-[#2b2d31] p-5 shadow-[0_14px_30px_-24px_rgba(0,0,0,0.7)] transition hover:-translate-y-0.5 hover:border-[#5865f2] hover:shadow-[0_16px_36px_-24px_rgba(88,101,242,0.45)]"
              >
                <p className="text-lg font-semibold text-[#f2f3f5] transition group-hover:text-[#949cf7]">{v.title}</p>
                <p className="mt-1 text-sm text-[#b5bac1]">{v.department}</p>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-[#3a3d44] bg-[#1f2125] px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-[#b5bac1]">Кандидаты: {v._count.candidates}</span>
                  <span className="text-sm font-semibold text-[#949cf7]">Открыть канбан →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}