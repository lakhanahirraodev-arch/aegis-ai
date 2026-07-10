"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";
import { IncidentCard } from "@/features/evidence-center/components/IncidentCard";

export default function IncidentsPage() {
  const incidents = [
    {
      id: "INC-9912",
      platform: "YouTube",
      riskScore: 84,
      description:
        "Copyrighted media match discovered inside audio track on unauthorized creator channel.",
      detectedAt: "10 mins ago",
      status: "OPEN" as const,
    },
    {
      id: "INC-8541",
      platform: "X / Twitter",
      riskScore: 61,
      description: "Fake brand handle profile mimicking workspace logo metadata.",
      detectedAt: "1 hour ago",
      status: "RESOLVED" as const,
    },
  ];

  return (
    <DashboardPageWrapper
      title="Triaged Incidents"
      description="Track safety reviews, platform notifications, and active brand phishing investigations."
      category="Governance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Open Case Files"
            value="1"
            trend="-1"
            trendDirection="down"
            description="Currently active safety triages"
          />
          <StatCard
            title="Average Triage Time"
            value="14m"
            trend="-3m"
            trendDirection="down"
            description="Incident ingestion to lock duration"
          />
          <StatCard
            title="Critical Incidents"
            value="0"
            trend="Zero"
            trendDirection="neutral"
            description="Risk rating exceeding severity 90"
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
            Active Incident Triage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incidents.map((incident) => (
              <IncidentCard key={incident.id} {...incident} />
            ))}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
