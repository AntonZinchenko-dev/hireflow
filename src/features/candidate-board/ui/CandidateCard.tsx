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

export function CandidateCard({ candidate }: { candidate: Candidate }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging
    } = useSortable({ id: candidate.id });
    const openDrawer = useBoardStore((s) => s.openDrawer);
    const style = {
        transform: CSS.Transform.toString(transform), transition,
        opacity: isDragging ? 0.5 : 1
    };
    const daysInStage = Math.floor(
        (Date.now() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
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
            className="cursor-grab rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md active:cursor-grabbing"
        >
            <div className="font-medium text-slate-900">{candidate.fullName}</div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{candidate.grade}</Badge>
                <Badge variant="secondary">{sourceLabels[candidate.source]}</Badge>
                <Badge
                    variant={slaLevel === "danger" ? "destructive" : "outline"}
                    className={slaLevel === "warning" ? "border-amber-300 bg-amber-50 text-amber-700" : ""}
                >
                    {daysInStage}д в этапе
                </Badge>
            </div>
            <p className="mt-2 text-xs font-medium text-slate-500">
                Ожидание: {formatMoney(candidate.expectedSalary)}
            </p>
        </div>
    );
}
