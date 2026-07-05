// src/features/candidate-board/ui/BoardClient.tsx
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";

type Props = {
  vacancy: Vacancy & { stages: Stage[] };
  initialCandidates: Candidate[];
};

export function BoardClient({ vacancy, initialCandidates }: Props) {
  useRealtimeSync(vacancy.id);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | Candidate["source"]>("all");
  const [gradeFilter, setGradeFilter] = useState<"all" | Candidate["grade"]>("all");
  const [showStalledOnly, setShowStalledOnly] = useState(false);

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
  const filteredCandidates = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch = !searchValue || candidate.fullName.toLowerCase().includes(searchValue);
      const matchesSource = sourceFilter === "all" || candidate.source === sourceFilter;
      const matchesGrade = gradeFilter === "all" || candidate.grade === gradeFilter;
      const daysInStage = Math.floor(
        (Date.now() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      const matchesSla = !showStalledOnly || daysInStage >= 5;

      return matchesSearch && matchesSource && matchesGrade && matchesSla;
    });
  }, [candidates, gradeFilter, search, showStalledOnly, sourceFilter]);
  const stalledCandidates = candidates.filter((candidate) => {
    const daysInStage = Math.floor(
      (Date.now() - new Date(candidate.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysInStage >= 5;
  }).length;

  useEffect(() => {
    const sourceFromUrl = searchParams.get("source");
    const gradeFromUrl = searchParams.get("grade");
    const searchFromUrl = searchParams.get("q") ?? "";
    const stalledFromUrl = searchParams.get("stalled") === "1";

    const nextSource: "all" | Candidate["source"] =
      sourceFromUrl === "site" ||
      sourceFromUrl === "referral" ||
      sourceFromUrl === "agency" ||
      sourceFromUrl === "headhunting"
        ? sourceFromUrl
        : "all";

    const nextGrade: "all" | Candidate["grade"] =
      gradeFromUrl === "junior" ||
      gradeFromUrl === "middle" ||
      gradeFromUrl === "senior" ||
      gradeFromUrl === "lead"
        ? gradeFromUrl
        : "all";

    setSearch((prev) => (prev === searchFromUrl ? prev : searchFromUrl));
    setSourceFilter((prev) => (prev === nextSource ? prev : nextSource));
    setGradeFilter((prev) => (prev === nextGrade ? prev : nextGrade));
    setShowStalledOnly((prev) => (prev === stalledFromUrl ? prev : stalledFromUrl));
  }, [searchParams]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (search.trim()) nextParams.set("q", search.trim());
    else nextParams.delete("q");

    if (sourceFilter !== "all") nextParams.set("source", sourceFilter);
    else nextParams.delete("source");

    if (gradeFilter !== "all") nextParams.set("grade", gradeFilter);
    else nextParams.delete("grade");

    if (showStalledOnly) nextParams.set("stalled", "1");
    else nextParams.delete("stalled");

    const current = searchParams.toString();
    const next = nextParams.toString();
    if (current === next) return;

    router.replace(next ? `${pathname}?${next}` : pathname);
  }, [gradeFilter, pathname, router, search, searchParams, showStalledOnly, sourceFilter]);

  function resetFilters() {
    setSearch("");
    setSourceFilter("all");
    setGradeFilter("all");
    setShowStalledOnly(false);
  }

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
              {activeCandidates} кандидатов в воронке · {stagesCount} этапов найма · SLA risk:{" "}
              {stalledCandidates}
            </p>
          </div>
        </div>
      </div>
      <div className="hf-card-tight p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по ФИО..."
            className="xl:col-span-2"
          />
          <select
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as "all" | Candidate["source"])}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <option value="all">Все источники</option>
            <option value="site">Сайт</option>
            <option value="referral">Реферал</option>
            <option value="agency">Агентство</option>
            <option value="headhunting">Хедхантинг</option>
          </select>
          <select
            value={gradeFilter}
            onChange={(event) => setGradeFilter(event.target.value as "all" | Candidate["grade"])}
            className="h-10 rounded-xl border border-input bg-white px-3 text-sm text-slate-700 outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <option value="all">Все грейды</option>
            <option value="junior">Junior</option>
            <option value="middle">Middle</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
          <button
            type="button"
            onClick={() => setShowStalledOnly((value) => !value)}
            className={buttonVariants({ variant: showStalledOnly ? "default" : "outline", size: "default" })}
          >
            Только проблемные
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Показано: {filteredCandidates.length} из {candidates.length}</p>
          <button
            type="button"
            onClick={resetFilters}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex min-h-[68vh] gap-5 overflow-x-auto overflow-y-visible px-1 py-2">
          {vacancy.stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              candidates={filteredCandidates.filter((c) => c.stageId === stage.id)}
            />
          ))}
        </div>
      </DndContext>
      <CandidateDrawer vacancyId={vacancy.id} defaultStageId={vacancy.stages[0]?.id ?? ""} />
    </section>
  );
}

