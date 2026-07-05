// tests/unit/candidateSchema.test.ts

import { describe, it, expect } from "vitest";
import { candidateSchema } from "@/features/candidate-form/model/schema";

describe("candidateSchema", () => {
    it("требует referrerName, если source = referral", () => {
        const result = candidateSchema.safeParse({
            fullName: "Иван Иванов", source: "referral", grade: "middle",
            stageId: "stage_1", expectedSalary: 200000,
        });
        expect(result.success).toBe(false);
    });
    it("проходит валидацию при корректных данных", () => {
        const result = candidateSchema.safeParse({
            fullName: "Иван Иванов", source: "site", grade: "middle",
            stageId: "stage_1", expectedSalary: 200000,
        });
        expect(result.success).toBe(true);
    });
});
