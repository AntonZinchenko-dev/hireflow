// src/features/candidate-board/ui/CandidateCard.tsx
"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoardStore } from "../model/useBoardStore";
import type { Candidate } from "@/entities/candidate/types";

export function CandidateCard({ candidate }: { candidate: Candidate }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging
    } = useSortable({ id: candidate.id });
    const openDrawer = useBoardStore((s) => s.openDrawer);
    const style = {
        transform: CSS.Transform.toString(transform), transition,
        opacity: isDragging ? 0.5 : 1
    };
    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={() => openDrawer(candidate.id)}
            className="cursor-grab rounded-md border bg-white p-3 shadow-sm
hover:border-blue-300 active:cursor-grabbing"
        >
            <div className="font-medium text-slate-800">{candidate.fullName}</div>
            <div className="text-xs text-slate-400">{candidate.grade} ·
                {candidate.source}</div>
        </div>
    );
}
