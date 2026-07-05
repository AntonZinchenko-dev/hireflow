// src/features/candidate-board/api/queries.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getCandidatesAction } from "./actions";
import type { Candidate } from "@/entities/candidate/types";

export function useCandidates(vacancyId: string, initialData?:
    Awaited<ReturnType<typeof getCandidatesAction>>) {
    return useQuery<Candidate[]>({
        queryKey: ["candidates", vacancyId],
        queryFn: () => getCandidatesAction(vacancyId),
        ...(initialData !== undefined ? { initialData } : {}),
    });
}