// src/features/candidate-form/ui/CandidateDrawer.tsx
"use client";

import { useBoardStore } from
    "@/features/candidate-board/model/useBoardStore";
import { useQueryClient } from "@tanstack/react-query";
import { CandidateForm } from "./CandidateForm";
import type { Candidate } from "@/entities/candidate/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CandidateDrawer({
    vacancyId,
    defaultStageId,
}: {
    vacancyId: string;
    defaultStageId: string;
}) {
    const openId = useBoardStore((s) => s.openDrawerCandidateId);
    const closeDrawer = useBoardStore((s) => s.openDrawer);
    const qc = useQueryClient();
    const candidates = (qc.getQueryData(["candidates", vacancyId]) as Candidate[] | undefined) ?? [];
    const selectedCandidate = candidates.find((candidate) => candidate.id === openId);

    return (
        <Sheet open={!!openId} onOpenChange={(open) => !open &&
            closeDrawer(null)}>
            <SheetContent side="right" className="w-[460px] overflow-y-auto border-l border-border bg-card">
                <SheetHeader className="border-b border-border pb-5">
                    <SheetTitle className="text-left text-lg font-semibold text-foreground">
                        {selectedCandidate ? selectedCandidate.fullName : "Карточка кандидата"}
                    </SheetTitle>
                    <p className="text-left text-sm text-muted-foreground">
                        Обновите данные и сохраните изменения в профиле.
                    </p>
                </SheetHeader>
                <CandidateForm
                    vacancyId={vacancyId}
                    defaultStageId={defaultStageId}
                    {...(selectedCandidate ? { candidate: selectedCandidate } : {})}
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ["candidates", vacancyId] });
                        closeDrawer(null);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}
