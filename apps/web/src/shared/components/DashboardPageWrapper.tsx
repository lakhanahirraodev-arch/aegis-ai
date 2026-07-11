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
    <div className="px-10 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between border-b border-border-default pb-6 gap-6">
        <div className="space-y-2">
          {/* Breadcrumb: Metadata size (13px), muted text */}
          <div className="flex items-center space-x-2 text-metadata text-text-muted select-none font-medium">
            <span>Aegis</span>
            <span className="text-border-default">/</span>
            <span>{category}</span>
            <span className="text-border-default">/</span>
            <span className="text-text-secondary">{title}</span>
          </div>
          {/* Title: Page Title size (28px) */}
          <h2 className="text-title font-semibold text-text-primary tracking-tight">{title}</h2>
          {/* Description: Body size (15px), secondary text */}
          <p className="text-body text-text-secondary leading-relaxed max-w-3xl">{description}</p>
        </div>

        {/* Demo State switcher - subtle & minimal capsule */}
        <div className="flex items-center space-x-1.5 bg-surface-card border border-border-default p-1 rounded-lg self-start shrink-0 shadow-subtle">
          {(["loaded", "loading", "empty", "error"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-custom ${
                state === s
                  ? "bg-accent-tint text-accent border border-accent/15"
                  : "text-text-muted hover:text-text-secondary border border-transparent"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Page Content / State Views */}
      <div className="transition-custom">
        {state === "loading" && (
          <div className="min-h-[400px] bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center p-12 shadow-subtle">
            <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
            <p className="text-body font-semibold text-text-primary">
              Resolving workspace queries...
            </p>
            <p className="text-metadata text-text-muted mt-1">
              Applying global tenant constraints and client scopes
            </p>
            <div className="w-56 bg-surface-hover h-1.5 rounded-full mt-5 overflow-hidden border border-border-default">
              <div className="bg-accent h-full rounded-full w-1/3 animate-pulse"></div>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="min-h-[400px] bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center p-12 text-center shadow-subtle">
            <div className="h-10 w-10 bg-status-red-bg rounded-full border border-status-red/10 flex items-center justify-center mb-4 text-status-red">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-card-title font-semibold text-text-primary">
              Execution Fault Encountered
            </h3>
            <p className="text-metadata text-text-muted mt-2 max-w-sm leading-relaxed">
              Failed to connect to workspace data proxy. Connection closed by transactional security
              boundary policy.
            </p>
            <button
              onClick={() => setState("loaded")}
              className="mt-6 px-4 py-2 bg-accent hover:bg-accent-hover text-white text-button font-medium rounded-xl transition-custom shadow-subtle"
            >
              Retry Connection
            </button>
          </div>
        )}

        {state === "empty" && (
          <div className="min-h-[400px] bg-surface-card border border-border-default rounded-xl flex flex-col items-center justify-center p-12 text-center shadow-subtle">
            <div className="h-10 w-10 bg-surface-hover rounded-full border border-border-default flex items-center justify-center mb-4 text-text-muted">
              <FileQuestion className="h-5 w-5" />
            </div>
            <h3 className="text-card-title font-semibold text-text-primary">
              No Telemetry Discovered
            </h3>
            <p className="text-metadata text-text-muted mt-2 max-w-sm leading-relaxed">
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
