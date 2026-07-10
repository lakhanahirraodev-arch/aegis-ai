"use client";

import React from "react";

interface EvidenceCardProps {
  filename: string;
  hash: string;
  size: string;
  capturedAt: string;
  holdStatus: boolean;
}

export function EvidenceCard({ filename, hash, size, capturedAt, holdStatus }: EvidenceCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-xs font-bold text-slate-200 truncate max-w-[200px]">{filename}</h4>
          <span className="text-[10px] text-slate-500 font-mono">{size}</span>
        </div>
        <span
          className={`text-xxs px-2.5 py-0.5 rounded-full font-bold border ${
            holdStatus
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-slate-950 text-slate-500 border-slate-850"
          }`}
        >
          {holdStatus ? "Legal Hold" : "Standard Archive"}
        </span>
      </div>
      <div className="bg-slate-950 p-2 rounded border border-slate-850/50 space-y-1">
        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          SHA-256 Checksum
        </div>
        <div className="text-xxs text-slate-400 font-mono truncate">{hash}</div>
      </div>
      <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
        <span>Preserved: {capturedAt}</span>
        <span className="text-emerald-400 font-semibold">Verified Safe</span>
      </div>
    </div>
  );
}
