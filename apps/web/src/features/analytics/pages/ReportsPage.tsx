"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockBarChart } from "@/shared/components/Widgets";

export default function ReportsPage() {
  return (
    <DashboardPageWrapper
      title="Safety Reports"
      description="Export audit summaries, safety analytics logs, and platform takedown compliance summaries."
      category="Governance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Safety Reports Exported"
            value="14"
            trend="+3"
            trendDirection="up"
            description="Generated PDF/CSV archives"
          />
          <StatCard
            title="Compliance Filings"
            value="2"
            trend="Stable"
            trendDirection="neutral"
            description="DMCA notice receipts registered"
          />
          <StatCard
            title="Scheduled Audits"
            value="Weekly"
            trend="Active"
            trendDirection="up"
            description="Cron report runs configured"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Monthly Report Generation Frequency</h3>
          <MockBarChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
