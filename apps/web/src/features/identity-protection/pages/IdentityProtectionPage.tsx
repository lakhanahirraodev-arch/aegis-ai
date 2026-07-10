"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockBarChart } from "@/shared/components/Widgets";

export default function IdentityProtectionPage() {
  return (
    <DashboardPageWrapper
      title="Identity Safeguards"
      description="Biometric regulations compliance, verified profile credentials, and biometric checks."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Protected Key Identities"
            value="3"
            trend="Stable"
            trendDirection="neutral"
            description="Registered biometric profiles"
          />
          <StatCard
            title="Validation Attempts"
            value="482"
            trend="+120%"
            trendDirection="up"
            description="Workspace access token challenges"
          />
          <StatCard
            title="Compliance Health"
            value="100%"
            trend="Optimal"
            trendDirection="up"
            description="BIPA and COPPA safeguards status"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Identity Token Handshakes per Hour</h3>
          <MockBarChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
