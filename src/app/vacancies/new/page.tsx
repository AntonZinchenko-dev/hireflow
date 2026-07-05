// src/app/vacancies/new/page.tsx
import { createVacancyAction } from "@/features/vacancy-list/api/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NewVacancyPage() {
    return (
        <main className="mx-auto max-w-md p-8">
            <h1 className="mb-4 text-xl font-bold">Новая вакансия</h1>
            <form action={createVacancyAction} className="space-y-4">
                <Input name="title" placeholder="Frontend Developer (Middle+)"
                    required />
                <Input name="department" placeholder="Engineering" />
                <Button type="submit" className="w-full">Создать</Button>
            </form>
        </main>
    );
}