import "../styles/globals.css";
import React from "react";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Aegis AI - Trust & Safety OS",
  description: "AI-powered Trust & Safety Operating System for Creators and Brands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased">
          <main className="min-h-screen bg-slate-950 text-slate-100">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
