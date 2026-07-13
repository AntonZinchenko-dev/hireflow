import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma-client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { applyToVacancyAction, getOrCreateProfile } from "@/features/account/api/actions";
import { cn } from "@/shared/lib/utils";
import { getServerSession } from "@/shared/lib/supabase-server";
import { resolveAppRole } from "@/shared/lib/auth-role";
import { BriefcaseBusiness, Building2, Flame, MapPin, Search, Sparkles, Users } from "lucide-react";

const featuredQueries = ["React разработчик", "Project Manager", "Аналитик данных", "Дизайнер"];

const areaOrder = [
  "IT и разработка",
  "Маркетинг",
  "Медицина",
  "Образование",
  "Логистика",
  "HoReCa",
  "Строительство",
  "Финансы",
  "Наука и исследования",
  "HR и персонал",
];

function departmentToArea(department: string): string {
  const value = department.toLowerCase();
  if (value.includes("it") || value.includes("engineering") || value.includes("dev")) return "IT и разработка";
  if (value.includes("market")) return "Маркетинг";
  if (value.includes("med")) return "Медицина";
  if (value.includes("edu")) return "Образование";
  if (value.includes("log")) return "Логистика";
  if (value.includes("horeca")) return "HoReCa";
  if (value.includes("build")) return "Строительство";
  if (value.includes("finance") || value.includes("fin")) return "Финансы";
  if (value.includes("science") || value.includes("research")) return "Наука и исследования";
  if (value.includes("hr") || value.includes("people") || value.includes("recruit")) return "HR и персонал";
  return "IT и разработка";
}

function gradeToSalaryRange(grade: string): string {
  switch (grade.toLowerCase()) {
    case "junior":
      return "90 000 - 140 000 ₽";
    case "middle":
      return "150 000 - 240 000 ₽";
    case "senior":
      return "250 000 - 380 000 ₽";
    case "lead":
      return "320 000 - 450 000 ₽";
    default:
      return "120 000 - 200 000 ₽";
  }
}

function gradeToExperience(grade: string): string {
  switch (grade.toLowerCase()) {
    case "junior":
      return "1-2 года";
    case "middle":
      return "2-4 года";
    case "senior":
      return "3-6 лет";
    case "lead":
      return "5+ лет";
    default:
      return "2+ года";
  }
}

function formatPostedDate(date: Date): string {
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";
  return `${diffDays} дн. назад`;
}

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
  const areaCounters = vacancies.reduce<Record<string, number>>((acc, vacancy) => {
    const key = departmentToArea(vacancy.department);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const sortedAreas = areaOrder
    .map((name) => ({ name, count: areaCounters[name] ?? 0 }))
    .filter((item) => item.count > 0);

  return (
    <section className="hf-page pb-4">
      <div className="hf-card overflow-hidden border-primary/10">
        <div className="bg-gradient-to-r from-[#f1ebe1] via-[#f7f7f5] to-[#efe6d9] p-6 sm:p-8">
          <p className="hf-section-label">Поиск работы в России</p>
          <h1 className="mt-3 max-w-3xl text-4xl leading-tight text-foreground sm:text-5xl">
            Найдите работу, которая вдохновляет
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
            {`Более ${vacancies.length.toLocaleString("ru-RU")} вакансий от компаний по всей России`}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3">
              <MapPin className="size-4 text-muted-foreground" />
              <input
                value="Все города"
                readOnly
                aria-label="Город"
                className="w-full bg-transparent text-sm text-foreground outline-none"
              />
            </div>
            <button type="button" className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-xl px-7")}>
              <Search className="size-4" />
              Найти
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {featuredQueries.map((query) => (
              <span
                key={query}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
              >
                {query}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-6 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Активных вакансий</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{vacancies.length.toLocaleString("ru-RU")}</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Компаний</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {new Set(vacancies.map((item) => item.department)).size.toLocaleString("ru-RU")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Резюме</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {appliedRows.length.toLocaleString("ru-RU")}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Новых за месяц</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{vacancies.length}</p>
          </div>
        </div>
      </div>

      {sortedAreas.length > 0 && (
        <div className="hf-card p-6">
          <h2 className="text-2xl text-foreground">Профессиональные области</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sortedAreas.map((item) => (
              <article key={item.name} className="rounded-xl border border-border bg-secondary px-4 py-3">
                <p className="font-semibold text-foreground">{item.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.count} вакансий</p>
              </article>
            ))}
          </div>
        </div>
      )}

      <div className="hf-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl text-foreground">Найдено {vacancies.length} вакансий</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground sm:text-sm">
            <span>Сортировать:</span>
            <Badge variant="outline">По дате</Badge>
            <Badge variant="outline">По зарплате</Badge>
            <Badge variant="outline">По релевантности</Badge>
          </div>
        </div>
      </div>

      {vacancies.length === 0 ? (
        <div className="hf-card p-8 text-sm text-muted-foreground">
          Сейчас открытых вакансий нет. Загляните чуть позже.
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {vacancies.map((vacancy) => {
            const isHot = vacancy.grade === "senior" || vacancy.grade === "lead";
            const location = vacancy.department.toLowerCase().includes("remote") ? "Удаленно" : "Москва";
            const postedAt = formatPostedDate(new Date(vacancy.createdAt));
            return (
              <li key={vacancy.id} className="hf-card p-5 transition hover:border-primary/30">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex size-11 items-center justify-center rounded-xl bg-secondary text-foreground">
                      <Building2 className="size-5" />
                    </div>
                    {isHot && (
                      <Badge className="gap-1">
                        <Flame className="size-3" />
                        Горячая
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{vacancy.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{vacancy.department}</p>
                  </div>
                  <p className="text-lg font-semibold text-primary">{gradeToSalaryRange(vacancy.grade)}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BriefcaseBusiness className="size-3.5" />
                      {gradeToExperience(vacancy.grade)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="size-3.5" />
                      {postedAt}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{vacancy.grade}</Badge>
                    <Badge variant="outline">{vacancy.department}</Badge>
                    <Badge variant="outline">
                      <Sparkles className="size-3" />
                      Полная занятость
                    </Badge>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-2">
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
      {vacancies.length > 0 && (
        <div className="flex justify-center pt-2">
          <button type="button" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-xl")}>
            Показать еще вакансии
          </button>
        </div>
      )}
    </section>
  );
}
