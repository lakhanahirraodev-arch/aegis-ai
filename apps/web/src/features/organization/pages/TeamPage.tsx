"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";

export default function TeamPage() {
  return (
    <DashboardPageWrapper
      title="Workspace Team"
      description="Manage role-based access control (RBAC), team memberships, and profile overrides."
      category="Configuration"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Active Team Members"
            value="4"
            trend="Optimal"
            trendDirection="up"
            description="Registered dashboard accounts"
          />
          <StatCard
            title="Pending Invitations"
            value="1"
            trend="Stable"
            trendDirection="neutral"
            description="Open Clerk member invites"
          />
          <StatCard
            title="MFA Compliance Rate"
            value="100%"
            trend="Optimal"
            trendDirection="up"
            description="Clerk 2FA enforcement rating"
          />
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
          <h3 className="font-bold text-white mb-4">Workspace Security Access Restrictions</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Roles are evaluated during every transactional request. A role can range from Viewers
            (read-only telemetry) to Owners (billing configuration and workspace deletion
            capabilities).
          </p>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
