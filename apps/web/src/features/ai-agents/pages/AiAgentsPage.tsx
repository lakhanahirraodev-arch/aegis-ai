"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";
import { AgentStatusCard } from "@/features/ai-agents/components/AgentStatusCard";

export default function AiAgentsPage() {
  const activeAgents = [
    {
      name: "AbuseRiskClassifier",
      type: "Fastify Webhook Hook",
      status: "ACTIVE" as const,
      actionsCount: 812,
    },
    {
      name: "LikenessGuardAgent",
      type: "Cron Profile Scan",
      status: "ACTIVE" as const,
      actionsCount: 290,
    },
    {
      name: "DeepfakeAudioIngestor",
      type: "S3 Event Hook",
      status: "IDLE" as const,
      actionsCount: 145,
    },
  ];

  return (
    <DashboardPageWrapper
      title="AI Autonomous Agents"
      description="Deploy and manage autonomous classifiers, audio scanner daemons, and moderation filters."
      category="Monitor"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Agent Instances"
            value="3"
            trend="Optimal"
            trendDirection="up"
            description="Running agent orchestrators"
          />
          <StatCard
            title="Total Agent Decisions"
            value="1.2M"
            trend="+15%"
            trendDirection="up"
            description="Evaluated action criteria logs"
          />
          <StatCard
            title="Model Token Costs"
            value="$84.20"
            trend="-5%"
            trendDirection="down"
            description="Current billing month usage"
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
            AI Operations Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAgents.map((agent) => (
              <AgentStatusCard key={agent.name} {...agent} />
            ))}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
