"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/shared/lib/supabase-client";
import type { Candidate } from "@/entities/candidate/types";

export function useRealtimeSync(vacancyId: string) {
    const qc = useQueryClient();
    useEffect(() => {
        try {
            const supabase = createClient();
            const channel = supabase
                .channel(`vacancy-${vacancyId}`)
                .on(
                    "postgres_changes",
                    {
                        event: "*", schema: "public", table: "Candidate", filter:
                            `vacancyId=eq.${vacancyId}`
                    },
                    (payload) => {
                        qc.setQueryData<Candidate[]>(["candidates", vacancyId], (old = []) => {
                            if (payload.eventType === "INSERT") return [...old, payload.new as
                                Candidate];
                            if (payload.eventType === "UPDATE")
                                return old.map((c) => (c.id === (payload.new as Candidate).id ?
                                    { ...c, ...(payload.new as Candidate) } : c));
                            if (payload.eventType === "DELETE")
                                return old.filter((c) => c.id !== (payload.old as
                                    Candidate).id);
                            return old;
                        });
                    }
                )
                .subscribe((status) => {
                    if (status === "SUBSCRIBED") {
                        // If an update happened before subscription was ready,
                        // synchronize once from source of truth.
                        qc.invalidateQueries({ queryKey: ["candidates", vacancyId] });
                    }
                });
            return () => { supabase.removeChannel(channel); };
        } catch {
            // Fallback for local/e2e environments without Supabase realtime.
            const intervalId = window.setInterval(() => {
                qc.invalidateQueries({ queryKey: ["candidates", vacancyId] });
            }, 1000);
            return () => window.clearInterval(intervalId);
        }
    }, [vacancyId, qc]);
}
