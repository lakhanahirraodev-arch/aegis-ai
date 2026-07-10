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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const items = [
    { name: "Overview Cockpit", path: "/dashboard", category: "Monitor", icon: Shield },
    {
      name: "Live Stream Guardian",
      path: "/dashboard/live-guardian",
      category: "Monitor",
      icon: Compass,
    },
    {
      name: "Reputation Intelligence",
      path: "/dashboard/reputation",
      category: "Monitor",
      icon: Shield,
    },
    { name: "Content Protection", path: "/dashboard/content", category: "Monitor", icon: Shield },
    { name: "Identity Safeguards", path: "/dashboard/identity", category: "Monitor", icon: Shield },
    {
      name: "Threat Intelligence Cluster",
      path: "/dashboard/threats",
      category: "Monitor",
      icon: Shield,
    },
    { name: "Autonomous AI Agents", path: "/dashboard/agents", category: "Monitor", icon: Shield },
    { name: "Evidence Locker", path: "/dashboard/evidence", category: "Governance", icon: Shield },
    {
      name: "Triage Cases & Incidents",
      path: "/dashboard/incidents",
      category: "Governance",
      icon: Shield,
    },
    {
      name: "Compliance & Safety Reports",
      path: "/dashboard/reports",
      category: "Governance",
      icon: Shield,
    },
    {
      name: "Analytics Dashboard",
      path: "/dashboard/analytics",
      category: "Governance",
      icon: Shield,
    },
    { name: "Audit Trail Records", path: "/dashboard/audit", category: "Governance", icon: Shield },
    {
      name: "Developer Integrations",
      path: "/dashboard/integrations",
      category: "Configuration",
      icon: Shield,
    },
    {
      name: "Team Operations Members",
      path: "/dashboard/team",
      category: "Configuration",
      icon: Users,
    },
    {
      name: "Workspace Configuration",
      path: "/dashboard/organization",
      category: "Configuration",
      icon: Users,
    },
    { name: "Billing & Plans", path: "/dashboard/billing", category: "Configuration", icon: Lock },
    {
      name: "Settings & Safeguards",
      path: "/dashboard/settings",
      category: "Configuration",
      icon: Lock,
    },
  ];

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="h-5 w-5 text-slate-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or route shortcut..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-slate-200 placeholder-slate-500 text-sm focus:ring-0 focus:outline-none font-sans"
          />
          <kbd className="px-1.5 py-0.5 text-xxs font-mono bg-slate-950 border border-slate-800 rounded text-slate-500 uppercase">
            esc
          </kbd>
        </div>

        <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="text-center text-slate-500 py-6 text-sm">No capabilities matched.</div>
          ) : (
            filteredItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800/80 text-left transition group"
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-sm font-medium text-slate-200">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase ml-2 px-1.5 py-0.5 bg-slate-950 border border-slate-800/55 rounded">
                      {item.category}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-300 transition" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
