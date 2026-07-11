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
    <div className="flex items-center justify-between py-4 border-b border-border-subtle last:border-0 group select-none">
      <div className="flex items-center space-x-4 min-w-0">
        {/* AI surface color (rgba(139, 124, 248, 0.10)) used exclusively for AI Agent icon background */}
        <div className="h-9 w-9 bg-ai-surface rounded-lg flex items-center justify-center shrink-0 border border-ai-accent/10">
          <Activity className="h-4.5 w-4.5 text-ai-accent group-hover:scale-105 transition-custom" />
        </div>
        <div className="min-w-0">
          <h4 className="text-body font-medium text-text-primary truncate">{name}</h4>
          <span className="text-metadata text-text-muted font-mono">{type}</span>
        </div>
      </div>
      <div className="flex items-center space-x-4 shrink-0">
        <div className="text-right">
          <div className="text-metadata font-mono text-text-secondary font-medium">
            {actionsCount} actions
          </div>
        </div>

        {/* Simple 8px circle. Green: Healthy, Amber: Idle/Warning, Purple (AI): AI Processing */}
        <span
          className={`h-2 w-2 rounded-full ${
            status === "ACTIVE"
              ? "bg-ai-accent"
              : status === "IDLE"
                ? "bg-status-amber"
                : "bg-text-disabled"
          }`}
        />
      </div>
    </div>
  );
}
