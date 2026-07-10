"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockAreaChart } from "@/shared/components/Widgets";
import { Radio } from "lucide-react";

export default function LiveGuardianPage() {
  return (
    <DashboardPageWrapper
      title="Live Stream Guardian"
      description="Real-time chat moderation, automated toxicity blocking, and broadcast metrics."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Chat Messages Audited"
            value="482.9k"
            trend="+15%"
            trendDirection="up"
            description="Inbound chat items parsed"
          />
          <StatCard
            title="Flagged Anomalies"
            value="1,240"
            trend="-8%"
            trendDirection="down"
            description="Auto-blocked spam or abuse"
          />
          <StatCard
            title="Moderator Latency"
            value="1.2s"
            trend="Stable"
            trendDirection="neutral"
            description="AI Classifier roundtrip time"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Radio className="h-4 w-4 text-rose-500 animate-pulse" />
            Active Channel Chat Volume Trend
          </h3>
          <MockAreaChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
