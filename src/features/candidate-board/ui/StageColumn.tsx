// src/features/candidate-board/ui/StageColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from
    "@dnd-kit/sortable";
import { CandidateCard } from "./CandidateCard";
import type { Stage } from "@/entities/vacancy/types";
import type { Candidate } from "@/entities/candidate/types";
import { cn } from "@/shared/lib/utils";

export function StageColumn({ stage, candidates }: {
    stage: Stage; candidates:
        Candidate[]
}) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.id });
    return (
        <div
            ref={setNodeRef}
            data-testid={`stage-column-${stage.id}`}
            className={cn(
                "flex w-72 flex-shrink-0 flex-col rounded-lg border bg-white p-3",
                isOver && "ring-2 ring-blue-400"
            )}
        >
            <div className="mb-2 flex items-center justify-between px-1">
                <span className="font-semibold text-slate-700">{stage.name}</span>
                <span className="text-xs text-slate-400">{candidates.length}</span>
            </div>
            <SortableContext items={candidates.map((c) => c.id)}
                strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-2">{candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
                </div>
            </SortableContext>
        </div>
    );
}