import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { BoardClient } from "@/features/candidate-board/ui/BoardClient";
import type { Candidate } from "@/entities/candidate/types";
import type { Stage, Vacancy } from "@/entities/vacancy/types";

let mockCandidates: Candidate[] = [];
const { replaceMock, stableSearchParams } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  stableSearchParams: new URLSearchParams(""),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/board/vac_1",
  useRouter: () => ({ replace: replaceMock }),
  useSearchParams: () => stableSearchParams,
}));

vi.mock("@/features/candidate-board/api/queries", () => ({
  useCandidates: () => ({ data: mockCandidates }),
}));

vi.mock("@/features/candidate-board/api/mutations", () => ({
  useMoveCandidate: () => ({ mutate: vi.fn() }),
}));

vi.mock("@/features/candidate-board/api/useRealtimeSync", () => ({
  useRealtimeSync: vi.fn(),
}));

vi.mock("@/features/candidate-form/ui/CandidateDrawer", () => ({
  CandidateDrawer: () => null,
}));

vi.mock("@/features/candidate-board/ui/StageColumn", () => ({
  StageColumn: ({
    stage,
    candidates,
  }: {
    stage: Stage;
    candidates: Candidate[];
  }) => (
    <div data-testid={`stage-${stage.id}`}>
      <span>{stage.name}</span>
      <span data-testid={`count-${stage.id}`}>{candidates.length}</span>
    </div>
  ),
}));

const vacancy: Vacancy & { stages: Stage[] } = {
  id: "vac_1",
  title: "Frontend Developer",
  grade: "middle",
  department: "Engineering",
  status: "open",
  createdAt: new Date().toISOString(),
  stages: [
    { id: "stage_1", vacancyId: "vac_1", name: "Отклик", order: 0 },
    { id: "stage_2", vacancyId: "vac_1", name: "Скрининг", order: 1 },
  ],
};

function candidateFactory(partial: Partial<Candidate>): Candidate {
  return {
    id: partial.id ?? "cand_1",
    vacancyId: "vac_1",
    stageId: partial.stageId ?? "stage_1",
    fullName: partial.fullName ?? "Иван Иванов",
    source: partial.source ?? "site",
    referrerName: null,
    grade: partial.grade ?? "middle",
    seniorityExpectations: null,
    expectedSalary: 200000,
    offerAmount: null,
    offerDeadline: null,
    resumeUrl: null,
    assignedRecruiterId: "rec_1",
    createdAt: new Date().toISOString(),
    updatedAt: partial.updatedAt ?? new Date().toISOString(),
  };
}

function renderBoard() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <BoardClient vacancy={vacancy} initialCandidates={mockCandidates} />
    </QueryClientProvider>
  );
}

describe("BoardClient filters", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    stableSearchParams.forEach((_, key) => stableSearchParams.delete(key));
    mockCandidates = [
      candidateFactory({
        id: "cand_site",
        fullName: "Иван Иванов",
        source: "site",
        grade: "middle",
      }),
      candidateFactory({
        id: "cand_ref",
        fullName: "Петр Петров",
        source: "referral",
        grade: "senior",
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      }),
      candidateFactory({
        id: "cand_agency",
        fullName: "Мария Сидорова",
        source: "agency",
        grade: "junior",
        stageId: "stage_2",
      }),
    ];
  });

  it("filters candidates by search text", async () => {
    renderBoard();
    const input = screen.getByPlaceholderText("Поиск по ФИО...");
    await userEvent.type(input, "Мария");
    expect(screen.getByText(/Показано:\s*1 из 3/)).toBeInTheDocument();
  });

  it("filters candidates by source and grade", async () => {
    renderBoard();
    const selects = screen.getAllByRole("combobox");
    const sourceSelect = selects[0]!;
    await userEvent.selectOptions(sourceSelect, "referral");
    expect(screen.getByText(/Показано:\s*1 из 3/)).toBeInTheDocument();

    await userEvent.selectOptions(selects[1]!, "senior");
    expect(screen.getByText(/Показано:\s*1 из 3/)).toBeInTheDocument();
  });

  it("shows only stalled candidates when toggle enabled", async () => {
    renderBoard();
    await userEvent.click(screen.getByRole("button", { name: "Только проблемные" }));
    expect(screen.getByText(/Показано:\s*1 из 3/)).toBeInTheDocument();
  });
});
