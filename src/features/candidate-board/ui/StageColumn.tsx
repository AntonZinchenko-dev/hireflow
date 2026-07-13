// src/features/candidate-board/ui/StageColumn.tsx
"use client";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from
    "@dnd-kit/sortable";
import { CandidateCard } from "./CandidateCard";
import type { Stage } from "@/entities/vacancy/types";
import type { Candidate } from "@/entities/candidate/types";
import { cn } from "@/shared/lib/utils";

export function StageColumn({ stage, candidates, nowMs }: {
    stage: Stage; candidates:
        Candidate[];
    nowMs: number;
}) {
    const { setNodeRef, isOver } = useDroppable({ id: stage.id });
    const stageToneClasses = [
        "from-[#ffffff] to-[#f7f6f3]",
        "from-[#ffffff] to-[#f3f1ec]",
        "from-[#fffdf9] to-[#f2efea]",
        "from-[#ffffff] to-[#f0ece5]",
        "from-[#fffdfa] to-[#f4f1eb]",
    ];
    const stageTone = stageToneClasses[stage.order % stageToneClasses.length];

    return (
        <div
            ref={setNodeRef}
            data-testid={`stage-column-${stage.id}`}
            className={cn(
                "relative flex w-[19.5rem] flex-shrink-0 flex-col rounded-2xl border border-border bg-gradient-to-b p-4 shadow-[0_16px_35px_-24px_rgba(0,0,0,0.25)]",
                stageTone,
                isOver && "z-20 outline-2 outline-primary outline outline-offset-2"
            )}
        >
            <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold uppercase tracking-wide text-foreground">{stage.name}</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-border bg-secondary px-2 text-xs font-semibold text-foreground">
                    {candidates.length}
                </span>
            </div>
            <SortableContext items={candidates.map((c) => c.id)}
                strategy={verticalListSortingStrategy}>
                <div className="flex min-h-20 flex-col gap-2">
                    {candidates.length === 0 && (
                        <div className="rounded-xl border border-dashed border-border bg-secondary/70 p-3 text-xs text-muted-foreground">
                            Перетащите кандидата в этот этап
                        </div>
                    )}
                    {candidates.map((c) => <CandidateCard key={c.id} candidate={c} nowMs={nowMs} />)}
                </div>
            </SortableContext>
        </div>
    );
}