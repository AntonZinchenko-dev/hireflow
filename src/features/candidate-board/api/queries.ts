// src/features/candidate-board/api/queries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCandidatesAction } from "./actions";

export function useCandidates(vacancyId: string, initialData?:
    Awaited<ReturnType<typeof getCandidatesAction>>) {
        
    return useQuery({
        queryKey: ["candidates", vacancyId],
        queryFn: () => getCandidatesAction(vacancyId),
        initialData,
    });
}