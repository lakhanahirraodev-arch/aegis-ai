import "../styles/globals.css";
import React from "react";

export const metadata = {
  title: "Aegis AI - Trust & Safety OS",
  description: "AI-powered Trust & Safety Operating System for Creators and Brands",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-background text-foreground">{children}</main>
      </body>
    </html>
  );
}
