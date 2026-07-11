"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import {
  StatCard,
  MockAreaChart,
  MockBarChart,
  ActivityTimeline,
} from "@/shared/components/Widgets";
import { AgentStatusCard } from "@/features/ai-agents/components/AgentStatusCard";
import { IncidentCard } from "@/features/evidence-center/components/IncidentCard";
import { Activity, Globe, Radio } from "lucide-react";

export default function DashboardCockpitPage() {
  const statCards = [
    {
      title: "Active Threat Incidents",
      value: "24",
      trend: "+12%",
      trendDirection: "up" as const,
      description: "Risk profiles flagged within the last 24h",
    },
    {
      title: "Reputation Alerts Ingested",
      value: "1,492",
      trend: "-3.5%",
      trendDirection: "down" as const,
      description: "Total profile checks executed",
    },
    {
      title: "CDC Scan Volume",
      value: "98.9k",
      trend: "+25%",
      trendDirection: "up" as const,
      description: "Ingested content assets",
    },
    {
      title: "Auto Mitigation Rate",
      value: "92.4%",
      trend: "Stable",
      trendDirection: "neutral" as const,
      description: "AI Agent decision outcomes",
    },
  ];

  const recentIncidents = [
    {
      id: "INC-9912",
      platform: "YouTube",
      riskScore: 84,
      description:
        "Copyrighted media match discovered inside audio track on unauthorized creator channel.",
      detectedAt: "10m ago",
      status: "OPEN" as const,
    },
    {
      id: "INC-8541",
      platform: "X / Twitter",
      riskScore: 61,
      description: "Fake brand handle profile mimicking workspace logo metadata.",
      detectedAt: "1h ago",
      status: "RESOLVED" as const,
    },
  ];

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

  const timelineEvents = [
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
      title="Overview Cockpit"
      description="Real-time operations center tracking identity, reputation, content, and live chat telemetry."
      category="Monitor"
    >
      <div className="space-y-10">
        {/* Core Hero Banner Section (Answers: Am I protected? Is anything wrong? What next?) */}
        <div className="bg-surface-card border border-border-default rounded-xl p-8 space-y-6 shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-metadata text-status-green font-medium">
                <span className="h-2 w-2 rounded-full bg-status-green"></span>
                <span>Active Guardian System Secure</span>
              </div>
              <h1 className="text-hero font-semibold text-text-primary tracking-tight">
                Your workspace is actively protected.
              </h1>
              <p className="text-body text-text-secondary leading-relaxed max-w-2xl">
                Aegis AI successfully scanned 98.9k assets in the last 24 hours. There are currently{" "}
                <span className="text-status-red font-medium">24 active threats</span> that require
                your triage attention.
              </p>
            </div>

            <button
              onClick={() => (window.location.href = "/dashboard/incidents")}
              className="px-5 py-3 bg-accent hover:bg-accent-hover text-white text-button font-medium rounded-xl transition-custom shrink-0 self-start md:self-center shadow-subtle"
            >
              Triage Threats
            </button>
          </div>
        </div>

        {/* Stats metrics grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Core telemetry details section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts & Activity Ingests columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Telemetry charts */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-6 shadow-subtle">
              <div className="flex justify-between items-center pb-3 border-b border-border-default">
                <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2.5 select-none">
                  <Activity className="h-4.5 w-4.5 text-accent" />
                  Reputation Trends & Detection Timelines
                </h3>
                <span className="text-metadata font-mono text-text-muted">Live telemetry</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-metadata text-text-secondary font-medium select-none">
                    Monthly Risk Profile Trends
                  </div>
                  <MockAreaChart />
                </div>
                <div className="space-y-3">
                  <div className="text-metadata text-text-secondary font-medium select-none">
                    Daily Asset Ingest Rate
                  </div>
                  <MockBarChart />
                </div>
              </div>
            </div>

            {/* Ingest and Broadcast panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Broadcast feeds */}
              <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
                <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2.5 select-none">
                  <Radio className="h-4.5 w-4.5 text-accent" />
                  Live Broadcast Feeds
                </h3>
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex items-center justify-between transition-custom hover:bg-surface-hover select-none">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-2 w-2 rounded-full bg-status-green"></span>
                      <span className="text-body font-medium text-text-secondary">
                        Twitch Channel
                      </span>
                    </div>
                    <span className="text-metadata text-text-muted font-mono">1.2k viewers</span>
                  </div>

                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex items-center justify-between transition-custom hover:bg-surface-hover select-none">
                    <div className="flex items-center space-x-2.5">
                      <span className="h-2 w-2 rounded-full bg-status-green"></span>
                      <span className="text-body font-medium text-text-secondary">
                        YouTube Live Feed
                      </span>
                    </div>
                    <span className="text-metadata text-text-muted font-mono">4.5k viewers</span>
                  </div>
                </div>
              </div>

              {/* Ingest metadata */}
              <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
                <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2.5 select-none">
                  <Globe className="h-4.5 w-4.5 text-accent" />
                  Ingest Integrations
                </h3>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex flex-col justify-between select-none">
                    <span className="text-metadata font-mono text-text-muted uppercase">
                      YouTube
                    </span>
                    <span className="text-body font-semibold text-status-green mt-1">active</span>
                  </div>
                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex flex-col justify-between select-none">
                    <span className="text-metadata font-mono text-text-muted uppercase">
                      Twitch
                    </span>
                    <span className="text-body font-semibold text-status-green mt-1">active</span>
                  </div>
                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex flex-col justify-between select-none">
                    <span className="text-metadata font-mono text-text-muted uppercase">
                      X / Twitter
                    </span>
                    <span className="text-body font-semibold text-status-green mt-1">active</span>
                  </div>
                  <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex flex-col justify-between select-none">
                    <span className="text-metadata font-mono text-text-muted uppercase">
                      TikTok
                    </span>
                    <span className="text-body font-semibold text-text-disabled mt-1">muted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column sidebar elements */}
          <div className="space-y-8">
            {/* Community Health Score */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-subtle">
              <h3 className="text-metadata font-semibold text-text-muted tracking-tight select-none">
                Community Health Score
              </h3>

              <div className="relative h-24 w-24 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="transparent"
                    stroke="var(--color-brand-primary)"
                    strokeWidth="4"
                    strokeDasharray={251}
                    strokeDashoffset={251 - (251 * 82) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-section font-semibold text-text-primary font-mono select-none">
                  82%
                </div>
              </div>

              <p className="text-text-muted text-metadata leading-relaxed select-none">
                Automated toxicity mitigation score across active broadcast channels
              </p>
            </div>

            {/* Triage Alerts list */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
              <div className="flex justify-between items-center pb-2 border-b border-border-default select-none">
                <h3 className="font-semibold text-card-title text-text-primary">Triage Alerts</h3>
                <span className="text-metadata text-accent font-medium cursor-pointer hover:underline">
                  View All
                </span>
              </div>
              <div className="divide-y divide-border-default">
                {recentIncidents.map((incident) => (
                  <IncidentCard key={incident.id} {...incident} />
                ))}
              </div>
            </div>

            {/* AI operations status */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
              <div className="flex justify-between items-center pb-2 border-b border-border-default select-none">
                <h3 className="font-semibold text-card-title text-text-primary">AI Operations</h3>
                <span className="text-metadata text-accent font-medium cursor-pointer hover:underline">
                  View All
                </span>
              </div>
              <div className="divide-y divide-border-default">
                {activeAgents.map((agent) => (
                  <AgentStatusCard key={agent.name} {...agent} />
                ))}
              </div>
            </div>

            {/* Audit log audits */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
              <h3 className="font-semibold text-card-title text-text-primary pb-2 border-b border-border-default select-none">
                Operational Log Audit
              </h3>
              <div className="pt-2">
                <ActivityTimeline items={timelineEvents} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
