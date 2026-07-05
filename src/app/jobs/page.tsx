import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma-client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { applyToVacancyAction, getOrCreateProfile } from "@/features/account/api/actions";
import { cn } from "@/shared/lib/utils";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";

export default async function JobsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  if (resolveAppRole(session.user) !== "candidate") {
    redirect("/vacancies");
  }

  const profile = await getOrCreateProfile();
  const vacancies = await prisma.vacancy.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "desc" },
    include: {
      stages: {
        orderBy: { order: "asc" },
        include: { _count: { select: { candidates: true } } },
      },
    },
  });
  const appliedRows = await prisma.candidate.findMany({
    where: {
      portalProfileId: profile.id,
      vacancyId: { in: vacancies.map((vacancy) => vacancy.id) },
    },
    select: { vacancyId: true },
  });
  const appliedVacancyIds = new Set(appliedRows.map((row) => row.vacancyId));

  return (
    <section className="hf-page">
      <div className="hf-card p-6">
        <p className="hf-section-label">Open Vacancies</p>
        <h1 className="hf-title">Вакансии в работе</h1>
        <p className="hf-subtitle">Смотрите прогресс по вакансиям и этапам найма в реальном времени.</p>
      </div>
      {vacancies.length === 0 ? (
        <div className="hf-card p-8 text-sm text-slate-500">
          Сейчас открытых вакансий нет. Загляните чуть позже.
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {vacancies.map((vacancy) => {
            return (
              <li key={vacancy.id} className="hf-card p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold text-[#f2f3f5]">{vacancy.title}</h2>
                    <Badge variant="secondary">{vacancy.department}</Badge>
                  </div>
                  <p className="text-sm text-[#b5bac1]">Открытая позиция, можно отправить отклик.</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <form action={applyToVacancyAction}>
                    <input type="hidden" name="vacancyId" value={vacancy.id} />
                    <button
                      type="submit"
                      disabled={appliedVacancyIds.has(vacancy.id)}
                      className={cn(
                        buttonVariants({
                          variant: appliedVacancyIds.has(vacancy.id) ? "outline" : "default",
                          size: "sm",
                        }),
                        "rounded-md"
                      )}
                    >
                      {appliedVacancyIds.has(vacancy.id) ? "Вы уже откликнулись" : "Откликнуться"}
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
