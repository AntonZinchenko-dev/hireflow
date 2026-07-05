// src/features/candidate-board/model/useBoardStore.ts
import { create } from "zustand";

type Filters = { recruiterId?: string; grade?: string };

type BoardState = {
    draggingId: string | null;
    openDrawerCandidateId: string | null;
    filters: Filters;
    setDragging: (id: string | null) => void;
    openDrawer: (candidateId: string | null) => void;
    setFilters: (patch: Partial<Filters>) => void;
};
export const useBoardStore = create<BoardState>((set) => ({
    draggingId: null,
    openDrawerCandidateId: null,
    filters: {},
    setDragging: (id) => set({ draggingId: id }),
    openDrawer: (candidateId) => set({ openDrawerCandidateId: candidateId }),
    setFilters: (patch) => set((s) => ({
        filters:
            { ...s.filters, ...patch }
    })),
}));
