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
import { Radio, Activity, Globe } from "lucide-react";

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
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" />
                  Reputation Trends & Detection Timelines
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  Live telemetry ingest
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-medium">
                    Monthly Risk Profile Trends
                  </div>
                  <MockAreaChart />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-medium">Daily Asset Ingest Rate</div>
                  <MockBarChart />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Radio className="h-4 w-4 text-cyan-400 Inbound active animation" />
                  Live Broadcast Feeds
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-xs font-bold text-slate-200">Twitch Stream #1</span>
                    </div>
                    <span className="text-xxs text-indigo-400 font-mono">1.2k Viewers</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-xs font-bold text-slate-200">YouTube Live #2</span>
                    </div>
                    <span className="text-xxs text-indigo-400 font-mono">4.5k Viewers</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-400" />
                  Ingest Integrations
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xxs font-mono">
                  <div className="p-2.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-300 text-center">
                    YouTube Ingest: <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 text-center">
                    Twitch Ingest: <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 text-center">
                    X Ingest: <span className="text-emerald-400 font-bold">Active</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-855 rounded-lg text-slate-300 text-center">
                    TikTok Ingest: <span className="text-rose-400 font-bold">Muted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center text-center space-y-3">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-500">
                Community Health Score
              </h3>
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="transparent"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    fill="transparent"
                    stroke="#6366f1"
                    strokeWidth="8"
                    strokeDasharray={300}
                    strokeDashoffset={60}
                  />
                </svg>
                <div className="text-xl font-extrabold text-white">82%</div>
              </div>
              <p className="text-slate-400 text-xxs">
                Automated toxicity mitigation score across channels
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
                  Triage Alerts
                </h3>
                <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer hover:underline">
                  View All
                </span>
              </div>
              {recentIncidents.map((incident) => (
                <IncidentCard key={incident.id} {...incident} />
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
                  AI Operations
                </h3>
                <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer hover:underline">
                  View All
                </span>
              </div>
              {activeAgents.map((agent) => (
                <AgentStatusCard key={agent.name} {...agent} />
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-500">
                Operational Log Audit
              </h3>
              <ActivityTimeline items={timelineEvents} />
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
