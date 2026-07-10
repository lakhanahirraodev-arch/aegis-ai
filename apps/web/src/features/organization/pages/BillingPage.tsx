"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";

export default function BillingPage() {
  return (
    <DashboardPageWrapper
      title="Billing & Plans"
      description="Manage subscriptions, invoice logs, usage metrics, and subscription plans."
      category="Configuration"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Subscription"
            value="Creator Pro"
            trend="Active"
            trendDirection="up"
            description="Monthly billing tier"
          />
          <StatCard
            title="Next Invoicing Date"
            value="Aug 10, 2026"
            trend="Stable"
            trendDirection="neutral"
            description="Automatically charged via Stripe"
          />
          <StatCard
            title="API Usage Volume"
            value="48.2k / 100k"
            trend="Under quota"
            trendDirection="down"
            description="Requests in current cycle"
          />
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
          <h3 className="font-bold text-white mb-4">Workspace Subscription Plans</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Upgrade to Enterprise to request CDC event streaming, dedicated database shards,
            customizable legal hold retention schedules, and 24/7 dedicated support.
          </p>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
