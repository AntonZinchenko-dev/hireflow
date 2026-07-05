// src/features/scorecard/ui/ScorecardForm.tsx
"use client";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    scorecardSchema,
    type ScorecardFormInput,
    type ScorecardInput,
} from "../model/schema";
import { saveScorecardAction } from "../api/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


export function ScorecardForm({
    candidateId,
    onSaved,
}: {
    candidateId: string;
    onSaved: () => void;
}) {
    const form = useForm<ScorecardFormInput, unknown, ScorecardInput>({
        resolver: zodResolver(scorecardSchema),
        defaultValues: {
            candidateId, scoreTech: 3, scoreComm: 3, scoreCulture: 3,
            verdict: "lean_hire", criteria: []
        },
    });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "criteria"
    });
    async function onSubmit(values: ScorecardInput) {
        const result = await saveScorecardAction(values);
        if (result.ok) onSaved();
    }
    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <Input type="number" min={1} max={5} placeholder="Tech"
                    {...form.register("scoreTech")} />
                <Input type="number" min={1} max={5} placeholder="Comm"
                    {...form.register("scoreComm")} />
                <Input type="number" min={1} max={5} placeholder="Culture"
                    {...form.register("scoreCulture")} />
            </div>
            <select {...form.register("verdict")} className="w-full rounded-md
   border p-2">
                <option value="hire">Hire</option>
                <option value="lean_hire">Lean hire</option>
                <option value="lean_no_hire">Lean no hire</option>
                <option value="no_hire">No hire</option>
            </select>
            <div className="space-y-2">
                <div className="text-sm font-medium text-slate-600">Дополнительные
                    критерии</div>
                {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                        <Input placeholder="Название критерия"
                            {...form.register(`criteria.${index}.name`)} />
                        <Input type="number" min={1} max={5} className="w-20"
                            {...form.register(`criteria.${index}.score`)} />
                        <Button type="button" variant="ghost" onClick={() =>
                            remove(index)}>✕</Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={() => append({
                    name:
                        "", score: 3
                })}>
                    + Добавить критерий
                </Button>
            </div>
            <Button type="submit" className="w-full"
                disabled={form.formState.isSubmitting}>
                Сохранить оценку
            </Button>
        </form>
    );
}
