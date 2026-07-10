import React from "react";
import { Lock } from "@aegis/ui";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-white">Workspace Settings</h2>
        <p className="text-slate-400 text-sm">
          Configure security rules, features, and plan tiers.
        </p>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5 text-indigo-400" />
          Feature Gate Policies
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          Workspace features are resolved by your billing tier. Upgrade to Creator Pro or Enterprise
          to activate Live Stream Guardian, deepfake scanners, and CDC event publishing.
        </p>
      </div>
    </div>
  );
}
