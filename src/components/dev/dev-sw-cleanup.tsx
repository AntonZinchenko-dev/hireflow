"use client";

import { useEffect } from "react";

export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.hostname !== "localhost") return;

    void navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        void registration.unregister();
      });
    });
  }, []);

  return null;
}
