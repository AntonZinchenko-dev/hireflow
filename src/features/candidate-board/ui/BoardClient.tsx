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

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{vacancy.title}</h1>
            <p className="text-sm text-slate-500">
              {vacancy.department} · {candidates.length} кандидатов в работе
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/vacancies" className={buttonVariants({ variant: "outline", size: "sm" })}>
              К списку вакансий
            </Link>
            <Link
              href="/analytics"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Смотреть аналитику
            </Link>
          </div>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex min-h-[65vh] gap-4 overflow-x-auto pb-2">
          {vacancy.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              candidates={candidates.filter((c) => c.stageId === stage.id)}
            />
          ))}
        </div>
      </DndContext>
      <CandidateDrawer vacancyId={vacancy.id} />
    </section>
  );
}

