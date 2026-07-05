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

export function CandidateForm({ candidate, onSaved }: {
    candidate?: Candidate;
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
        : { source: "site", grade: "middle" };

    const form = useForm<CandidateFormInput, unknown, CandidateInput>({
        resolver: zodResolver(candidateSchema),
        defaultValues,
    });
    const source = form.watch("source");
    const grade = form.watch("grade");
    async function onSubmit(values: CandidateInput) {
        const result = await saveCandidateAction(values);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Input placeholder="ФИО" {...form.register("fullName")} />
                {form.formState.errors.fullName && (
                    <p className="mt-1 text-xs text-red600">{form.formState.errors.fullName.message}</p>
                )}
            </div><select {...form.register("source")} className="w-full rounded-md border
p-2">
                <option value="site">Сайт</option>
                <option value="referral">Реферал</option>
                <option value="agency">Агентство</option>
                <option value="headhunting">Хедхантинг</option>
            </select>
            {source === "referral" && (
                <div>
                    <Input placeholder="Кто порекомендовал"
                        {...form.register("referrerName")} />
                    {form.formState.errors.referrerName && (
                        <p className="mt-1 text-xs text-red600">{form.formState.errors.referrerName.message}</p>
                    )}
                </div>
            )}
            <select {...form.register("grade")} className="w-full rounded-md border
p-2">
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
            </select>
            {["senior", "lead"].includes(grade) && (
                <div>
                    <Textarea placeholder="Ожидания по видению роли"
                        {...form.register("seniorityExpectations")} />
                    {form.formState.errors.seniorityExpectations && (
                        <p className="mt-1 text-xs text-red600">{form.formState.errors.seniorityExpectations.message}</p>
                    )}
                </div>
            )}
            <Input type="number" placeholder="Ожидаемая зарплата"
                {...form.register("expectedSalary")} />
            <Button type="submit" disabled={form.formState.isSubmitting}
                className="w-full">
                Сохранить
            </Button>
        </form>
    );
}