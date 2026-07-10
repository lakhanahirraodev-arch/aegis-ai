"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockBarChart } from "@/shared/components/Widgets";

export default function ReputationPage() {
  return (
    <DashboardPageWrapper
      title="Reputation Intelligence"
      description="Track handles, check deepfake audio clips, and monitor brand impersonations."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Tracked Brand Assets"
            value="12"
            trend="+2"
            trendDirection="up"
            description="Social accounts and domains"
          />
          <StatCard
            title="Impersonation Incidents"
            value="4"
            trend="Zero Change"
            trendDirection="neutral"
            description="Active phishing profile alerts"
          />
          <StatCard
            title="Average Domain Risk"
            value="Low"
            trend="-15%"
            trendDirection="down"
            description="Likeness search metrics"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Profile Search Verification History</h3>
          <MockBarChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
