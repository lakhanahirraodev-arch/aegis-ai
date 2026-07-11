"use client";

import React from "react";

// 1. STAT CARD
interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  description: string;
}

export function StatCard({ title, value, trend, trendDirection, description }: StatCardProps) {
  const isUp = trendDirection === "up";
  const isDown = trendDirection === "down";

  return (
    <div className="bg-surface-card border border-border-subtle p-6 rounded-xl space-y-3 select-none shadow-subtle">
      <div className="flex justify-between items-start">
        <span className="text-metadata font-medium text-text-muted">{title}</span>
        {trend !== "Stable" && trend !== "None" && trend !== "Receiving" && (
          <span
            className={`inline-flex items-center text-metadata font-semibold font-mono ${
              isUp ? "text-status-green" : isDown ? "text-status-red" : "text-text-muted"
            }`}
          >
            {isUp && "+"}
            {trend}
          </span>
        )}
      </div>
      <div className="text-number font-bold text-text-primary tracking-tight">{value}</div>
      <div className="text-metadata text-text-secondary leading-normal">{description}</div>
    </div>
  );
}

// 2. MOCK AREA CHART
export function MockAreaChart() {
  return (
    <div className="h-44 w-full bg-surface-card rounded-xl border border-border-subtle p-4 relative overflow-hidden flex items-end">
      {/* Subtle Grid Lines (4% gray opacity) */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-5">
        <div className="border-t border-text-muted w-full"></div>
        <div className="border-t border-text-muted w-full"></div>
        <div className="border-t border-text-muted w-full"></div>
      </div>

      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 C50,80 80,45 120,65 C160,85 200,25 240,45 C280,65 320,15 360,35 L400,15 L400,120 L0,120 Z"
          fill="url(#chartGrad)"
        />
        <path
          d="M0,100 C50,80 80,45 120,65 C160,85 200,25 240,45 C280,65 320,15 360,35 L400,15"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// 3. MOCK BAR CHART
export function MockBarChart() {
  const bars = [40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65, 80, 95, 85];
  return (
    <div className="h-44 w-full bg-surface-card rounded-xl border border-border-subtle p-5 flex items-end justify-between space-x-1.5">
      {bars.map((height, i) => {
        const isHighlighted = i === 13;
        return (
          <div key={i} className="flex-1 h-full flex flex-col justify-end group relative">
            <div
              className={`w-full rounded-t transition-custom ${
                isHighlighted ? "bg-accent" : "bg-[#E2E8F0] hover:bg-[#CBD5E1]"
              }`}
              style={{ height: `${height}%` }}
            />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-elevated border border-border-default text-metadata text-text-secondary px-2 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-custom pointer-events-none font-mono shadow-subtle">
              {height}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 4. ACTIVITY TIMELINE
interface TimelineItem {
  id: string;
  time: string;
  event: string;
  details: string;
  actor: string;
  status: "SUCCESS" | "FAILURE";
}

export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div key={item.id} className="relative flex items-start space-x-4 group">
          {/* Vertical line between items */}
          {idx < items.length - 1 && (
            <div className="absolute left-[3px] top-[14px] bottom-[-28px] w-0.5 bg-border-default" />
          )}

          {/* Status Indicator (Simple 8px Circle) */}
          <div className="mt-1 h-2 w-2 rounded-full bg-surface-hover flex items-center justify-center shrink-0 border border-border-default z-10">
            <div
              className={`h-1.5 w-1.5 rounded-full ${item.status === "SUCCESS" ? "bg-accent" : "bg-status-red"}`}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1 select-none">
            <div className="flex items-center justify-between">
              <span className="text-card-title font-medium text-text-primary">{item.event}</span>
              <span className="text-metadata font-mono text-text-muted">{item.time}</span>
            </div>
            <p className="text-body text-text-secondary leading-relaxed">{item.details}</p>
            <div className="flex items-center space-x-2.5 text-metadata text-text-muted font-mono pt-0.5">
              <span>Actor: {item.actor}</span>
              <span>•</span>
              <span className={item.status === "SUCCESS" ? "text-status-green" : "text-status-red"}>
                {item.status.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
