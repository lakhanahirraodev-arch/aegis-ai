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
    <div className="bg-surface-card border border-border-subtle rounded-xl p-6 space-y-4 select-none">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h4 className="text-card-title font-medium text-text-primary truncate max-w-[200px]">
            {filename}
          </h4>
          <span className="text-metadata text-text-muted font-mono">{size}</span>
        </div>
        <span
          className={`text-metadata px-2.5 py-0.5 rounded-md font-mono border shrink-0 ${
            holdStatus
              ? "bg-status-amber-bg text-status-amber border-status-amber/10"
              : "bg-surface-canvas text-text-muted border-border-default"
          }`}
        >
          {holdStatus ? "Legal Hold" : "Standard Archive"}
        </span>
      </div>

      <div className="bg-surface-canvas p-3 rounded-lg border border-border-default space-y-1">
        <div className="text-metadata text-text-muted font-mono uppercase tracking-wider">
          SHA-256 Checksum
        </div>
        <div className="text-metadata text-text-secondary font-mono truncate">{hash}</div>
      </div>

      <div className="flex justify-between items-center text-metadata text-text-muted font-mono pt-1">
        <span>Preserved: {capturedAt}</span>
        <span className="text-status-green font-medium">Verified Safe</span>
      </div>
    </div>
  );
}
