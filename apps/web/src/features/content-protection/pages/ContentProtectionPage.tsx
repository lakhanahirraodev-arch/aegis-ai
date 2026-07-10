"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockAreaChart } from "@/shared/components/Widgets";

export default function ContentProtectionPage() {
  return (
    <DashboardPageWrapper
      title="Content Protection"
      description="Scans content directories for copyright issues, duplicate video uploads, and speech clones."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Indexed Assets"
            value="2,482"
            trend="+40%"
            trendDirection="up"
            description="Registered video, audio, and documents"
          />
          <StatCard
            title="Media Duplication Rate"
            value="1.4%"
            trend="-0.2%"
            trendDirection="down"
            description="Ingested matches against public indexes"
          />
          <StatCard
            title="Active Copyright Disputes"
            value="3"
            trend="+1"
            trendDirection="up"
            description="Submitted legal DMCA actions"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Ingested Media Match Index Over Time</h3>
          <MockAreaChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
