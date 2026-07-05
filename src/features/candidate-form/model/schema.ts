// src/features/candidate-form/model/schema.ts
import { z } from "zod";

export const candidateSchema = z
    .object({
        id: z.string().optional(),
        fullName: z.string().min(2, "Минимум 2 символа"),
        source: z.enum(["site", "referral", "agency", "headhunting"]),
        referrerName: z.string().optional(),
        grade: z.enum(["junior", "middle", "senior", "lead"]),
        seniorityExpectations: z.string().optional(),
        stageId: z.string(),
        expectedSalary: z.coerce.number().positive("Укажите ожидаемую зарплату"),
        offerAmount: z.coerce.number().positive().optional(),
        offerDeadline: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.source === "referral" && !data.referrerName) {
            ctx.addIssue({
                path: ["referrerName"], code: "custom", message:
                    "Укажите, кто порекомендовал кандидата"
            });
        }
        if (["senior", "lead"].includes(data.grade) && !
            data.seniorityExpectations) {
            ctx.addIssue({
                path: ["seniorityExpectations"], code: "custom", message:
                    "Обязательное поле для этого грейда"
            });
        }
    });
export type CandidateFormInput = z.input<typeof candidateSchema>;
export type CandidateInput = z.output<typeof candidateSchema>;
