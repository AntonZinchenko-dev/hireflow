// src/app/api/internal/simulate/route.ts
import { moveRandomCandidate, createRandomCandidate, addRandomComment } from
    "@/shared/lib/simulation-actions";

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
export async function POST(req: Request) {
    const secret = req.headers.get("x-simulation-secret");
    if (secret !== process.env.SIMULATION_SECRET) {
        return new Response("Forbidden", { status: 403 });
    }
    const action = pickAction();
    const result = await action();
    return Response.json({ ok: true, result });
}