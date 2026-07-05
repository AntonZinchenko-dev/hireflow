// src/features/candidate-board/ui/BoardClient.tsx
"use client";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useCandidates } from "../api/queries";
import { useMoveCandidate } from "../api/mutations";
import { StageColumn } from "./StageColumn";
import type { Vacancy, Stage } from "@/entities/vacancy/types";
import type { Candidate } from "@/entities/candidate/types";
import { CandidateDrawer } from "@/features/candidate-form/ui/CandidateDrawer";
import { useRealtimeSync } from "../api/useRealtimeSync";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  vacancy: Vacancy & { stages: Stage[] };
  initialCandidates: Candidate[];
};

export function BoardClient({ vacancy, initialCandidates }: Props) {
  useRealtimeSync(vacancy.id);

  const { data: candidates = [] } = useCandidates(vacancy.id, initialCandidates);
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

  const activeCandidates = candidates.length;
  const stagesCount = vacancy.stages.length;

  return (
    <section className="hf-page">
      <div className="hf-card p-6 backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{vacancy.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{vacancy.department}</Badge>
              <Badge variant="outline">{vacancy.grade}</Badge>
              <Badge variant={vacancy.status === "open" ? "default" : "secondary"}>
                {vacancy.status === "open" ? "Открыта" : "Закрыта"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {activeCandidates} кандидатов в воронке · {stagesCount} этапов найма
            </p>
          </div>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex min-h-[68vh] gap-5 overflow-x-auto overflow-y-visible px-1 py-2">
          {vacancy.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              candidates={candidates.filter((c) => c.stageId === stage.id)}
            />
          ))}
        </div>
      </DndContext>
      <CandidateDrawer vacancyId={vacancy.id} defaultStageId={vacancy.stages[0]?.id ?? ""} />
    </section>
  );
}

