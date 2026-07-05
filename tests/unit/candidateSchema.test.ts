// tests/unit/candidateSchema.test.ts

import { describe, it, expect } from "vitest";
import { candidateSchema } from "@/features/candidate-form/model/schema";

describe("candidateSchema", () => {
  it("требует referrerName, если source = referral", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "referral",
      grade: "middle",
      stageId: "stage_1",
      expectedSalary: 200000,
    });
    expect(result.success).toBe(false);
  });

  it("требует seniorityExpectations для senior", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "site",
      grade: "senior",
      stageId: "stage_1",
      expectedSalary: 250000,
    });
    expect(result.success).toBe(false);
  });

  it("требует seniorityExpectations для lead", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "site",
      grade: "lead",
      stageId: "stage_1",
      expectedSalary: 300000,
    });
    expect(result.success).toBe(false);
  });

  it("не принимает expectedSalary <= 0", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "site",
      grade: "middle",
      stageId: "stage_1",
      expectedSalary: 0,
    });
    expect(result.success).toBe(false);
  });

  it("проходит валидацию при корректных данных для referral", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "referral",
      referrerName: "Мария",
      grade: "middle",
      stageId: "stage_1",
      expectedSalary: 200000,
    });
    expect(result.success).toBe(true);
  });

  it("проходит валидацию при корректных данных для senior", () => {
    const result = candidateSchema.safeParse({
      fullName: "Иван Иванов",
      source: "site",
      grade: "senior",
      seniorityExpectations: "Хочу влиять на архитектуру",
      stageId: "stage_1",
      expectedSalary: 350000,
    });
    expect(result.success).toBe(true);
  });
});
