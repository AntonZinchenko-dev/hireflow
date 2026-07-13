import type { Metadata } from "next";
import { Providers } from "./providers";
import { AppChrome } from "@/components/layout/app-chrome";
import { DevServiceWorkerCleanup } from "@/components/dev/dev-sw-cleanup";

import "./globals.css";

export const metadata: Metadata = {
  title: "HireFlow",
  description: "CRM для рекрутинга и найма",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers>
          <DevServiceWorkerCleanup />
          <AppChrome>{children}</AppChrome>
        </Providers>
      </body>
    </html>
  );
}
