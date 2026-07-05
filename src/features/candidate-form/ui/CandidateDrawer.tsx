// src/features/candidate-form/ui/CandidateDrawer.tsx
"use client";

import { useBoardStore } from
    "@/features/candidate-board/model/useBoardStore";
import { useQueryClient } from "@tanstack/react-query";
import { CandidateForm } from "./CandidateForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function CandidateDrawer({ vacancyId }: { vacancyId: string }) {
    const openId = useBoardStore((s) => s.openDrawerCandidateId);
    const closeDrawer = useBoardStore((s) => s.openDrawer);
    const qc = useQueryClient();
    return (
        <Sheet open={!!openId} onOpenChange={(open) => !open &&
            closeDrawer(null)}>
            <SheetContent side="right" className="w-[420px]">
                <SheetHeader><SheetTitle>Карточка кандидата</SheetTitle></SheetHeader>
                <CandidateForm
                    onSaved={() => {
                        qc.invalidateQueries({ queryKey: ["candidates", vacancyId] });
                        closeDrawer(null);
                    }}
                />
            </SheetContent>
        </Sheet>
    );
}
