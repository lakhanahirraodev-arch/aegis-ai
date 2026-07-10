"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, MockAreaChart } from "@/shared/components/Widgets";

export default function AnalyticsPage() {
  return (
    <DashboardPageWrapper
      title="Metrics Analytics"
      description="Deep safety analytics, classification rates, and API telemetry ingestion metrics."
      category="Governance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="API Requests Ingested"
            value="2.4M"
            trend="+18%"
            trendDirection="up"
            description="Workspace API endpoint entries"
          />
          <StatCard
            title="Average Query Duration"
            value="42ms"
            trend="-4ms"
            trendDirection="down"
            description="PostgreSQL read/write times"
          />
          <StatCard
            title="Analytics Database Size"
            value="48.2 GB"
            trend="+1.2 GB"
            trendDirection="up"
            description="pgvector and index usage"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Workspace Data Ingestion Velocity</h3>
          <MockAreaChart />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
