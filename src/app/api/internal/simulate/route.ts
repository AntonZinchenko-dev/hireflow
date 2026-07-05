// src/app/api/internal/simulate/route.ts
import { moveRandomCandidate, createRandomCandidate, addRandomComment } from
    "@/shared/lib/simulation-actions";
import { resetPrismaClient } from "@/shared/lib/prisma-client";

const WEIGHTED_ACTIONS = [
    { action: moveRandomCandidate, weight: 45 },
    { action: createRandomCandidate, weight: 30 },
    { action: addRandomComment, weight: 25 },
];
function pickAction() {
    const fallbackAction = WEIGHTED_ACTIONS[0]?.action;
    if (!fallbackAction) {
        throw new Error("No simulation actions configured");
    }
    const total = WEIGHTED_ACTIONS.reduce((s, a) => s + a.weight, 0);
    let r = Math.random() * total;
    for (const item of WEIGHTED_ACTIONS) {
        if (r < item.weight) return item.action;
        r -= item.weight;
    }
    return fallbackAction;
}

function isRecoverablePrismaError(error: unknown) {
    if (!(error instanceof Error)) return false;
    const message = error.message.toLowerCase();
    return message.includes("not queryable")
        || message.includes("connection terminated unexpectedly")
        || message.includes("emaxconnsession")
        || message.includes("can't reach database server");
}

export async function POST(req: Request) {
    const secret = req.headers.get("x-simulation-secret");
    if (secret !== process.env.SIMULATION_SECRET) {
        return new Response("Forbidden", { status: 403 });
    }
    const action = pickAction();
    try {
        const result = await action();
        return Response.json({ ok: true, result });
    } catch (error) {
        if (!isRecoverablePrismaError(error)) throw error;
        await resetPrismaClient();
        const result = await action();
        return Response.json({ ok: true, result, recovered: true });
    }
}