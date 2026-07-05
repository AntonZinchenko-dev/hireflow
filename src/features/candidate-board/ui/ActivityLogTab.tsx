// src/features/candidate-form/ui/ActivityLogTab.tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import { getActivityLog } from "../api/getActivityLog";
import { formatRelativeDate } from "@/shared/lib/utils";

const LABELS: Record<string, string> = {
    created: "Кандидат создан",
    stage_moved: "Перемещён на стадию",
    field_changed: "Изменены данные",
    comment_added: "Добавлен комментарий",
    interview_added: "Добавлена оценка интервью",
};

export function ActivityLogTab({ candidateId }: { candidateId: string }) {
    const { data: entries = [] } = useQuery({
        queryKey: ["activity", candidateId],
        queryFn: () => getActivityLog(candidateId),
    });
    return (
        <ul className="space-y-3">
            {entries.map((entry) => (
                <li key={entry.id} className="border-l-2 border-slate-200 pl-3 textsm">
                    <div className="font-medium text-slate-700">
                        {LABELS[entry.type] ?? entry.type}
                        {entry.actor.isBot && <span className="ml-1 text-xs text-slate400">(бот)</span>}
                    </div>
                    <div className="text-xs text-slate-400">{entry.actor.name} ·
                        {formatRelativeDate(entry.createdAt.toString())}</div>
                </li>
            ))}
        </ul>
    );
}