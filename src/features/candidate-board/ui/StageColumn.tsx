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
        "from-[#2b2d31] to-[#313338]",
        "from-[#2f3136] to-[#353941]",
        "from-[#30333a] to-[#373c46]",
        "from-[#32343b] to-[#3a3d45]",
        "from-[#2d3036] to-[#363941]",
    ];
    const stageTone = stageToneClasses[stage.order % stageToneClasses.length];

    return (
        <div
            ref={setNodeRef}
            data-testid={`stage-column-${stage.id}`}
            className={cn(
                "relative flex w-[19.5rem] flex-shrink-0 flex-col rounded-2xl border border-[#3a3d44] bg-gradient-to-b p-4 shadow-[0_16px_35px_-24px_rgba(0,0,0,0.75)]",
                stageTone,
                isOver && "z-20 outline-2 outline-[#5865f2] outline outline-offset-2"
            )}
        >
            <div className="mb-4 flex items-center justify-between px-1">
                <span className="text-sm font-semibold uppercase tracking-wide text-[#f2f3f5]">{stage.name}</span>
                <span className="inline-flex min-w-6 items-center justify-center rounded-full border border-[#454a53] bg-[#1f2125] px-2 text-xs font-semibold text-[#dbdee1]">
                    {candidates.length}
                </span>
            </div>
            <SortableContext items={candidates.map((c) => c.id)}
                strategy={verticalListSortingStrategy}>
                <div className="flex min-h-20 flex-col gap-2">
                    {candidates.length === 0 && (
                        <div className="rounded-xl border border-dashed border-[#4b5058] bg-[#1f2125]/80 p-3 text-xs text-[#b5bac1]">
                            Перетащите кандидата в этот этап
                        </div>
                    )}
                    {candidates.map((c) => <CandidateCard key={c.id} candidate={c} />)}
                </div>
            </SortableContext>
        </div>
    );
}