"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";
import { Radio, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";

export default function LiveGuardianPage() {
  return (
    <DashboardPageWrapper
      title="Live Stream Guardian"
      description="Real-time chat moderation, automated toxicity blocking, and broadcast metrics."
      category="Monitor"
    >
      <div className="space-y-10 select-none">
        {/* Core Metrics row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Chat Messages Audited"
            value="0"
            trend="None"
            trendDirection="neutral"
            description="Active livestream parser channels"
          />
          <StatCard
            title="Flagged Anomalies"
            value="0"
            trend="None"
            trendDirection="neutral"
            description="Auto-blocked spam or abuse actions"
          />
          <StatCard
            title="Moderator Latency"
            value="0.0s"
            trend="Stable"
            trendDirection="neutral"
            description="AI Classifier roundtrip latency"
          />
        </div>

        {/* Ingestion Flow Architecture Card */}
        <div className="bg-surface-card border border-border-default rounded-xl p-8 space-y-6 shadow-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border-default pb-4">
            <div>
              <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2.5">
                {/* AI specific accents reserved exclusively here */}
                <Radio className="h-4 w-4 text-ai-accent" />
                Live Guardian Ingestion Flow (Sprint 5)
              </h3>
              <p className="text-metadata text-text-muted mt-0.5">
                Real-time ingestion, classification, and mitigation architecture
              </p>
            </div>
            <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase bg-ai-surface text-ai-accent border border-ai-accent/15">
              sprint 5 release preview
            </span>
          </div>

          {/* Minimal visual architecture block */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center pt-2">
            {/* Step 1 */}
            <div className="p-6 bg-surface-canvas border border-border-default rounded-xl flex flex-col items-center text-center space-y-3 shadow-subtle">
              <ShieldCheck className="h-6 w-6 text-text-muted" />
              <div className="text-body font-semibold text-text-secondary">1. Stream Start</div>
              <p className="text-metadata text-text-muted leading-relaxed">
                Twitch / YouTube broadcast live connection
              </p>
            </div>

            <div className="hidden lg:flex justify-center text-text-disabled">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-surface-canvas border border-border-default rounded-xl flex flex-col items-center text-center space-y-3 shadow-subtle">
              <Database className="h-6 w-6 text-text-muted" />
              <div className="text-body font-semibold text-text-secondary">2. Ingest Bus</div>
              <p className="text-metadata text-text-muted leading-relaxed">
                Normalized event payloads stream to queue
              </p>
            </div>

            <div className="hidden lg:flex justify-center text-text-disabled">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-surface-canvas border border-border-default rounded-xl flex flex-col items-center text-center space-y-3 shadow-subtle">
              <Cpu className="h-6 w-6 text-ai-accent" />
              <div className="text-body font-semibold text-text-secondary">3. AI Moderation</div>
              <p className="text-metadata text-text-muted leading-relaxed">
                Toxicity and risk scoring pipeline
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-border-default flex flex-col sm:flex-row sm:items-center justify-between gap-6 text-metadata text-text-muted leading-relaxed">
            <p>
              Live stream moderation features will activate automatically once you connect Twitch or
              YouTube inside Developer Integrations and begin a live broadcast.
            </p>

            <button
              onClick={() => (window.location.href = "/dashboard/integrations")}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-button font-medium rounded-xl transition-custom whitespace-nowrap self-start sm:self-auto shadow-subtle"
            >
              Configure Integrations
            </button>
          </div>
        </div>

        {/* Live volume empty trend */}
        <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
          <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2.5">
            <Radio className="h-4.5 w-4.5 text-text-muted" />
            Active Channel Chat Volume Trend
          </h3>
          <div className="h-40 bg-surface-canvas border border-border-default rounded-xl flex items-center justify-center">
            <span className="text-metadata text-text-muted font-medium">
              No active channels streaming
            </span>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
