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
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono uppercase px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-slate-400 font-semibold">
          {platform}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xxs text-slate-500 font-mono">{detectedAt}</span>
          <span
            className={`text-xxs px-2 py-0.5 rounded-full font-bold ${
              status === "OPEN"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {status}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed font-medium">{description}</p>
      <div className="flex justify-between items-center pt-2 border-t border-slate-850/50">
        <span className="text-xxs text-slate-500 font-mono">ID: {id}</span>
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-slate-500 font-mono">Risk:</span>
          <span
            className={`text-xs font-bold font-mono ${riskScore > 75 ? "text-rose-400" : "text-amber-400"}`}
          >
            {riskScore}/100
          </span>
        </div>
      </div>
    </div>
  );
}
