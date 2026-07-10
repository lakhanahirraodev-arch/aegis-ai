"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { OrganizationProfile } from "@clerk/nextjs";

export default function OrganizationSettingsPage() {
  return (
    <DashboardPageWrapper
      title="Organization Settings"
      description="Manage workspace profiles, Clerk credentials, and membership configurations."
      category="Configuration"
    >
      <div className="flex justify-center bg-slate-900 border border-slate-800 rounded-xl p-6 w-full">
        <OrganizationProfile
          routing="hash"
          appearance={{
            elements: {
              cardBox: "bg-slate-900 shadow-none border-none text-slate-100 w-full max-w-4xl",
              navbar: "bg-slate-950/20 border-r border-slate-800/50",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
            },
          }}
        />
      </div>
    </DashboardPageWrapper>
  );
}
