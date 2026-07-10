"use client";

import React from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";
import { EvidenceCard } from "@/features/evidence-center/components/EvidenceCard";

export default function EvidenceLockerPage() {
  const evidenceItems = [
    {
      filename: "lookalike_twitter_profile.png",
      hash: "4a8a08f09d37b7379564903820de465b820cfb8921820dbca8910d8a",
      size: "1.4 MB",
      capturedAt: "2 hours ago",
      holdStatus: true,
    },
    {
      filename: "voice_clone_deepfake_call.mp3",
      hash: "9b3c4820cfb8921820dbca8910d8a4a8a08f09d37b7379564903820de465b",
      size: "8.5 MB",
      capturedAt: "Yesterday",
      holdStatus: false,
    },
  ];

  return (
    <DashboardPageWrapper
      title="Evidence Locker"
      description="View cryptographically signed records, preserved files, and litigation-hold tags."
      category="Governance"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Preserved Assets"
            value="48"
            trend="+6"
            trendDirection="up"
            description="Unique cryptographic evidence blocks"
          />
          <StatCard
            title="Locker Ingest Volume"
            value="1.2 GB"
            trend="Optimal"
            trendDirection="up"
            description="MinIO private secure bucket use"
          />
          <StatCard
            title="Active Legal Holds"
            value="1"
            trend="Stable"
            trendDirection="neutral"
            description="Items locked under retention rule"
          />
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">
            Cryptographic Locker Assets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceItems.map((item) => (
              <EvidenceCard key={item.filename} {...item} />
            ))}
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
