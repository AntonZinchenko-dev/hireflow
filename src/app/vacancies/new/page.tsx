// src/app/vacancies/new/page.tsx
import { createVacancyAction } from "@/features/vacancy-list/api/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewVacancyPage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Новая вакансия</h1>
      <p className="mt-1 text-sm text-slate-500">После создания вы сразу сможете открыть доску кандидатов.</p>
      <form action={createVacancyAction} className="mt-5 space-y-4">
        <Input name="title" placeholder="Frontend Developer (Middle+)" required />
        <Input name="department" placeholder="Engineering" />
        <Button type="submit" className="w-full">
          Создать
        </Button>
      </form>
    </section>
  );
}