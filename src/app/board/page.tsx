import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma-client";
import { getServerSession } from "@/shared/lib/supabase-server";
import { buttonVariants } from "@/components/ui/button";

export default async function BoardIndexPage() {
  const latestVacancy = await prisma.vacancy.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  if (latestVacancy) {
    redirect(`/board/${latestVacancy.id}`);
  }

  const session = await getServerSession();
  const role = session?.user.app_metadata.role as string | undefined;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Пока нет вакансий</h1>
      <p className="mt-2 max-w-xl text-sm text-slate-600">
        Создайте первую вакансию, чтобы открыть канбан-доску, добавить кандидатов и начать вести
        воронку.
      </p>
      {role === "admin" ? (
        <Link href="/vacancies/new" className={`${buttonVariants()} mt-5`}>
          Создать первую вакансию
        </Link>
      ) : (
        <p className="mt-5 text-sm text-slate-500">
          Обратитесь к администратору, чтобы добавить первую вакансию.
        </p>
      )}
    </section>
  );
}
