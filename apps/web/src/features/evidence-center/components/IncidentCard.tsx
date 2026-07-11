"use client";

import React from "react";

interface IncidentCardProps {
  id: string;
  platform: string;
  riskScore: number;
  description: string;
  detectedAt: string;
  status: "OPEN" | "RESOLVED";
}

export function IncidentCard({
  id,
  platform,
  riskScore,
  description,
  detectedAt,
  status,
}: IncidentCardProps) {
  const isHighRisk = riskScore > 75;

  return (
    <div className="py-4 border-b border-border-subtle last:border-0 space-y-2.5 min-w-0 select-none">
      <div className="flex justify-between items-center text-metadata font-mono">
        <div className="flex items-center space-x-2.5">
          <span className="text-text-primary font-medium">{platform}</span>
          <span className="text-border-default">|</span>
          <span className="text-text-muted">{id}</span>
        </div>
        <span className="text-text-muted">{detectedAt}</span>
      </div>

      {/* Description: body text (15px) */}
      <p className="text-body text-text-secondary leading-relaxed font-sans">{description}</p>

      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center space-x-2">
          {/* Simple 8px circle. Green: Resolved, Red: Open/Critical */}
          <span
            className={`h-2 w-2 rounded-full ${status === "OPEN" ? "bg-status-red" : "bg-status-green"}`}
          />
          <span className="text-metadata text-text-muted font-medium">{status.toLowerCase()}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-metadata text-text-muted">Risk:</span>
          <span
            className={`text-metadata font-semibold font-mono ${isHighRisk ? "text-status-red" : "text-status-amber"}`}
          >
            {riskScore}/100
          </span>
        </div>
      </div>
    </div>
  );
}
