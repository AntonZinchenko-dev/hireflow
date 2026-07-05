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
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5058" vertical={false} />
                <XAxis dataKey="stageName" tick={{ fontSize: 12, fill: "#b5bac1" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#8f95a0" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #3a3d44",
                        backgroundColor: "#1f2125",
                        color: "#f2f3f5",
                        boxShadow: "0 14px 30px -20px rgba(0, 0, 0, 0.75)",
                    }}
                    formatter={(value, _, item) => {
                        const conversionRate = item?.payload?.conversionRate ?? 0;
                        return [`${value ?? 0} кандидатов · ${conversionRate}%`, "Этап"];
                    }}
                />
                <Bar dataKey="count" fill="#5865f2" radius={[10, 10, 4, 4]} />
            </BarChart>
        </ResponsiveContainer>
    );
}