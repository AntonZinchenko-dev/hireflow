// src/features/candidate-board/ui/CandidateCard.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "../model/useBoardStore";
import type { Candidate } from "@/entities/candidate/types";
import { formatMoney } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";

const sourceLabels = {
    site: "Сайт",
    referral: "Реферал",
    agency: "Агентство",
    headhunting: "Хедхантинг",
} as const;

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export function CandidateCard({ candidate, nowMs }: { candidate: Candidate; nowMs: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging
    } = useSortable({ id: candidate.id });
    const openDrawer = useBoardStore((s) => s.openDrawer);
    const style = {
        transform: CSS.Transform.toString(transform), transition,
        opacity: isDragging ? 0.5 : 1
    };
    const daysInStage = Math.floor(
        (nowMs - new Date(candidate.updatedAt).getTime()) / DAY_IN_MS
    );
    const slaLevel = daysInStage >= 5 ? "danger" : daysInStage >= 3 ? "warning" : "ok";

    return (
        <div
            ref={setNodeRef}
            data-testid={`candidate-card-${candidate.id}`}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => openDrawer(candidate.id)}
            className="cursor-grab rounded-xl border border-border bg-card p-3.5 shadow-[0_8px_20px_-14px_rgba(0,0,0,0.3)] transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_12px_28px_-18px_rgba(204,34,41,0.45)] active:cursor-grabbing"
        >
            <div className="font-medium text-foreground">{candidate.fullName}</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{candidate.grade}</Badge>
                <Badge variant="secondary">{sourceLabels[candidate.source]}</Badge>
                <Badge
                    variant={slaLevel === "danger" ? "destructive" : "outline"}
                    className={slaLevel === "warning" ? "border-amber-500/40 bg-amber-500/15 text-amber-700" : ""}
                >
                    {daysInStage}д в этапе
                </Badge>
            </div>
            <p className="mt-2 text-xs font-medium text-muted-foreground">
                Ожидание: {formatMoney(candidate.expectedSalary)}
            </p>
        </div>
    );
}
