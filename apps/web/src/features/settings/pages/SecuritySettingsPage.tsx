"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { Lock } from "lucide-react";

export default function SecuritySettingsPage() {
  return (
    <DashboardPageWrapper
      title="Security Settings"
      description="Configure workspace security policies, dual-approvals, and legal data retention rules."
      category="Configuration"
    >
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-400 animate-pulse" />
          Feature Gate Policies
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Workspace features are resolved by your billing tier. Upgrade to Creator Pro or Enterprise
          to activate Live Stream Guardian, deepfake scanners, and CDC event publishing.
        </p>
      </div>
    </DashboardPageWrapper>
  );
}
