import React from "react";
import { Shield, Lock } from "@aegis/ui";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Dashboard Cockpit</h2>
        <p className="text-slate-400 text-sm">Welcome to your secure Aegis AI workspace cockpit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            Security Context
          </h3>
          <p className="text-sm text-slate-400">
            Tenant isolation is verified. Database queries are auto-scoped to your active
            organization.
          </p>
        </div>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Lock className="h-5 w-5 text-rose-400" />
            RBAC Status
          </h3>
          <p className="text-sm text-slate-400">
            Permissions are resolved dynamically based on your Clerk organization membership
            profile.
          </p>
        </div>
      </div>
    </div>
  );
}
