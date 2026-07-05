// src/app/vacancies/new/page.tsx
import { createVacancyAction } from "@/features/vacancy-list/api/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function NewVacancyPage() {
  return (
    <section className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="hf-card p-7">
        <p className="hf-section-label">Create position</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Новая вакансия</h1>
        <p className="mt-2 text-sm text-slate-500">
          Заполните основные поля. Канбан-этапы будут готовы сразу после создания.
        </p>
        <form action={createVacancyAction} className="mt-7 hf-form-grid">
          <div className="space-y-1.5">
            <Label htmlFor="title">Название</Label>
            <Input id="title" name="title" placeholder="Frontend Developer (Middle+)" required className="h-11 rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="department">Департамент</Label>
            <Input id="department" name="department" placeholder="Engineering" className="h-11 rounded-xl" />
          </div>
          <Button type="submit" className="h-11 w-full rounded-xl">
            Создать вакансию
          </Button>
        </form>
      </div>
      <aside className="hf-card-tight p-6">
        <h2 className="text-lg font-semibold text-slate-900">Что будет дальше</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li>Откроется доска кандидатов по новой вакансии.</li>
          <li>Появятся этапы воронки с drag-and-drop.</li>
          <li>Аналитика начнет считать конверсию по стадиям.</li>
        </ul>
      </aside>
    </section>
  );
}