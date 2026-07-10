"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

// 1. STAT CARD
interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  description: string;
}

export function StatCard({ title, value, trend, trendDirection, description }: StatCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
      <div className="flex justify-between items-center text-xs font-medium text-slate-500 uppercase tracking-wider">
        <span>{title}</span>
        <div
          className={`flex items-center space-x-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trendDirection === "up"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : trendDirection === "down"
                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {trendDirection === "up" && <ArrowUpRight className="h-3 w-3" />}
          {trendDirection === "down" && <ArrowDownRight className="h-3 w-3" />}
          <span>{trend}</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
      <p className="text-slate-400 text-xs">{description}</p>
    </div>
  );
}

// 2. MOCK AREA CHART
export function MockAreaChart() {
  return (
    <div className="h-48 w-full bg-slate-950 rounded-lg border border-slate-850 p-4 relative overflow-hidden flex items-end">
      <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
        <div className="border-t border-slate-800 w-full"></div>
        <div className="border-t border-slate-800 w-full"></div>
        <div className="border-t border-slate-800 w-full"></div>
      </div>

      <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0,100 C50,80 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,10 L400,120 L0,120 Z"
          fill="url(#chartGrad)"
        />
        <path
          d="M0,100 C50,80 80,40 120,60 C160,80 200,20 240,40 C280,60 320,10 360,30 L400,10"
          fill="none"
          stroke="#818cf8"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

// 3. MOCK BAR CHART
export function MockBarChart() {
  const bars = [40, 60, 45, 80, 55, 90, 70, 85, 60, 75, 50, 65, 80, 95, 85];
  return (
    <div className="h-48 w-full bg-slate-950 rounded-lg border border-slate-850 p-6 flex items-end justify-between space-x-1.5">
      {bars.map((height, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-gradient-to-t from-indigo-600 to-cyan-500 rounded-t group relative hover:opacity-80 transition duration-150"
            style={{ height: `${height}%` }}
          >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-[10px] text-slate-200 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none font-mono">
              {height}%
            </div>
          </div>
        </div>
      ))}
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
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start space-x-3 border-l-2 border-slate-800 pl-4 relative ml-2 py-1"
        >
          <div className="absolute -left-1.5 top-2.5 h-3 w-3 rounded-full bg-slate-850 border-2 border-indigo-500"></div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">{item.event}</span>
              <span className="text-xxs font-mono text-slate-500">{item.time}</span>
            </div>
            <p className="text-xs text-slate-400">{item.details}</p>
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
              <span>Actor: {item.actor}</span>
              <span>•</span>
              <span className={item.status === "SUCCESS" ? "text-emerald-400" : "text-rose-400"}>
                {item.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
