"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";

export default function HelpPage() {
  return (
    <DashboardPageWrapper
      title="Help Desk"
      description="Access developer documentation, compliance guides, and safety training manuals."
      category="Configuration"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Safety Manuals"
            value="12 Docs"
            trend="Available"
            trendDirection="up"
            description="Regulatory compliance guides"
          />
          <StatCard
            title="Open Support Cases"
            value="0"
            trend="Optimal"
            trendDirection="down"
            description="Support ticket queue size"
          />
          <StatCard
            title="Response SLA"
            value="15 mins"
            trend="Optimal"
            trendDirection="up"
            description="Enterprise support SLA tier"
          />
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
          <h3 className="font-bold text-white mb-4">Aegis Trust & Safety Training Reference</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Read BIPA guidelines, COPPA compliance sheets, DMCA filing logs, and coordinate bot
            network patterns inside our unified developer handbook.
          </p>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
