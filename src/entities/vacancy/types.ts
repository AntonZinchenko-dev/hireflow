// src/entities/vacancy/types.ts
export type Vacancy = {
    id: string;
    title: string;
    grade: string;
    department: string;
    status: "open" | "closed";
    createdAt: string;
   };
   export type Stage = {
    id: string;
    vacancyId: string;
    name: string;
    order: number;
   };
   