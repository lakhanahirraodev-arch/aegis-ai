"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";

export default function IntegrationsPage() {
  return (
    <DashboardPageWrapper
      title="Developer Integrations"
      description="Connect Twitch, YouTube, Discord, and Slack channels to configure ingest and enforcements."
      category="Configuration"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Connected Platforms"
            value="3"
            trend="Stable"
            trendDirection="neutral"
            description="Active ingest social connections"
          />
          <StatCard
            title="Developer API Keys"
            value="2"
            trend="+1"
            trendDirection="up"
            description="Active integration tokens"
          />
          <StatCard
            title="Outgoing Webhooks"
            value="1"
            trend="Stable"
            trendDirection="neutral"
            description="Outgoing safety notification endpoints"
          />
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
          <h3 className="font-bold text-white mb-4">Ingest Webhook Subscriptions</h3>
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            Aegis AI supports bi-directional webhook triggers. Ingest events are validated via
            SHA-256 HMAC headers before being passed to queue workers.
          </p>
          <div className="px-4 py-2 bg-slate-950 border border-slate-850 rounded text-xs text-slate-500 font-mono select-all">
            https://api.aegis.ai/v1/webhooks/ingest
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
