// tests/integration/CandidateForm.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CandidateForm } from "@/features/candidate-form/ui/CandidateForm";
import { expect, it } from "vitest";

function renderWithProviders(ui: React.ReactElement) {
    const qc = new QueryClient();
    return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const baseCandidate = {
    id: "cand_1",
    vacancyId: "vac_1",
    stageId: "stage_1",
    fullName: "Иван Иванов",
    source: "site" as const,
    referrerName: null,
    grade: "middle" as const,
    seniorityExpectations: null,
    expectedSalary: 200000,
    offerAmount: null,
    offerDeadline: null,
    resumeUrl: null,
    assignedRecruiterId: "rec_1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

it("показывает ошибку, если source=referral без referrerName", async () => {
    renderWithProviders(<CandidateForm candidate={baseCandidate}
        vacancyId="vac_1"
        defaultStageId="stage_1"
        onSaved={() => { }} />);
    const sourceSelect = screen.getAllByRole("combobox")[0]!;
    await userEvent.selectOptions(sourceSelect, "referral");
    await userEvent.click(screen.getByRole("button", { name: "Сохранить" }));
    expect(await screen.findByText(/укажите, кто порекомендовал/i)).toBeInTheDocument();
});