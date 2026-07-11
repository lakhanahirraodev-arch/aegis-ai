"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Compass, Shield, Users, Lock, ChevronRight } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    {
      name: "Overview Cockpit",
      path: "/dashboard",
      category: "Monitor",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Live Stream Guardian",
      path: "/dashboard/live-guardian",
      category: "Monitor",
      icon: Compass,
      isAi: true,
    },
    {
      name: "Reputation Intelligence",
      path: "/dashboard/reputation",
      category: "Monitor",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Content Protection",
      path: "/dashboard/content",
      category: "Monitor",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Identity Safeguards",
      path: "/dashboard/identity",
      category: "Monitor",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Threat Intelligence Cluster",
      path: "/dashboard/threats",
      category: "Monitor",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Autonomous AI Agents",
      path: "/dashboard/agents",
      category: "Monitor",
      icon: Shield,
      isAi: true,
    },
    {
      name: "Evidence Locker",
      path: "/dashboard/evidence",
      category: "Governance",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Triage Cases & Incidents",
      path: "/dashboard/incidents",
      category: "Governance",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Compliance & Safety Reports",
      path: "/dashboard/reports",
      category: "Governance",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Analytics Dashboard",
      path: "/dashboard/analytics",
      category: "Governance",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Audit Trail Records",
      path: "/dashboard/audit",
      category: "Governance",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Developer Integrations",
      path: "/dashboard/integrations",
      category: "Configuration",
      icon: Shield,
      isAi: false,
    },
    {
      name: "Team Operations Members",
      path: "/dashboard/team",
      category: "Configuration",
      icon: Users,
      isAi: false,
    },
    {
      name: "Workspace Configuration",
      path: "/dashboard/organization",
      category: "Configuration",
      icon: Users,
      isAi: false,
    },
    {
      name: "Billing & Plans",
      path: "/dashboard/billing",
      category: "Configuration",
      icon: Lock,
      isAi: false,
    },
    {
      name: "Settings & Safeguards",
      path: "/dashboard/settings",
      category: "Configuration",
      icon: Lock,
      isAi: false,
    },
  ];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard events inside command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length),
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          navigate(filteredItems[selectedIndex].path);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  // Scroll active item into view
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const activeElement = container.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60" onClick={onClose}></div>

      {/* Main Panel */}
      <div className="relative w-full max-w-lg bg-surface-elevated border border-border-default rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[360px] transition-custom">
        <div className="flex items-center px-4 py-3.5 border-b border-border-subtle shrink-0">
          <Search className="h-4.5 w-4.5 text-text-muted mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or route shortcut..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-text-primary placeholder-text-muted text-body focus:ring-0 focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 text-metadata font-mono bg-surface-canvas border border-border-default rounded text-text-muted uppercase select-none">
            esc
          </kbd>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredItems.length === 0 ? (
            <div className="text-center text-text-muted py-8 text-body font-sans">
              No matches found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              // Reserve violet accent exclusively for AI-related functionality
              const iconColor = item.isAi
                ? "text-ai-accent"
                : isSelected
                  ? "text-accent"
                  : "text-text-muted";

              return (
                <button
                  key={item.path}
                  data-index={idx}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-left transition-custom group ${
                    isSelected
                      ? "bg-surface-hover text-text-primary"
                      : "text-text-secondary hover:bg-surface-hover/50"
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <item.icon className={`h-4.5 w-4.5 transition-custom ${iconColor}`} />
                    <div className="flex items-center space-x-2">
                      <span className="text-body font-medium">{item.name}</span>
                      <span className="text-metadata font-mono text-text-muted uppercase px-1.5 py-0.2 bg-surface-canvas border border-border-default rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`h-4.5 w-4.5 transition-custom ${isSelected ? "text-text-secondary translate-x-0.5" : "text-text-muted opacity-0 group-hover:opacity-100"}`}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
