// src/entities/candidate/types.ts
export type CandidateSource = "site" | "referral" | "agency" | "headhunting";
export type CandidateGrade = "junior" | "middle" | "senior" | "lead";
export type Candidate = {
    id: string;
    vacancyId: string;
    stageId: string;
    fullName: string;
    source: CandidateSource;
    referrerName: string | null;
    grade: CandidateGrade;
    seniorityExpectations: string | null;
    expectedSalary: number;
    offerAmount: number | null;
    offerDeadline: string | null;
    resumeUrl: string | null;
    assignedRecruiterId: string;
    createdAt: string;
    updatedAt: string;
};
export type Interview = {
    id: string;
    candidateId: string;
    interviewerId: string;
    scoreTech: number;
    scoreComm: number; scoreCulture: number;
    verdict: "hire" | "no_hire" | "lean_hire" | "lean_no_hire";
    comment: string | null;
    createdAt: string;
};
export type ActivityLogEntry = {
    id: string;
    candidateId: string;
    actorId: string;
    type: "created" | "stage_moved" | "field_changed" | "comment_added" |
    "interview_added";
    payload: Record<string, unknown>;
    createdAt: string;
};