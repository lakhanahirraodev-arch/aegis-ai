"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockAreaChart } from "@/shared/components/Widgets";

export default function ThreatIntelligencePage() {
  return (
    <DashboardPageWrapper
      title="Threat Intelligence"
      description="Aggregated risk logs tracking network threats, coordinate bot campaigns, and malicious actors."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Known Coordinated Networks"
            value="9"
            trend="+1"
            trendDirection="up"
            description="Identified bot farm clusters"
          />
          <StatCard
            title="Tracked IP Addresses"
            value="184"
            trend="+45"
            trendDirection="up"
            description="Malicious scan origin points"
          />
          <StatCard
            title="Incident Risk Severity"
            value="28/100"
            trend="-10%"
            trendDirection="down"
            description="Coordinated attack risk average"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Threat Signatures Ingest Frequency</h3>
          <MockAreaChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
