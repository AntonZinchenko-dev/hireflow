// src/shared/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
   }
   export function formatMoney(amount: number, currency = "RUB") {
    return new Intl.NumberFormat("ru-RU", { style: "currency", currency,
   maximumFractionDigits: 0 }).format(amount);
   }
   export function formatRelativeDate(iso: string) {
    const diffMs = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (days === 0) return "сегодня";
    if (days === 1) return "вчера";
    return `${days} дн. назад.`;
   }
   