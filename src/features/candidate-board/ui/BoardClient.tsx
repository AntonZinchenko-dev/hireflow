// src/features/candidate-board/ui/BoardClient.tsx
"use client";
import {
    DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors,
    type DragEndEvent
} from "@dnd-kit/core";
import { useCandidates } from "../api/queries";
import { useMoveCandidate } from "../api/mutations";
import { StageColumn } from "./StageColumn";
import type { Vacancy, Stage } from "@/entities/vacancy/types";
import type { Candidate } from "@/entities/candidate/types";
import { CandidateDrawer } from "@/features/candidate-form/ui/CandidateDrawer";

type Props = {
    vacancy: Vacancy & { stages: Stage[] };
    initialCandidates: Candidate[];
};

export function BoardClient({ vacancy, initialCandidates }: Props) {
    const { data: candidates = [] } = useCandidates(vacancy.id,
        initialCandidates);
    const { mutate: moveCandidate } = useMoveCandidate(vacancy.id);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    );
    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over) return;
        const candidateId = String(active.id);
        const overId = String(over.id);
        const current = candidates.find((c) => c.id === candidateId);
        if (!current) return;

        const targetStageId = vacancy.stages.some((stage) => stage.id === overId)
            ? overId
            : candidates.find((c) => c.id === overId)?.stageId;

        if (targetStageId && current.stageId !== targetStageId) {
            moveCandidate({ candidateId, stageId: targetStageId });
        }
    }
    return (
        <div className="flex h-screen flex-col bg-slate-50">
            <header className="border-b bg-white px-6 py-3">
                <h1 className="text-lg font-bold text-slate-800">{vacancy.title}</h1>
            </header>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 gap-4 overflow-x-auto p-6">
                    {vacancy.stages.map((stage) => (<StageColumn
                        key={stage.id}
                        stage={stage}
                        candidates={candidates.filter((c) => c.stageId === stage.id)}
                    />
                    ))}
                </div>
            </DndContext>
            <CandidateDrawer vacancyId={vacancy.id} />
        </div>
    );
}

