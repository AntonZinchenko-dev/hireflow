// src/features/analytics-dashboard/ui/FunnelChart.tsx
"use client";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from
    "recharts";

type FunnelPoint = {
    stageName: string; count: number; conversionRate:
        number
};
export function FunnelChart({ data }: { data: FunnelPoint[] }) {
    return (
        <ResponsiveContainer width="100%" height={360}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dfddd7" vertical={false} />
                <XAxis dataKey="stageName" tick={{ fontSize: 12, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#6b6b6b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        borderRadius: 12,
                        border: "1px solid rgba(0, 0, 0, 0.09)",
                        backgroundColor: "#ffffff",
                        color: "#1a1a1a",
                        boxShadow: "0 14px 30px -20px rgba(0, 0, 0, 0.25)",
                    }}
                    formatter={(value, _, item) => {
                        const conversionRate = item?.payload?.conversionRate ?? 0;
                        return [`${value ?? 0} кандидатов · ${conversionRate}%`, "Этап"];
                    }}
                />
                <Bar dataKey="count" fill="#cc2229" radius={[10, 10, 4, 4]} />
            </BarChart>
        </ResponsiveContainer>
    );
}