"use client";

import React from "react";
import { Activity } from "lucide-react";

interface AgentStatusCardProps {
  name: string;
  type: string;
  status: "ACTIVE" | "IDLE" | "MUTED";
  actionsCount: number;
}

export function AgentStatusCard({ name, type, status, actionsCount }: AgentStatusCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between group">
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200">{name}</h4>
          <span className="text-[10px] text-slate-500 font-mono">{type}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-mono">Actions</div>
          <div className="text-xs font-bold text-slate-300 font-mono">{actionsCount}</div>
        </div>
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            status === "ACTIVE"
              ? "bg-emerald-400 animate-pulse"
              : status === "IDLE"
                ? "bg-amber-400"
                : "bg-slate-600"
          }`}
        ></span>
      </div>
    </div>
  );
}
