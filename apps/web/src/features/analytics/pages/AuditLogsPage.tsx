"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard, ActivityTimeline } from "@/shared/components/Widgets";

export default function AuditLogsPage() {
  const auditLogs = [
    {
      id: "1",
      time: "14:24",
      event: "Scan Completed",
      details: "Discovery Agent finalized 15 YouTube copyright checks",
      actor: "AI_AGENT",
      status: "SUCCESS" as const,
    },
    {
      id: "2",
      time: "14:10",
      event: "Webhook Dispatched",
      details: "Webhook sync to Clerk user org profiles triggered",
      actor: "SYSTEM",
      status: "SUCCESS" as const,
    },
    {
      id: "3",
      time: "13:45",
      event: "API Key Revoked",
      details: "Developer integration token disabled by Owner",
      actor: "USER",
      status: "SUCCESS" as const,
    },
  ];

  return (
    <DashboardPageWrapper
      title="System Audit Logs"
      description="Immutable operations log of security checks, configuration changes, and active actors."
      category="Governance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Total Audit Entries"
            value="14,892"
            trend="+140"
            trendDirection="up"
            description="Workspace logs in PostgreSQL"
          />
          <StatCard
            title="System Actor Events"
            value="82%"
            trend="Stable"
            trendDirection="neutral"
            description="Proactive agent and cron events"
          />
          <StatCard
            title="Encryption Health"
            value="Signed"
            trend="100%"
            trendDirection="up"
            description="HMAC log protection verified"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-500">
            Immutable Audit Logs
          </h3>
          <ActivityTimeline items={auditLogs} />
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
