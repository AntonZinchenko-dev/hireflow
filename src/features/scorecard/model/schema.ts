import { z } from "zod";

export const scorecardSchema = z.object({
    candidateId: z.string(),
    scoreTech: z.coerce.number().min(1).max(5),
    scoreComm: z.coerce.number().min(1).max(5),
    scoreCulture: z.coerce.number().min(1).max(5),
    verdict: z.enum(["hire", "no_hire", "lean_hire", "lean_no_hire"]),
    comment: z.string().optional(),
    criteria: z.array(z.object({
        name: z.string().min(1), score:
            z.coerce.number().min(1).max(5)
    })).default([]),
});
export type ScorecardFormInput = z.input<typeof scorecardSchema>;
export type ScorecardInput = z.output<typeof scorecardSchema>;
