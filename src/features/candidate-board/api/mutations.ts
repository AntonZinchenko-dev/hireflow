"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveCandidateAction } from "./actions";
import type { Candidate } from "@/entities/candidate/types";

export function useMoveCandidate(vacancyId: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: moveCandidateAction,
        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: ["candidates", vacancyId] });
            const previous = qc.getQueryData<Candidate[]>(["candidates",
                vacancyId]);
            qc.setQueryData<Candidate[]>(["candidates", vacancyId], (old = []) =>
                old.map((c) => (c.id === input.candidateId ? {
                    ...c, stageId:
                        input.stageId
                } : c))
            );
            return { previous };
        },
        onError: (_err, _input, context) => {
            if (context?.previous) qc.setQueryData(["candidates", vacancyId],
                context.previous);
        },
        onSettled: () => qc.invalidateQueries({
            queryKey: ["candidates",
                vacancyId]
        }),
    });
}