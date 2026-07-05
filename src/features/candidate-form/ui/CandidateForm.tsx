// src/features/candidate-form/ui/CandidateForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    candidateSchema,
    type CandidateFormInput,
    type CandidateInput,
} from "../model/schema";
import { saveCandidateAction } from "../api/actions";

import type { Candidate } from "@/entities/candidate/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const selectClassName =
    "h-10 w-full rounded-xl border border-input bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

export function CandidateForm({ candidate, vacancyId, defaultStageId, onSaved }: {
    candidate?: Candidate;
    vacancyId: string;
    defaultStageId: string;
    onSaved: () => void
}) {
    const defaultValues: Partial<CandidateFormInput> = candidate
        ? {
            id: candidate.id,
            fullName: candidate.fullName,
            source: candidate.source,
            referrerName: candidate.referrerName ?? undefined,
            grade: candidate.grade,
            seniorityExpectations: candidate.seniorityExpectations ?? undefined,
            stageId: candidate.stageId,
            expectedSalary: candidate.expectedSalary,
            offerAmount: candidate.offerAmount ?? undefined,
            offerDeadline: candidate.offerDeadline ?? undefined,
        }
        : { source: "site", grade: "middle", stageId: defaultStageId };

    const form = useForm<CandidateFormInput, unknown, CandidateInput>({
        resolver: zodResolver(candidateSchema),
        defaultValues,
    });
    const source = form.watch("source");
    const grade = form.watch("grade");
    async function onSubmit(values: CandidateInput) {
        const result = await saveCandidateAction({ ...values, vacancyId });
        if (!result.ok) {
            Object.entries(result.errors.fieldErrors ?? {}).forEach(([field,
                messages]) => {
                const message = messages?.[0];
                if (!message) return;
                form.setError(field as keyof CandidateFormInput, { message });
            });
            return;
        }
        onSaved();
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="hf-form-grid py-5">
            <input type="hidden" value={vacancyId} readOnly />
            <input type="hidden" {...form.register("stageId")} />
            <div className="space-y-1.5">
                <Label htmlFor="fullName">ФИО кандидата</Label>
                <Input id="fullName" placeholder="Иван Петров" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                    <p className="text-xs text-red-600">{form.formState.errors.fullName.message}</p>
                )}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="source">Источник</Label>
                <select id="source" {...form.register("source")} className={selectClassName}>
                    <option value="site">Сайт</option>
                    <option value="referral">Реферал</option>
                    <option value="agency">Агентство</option>
                    <option value="headhunting">Хедхантинг</option>
                </select>
            </div>
            {source === "referral" && (
                <div className="space-y-1.5">
                    <Label htmlFor="referrerName">Кто порекомендовал</Label>
                    <Input id="referrerName" placeholder="Имя коллеги"
                        {...form.register("referrerName")} />
                    {form.formState.errors.referrerName && (
                        <p className="text-xs text-red-600">{form.formState.errors.referrerName.message}</p>
                    )}
                </div>
            )}
            <div className="space-y-1.5">
                <Label htmlFor="grade">Грейд</Label>
                <select id="grade" {...form.register("grade")} className={selectClassName}>
                    <option value="junior">Junior</option>
                    <option value="middle">Middle</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                </select>
            </div>
            {["senior", "lead"].includes(grade) && (
                <div className="space-y-1.5">
                    <Label htmlFor="seniorityExpectations">Ожидания по роли</Label>
                    <Textarea id="seniorityExpectations" placeholder="Опыт в продукте, ownership, leadership"
                        {...form.register("seniorityExpectations")} />
                    {form.formState.errors.seniorityExpectations && (
                        <p className="text-xs text-red-600">{form.formState.errors.seniorityExpectations.message}</p>
                    )}
                </div>
            )}
            <div className="space-y-1.5">
                <Label htmlFor="expectedSalary">Ожидаемая зарплата</Label>
                <Input id="expectedSalary" type="number" placeholder="220000"
                    {...form.register("expectedSalary")} />
            </div>
            <Button type="submit" disabled={form.formState.isSubmitting} className="mt-3 w-full rounded-xl">
                {form.formState.isSubmitting ? "Сохраняем..." : "Сохранить"}
            </Button>
        </form>
    );
}