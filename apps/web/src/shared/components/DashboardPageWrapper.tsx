"use client";

import React, { useState } from "react";
import { AlertCircle, FileQuestion, Loader2 } from "lucide-react";

interface DashboardPageWrapperProps {
  title: string;
  description: string;
  category: string;
  children: React.ReactNode;
}

export default function DashboardPageWrapper({
  title,
  description,
  category,
  children,
}: DashboardPageWrapperProps) {
  const [state, setState] = useState<"loaded" | "loading" | "empty" | "error">("loaded");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            <span>Aegis</span>
            <span>/</span>
            <span>{category}</span>
            <span>/</span>
            <span className="text-slate-300 font-semibold">{title}</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
          <p className="text-slate-400 text-sm mt-1">{description}</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg self-start">
          <span className="text-[10px] font-mono text-slate-500 uppercase px-2 font-semibold">
            Demo State:
          </span>
          {(["loaded", "loading", "empty", "error"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-2 py-1 rounded text-xxs font-mono uppercase font-semibold transition ${
                state === s
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-500 hover:text-slate-300 border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="transition duration-150">
        {state === "loading" && (
          <div className="min-h-[350px] bg-slate-900/40 border border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-12">
            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-300">Resolving workspace queries...</p>
            <p className="text-xs text-slate-500 mt-1">
              Applying global tenant constraints and client scopes
            </p>
            <div className="w-64 bg-slate-950 h-1.5 rounded-full mt-4 overflow-hidden border border-slate-800">
              <div className="bg-indigo-500 h-full rounded-full animate-pulse w-1/3"></div>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="min-h-[350px] bg-red-950/10 border border-red-500/20 rounded-xl flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 bg-red-500/10 rounded-full border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-white">Execution Fault Encountered</h3>
            <p className="text-sm text-red-400/80 mt-2 max-w-md">
              Failed to connect to workspace data proxy. Connection closed by transactional security
              boundary policy.
            </p>
            <button
              onClick={() => setState("loaded")}
              className="mt-6 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Retry Connection
            </button>
          </div>
        )}

        {state === "empty" && (
          <div className="min-h-[350px] bg-slate-900/40 border border-slate-800/60 rounded-xl flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 bg-slate-800 rounded-full border border-slate-700/60 flex items-center justify-center mb-4 text-slate-400">
              <FileQuestion className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">No Telemetry Discovered</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              There is no data matching this capability criteria in the active workspace context.
              Configure monitors to ingest events.
            </p>
          </div>
        )}

        {state === "loaded" && <div className="animate-fadeIn">{children}</div>}
      </div>
    </div>
  );
}
