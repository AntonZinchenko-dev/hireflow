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
    const stageToneClasses = [
        "from-indigo-50/80 to-indigo-100/30",
        "from-sky-50/80 to-sky-100/30",
        "from-emerald-50/80 to-emerald-100/30",
        "from-amber-50/80 to-amber-100/30",
        "from-rose-50/80 to-rose-100/30",
    ];
    const stageTone = stageToneClasses[stage.order % stageToneClasses.length];

    return (
        <div
            ref={setNodeRef}
            data-testid={`stage-column-${stage.id}`}
            className={cn(
                "relative flex w-[19.5rem] flex-shrink-0 flex-col rounded-2xl border border-slate-200/80 bg-gradient-to-b p-4 shadow-[0_12px_28px_-22px_rgba(30,41,59,0.55)]",
                stageTone,
                isOver && "z-20 outline-2 outline-indigo-400 outline outline-offset-2"
            )}
        >
            <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold uppercase tracking-wide text-slate-700">{stage.name}</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-white/90 px-2 text-xs font-semibold text-slate-600">
                    {candidates.length}
                </span>
            </div>
            <SortableContext items={candidates.map((c) => c.id)}
                strategy={verticalListSortingStrategy}>
                <div className="flex min-h-20 flex-col gap-2">
                    {candidates.length === 0 && (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-3 text-xs text-slate-500">
                            Перетащите кандидата в этот этап
                        </div>
                    )}
                    {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
                </div>
            </SortableContext>
        </div>
    );
}