// src/features/analytics-dashboard/ui/FunnelChart.tsx
"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from
    "recharts";

type FunnelPoint = {
    stageName: string; count: number; conversionRate:
        number
};
export function FunnelChart({ data }: { data: FunnelPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data}>
                <XAxis dataKey="stageName" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value) => `${value ?? 0} кандидатов`} />
                <Bar dataKey="count" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}