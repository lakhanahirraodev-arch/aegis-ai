import React from "react";
import Link from "next/link";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Shield, Users, Lock } from "@aegis/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
          <Shield className="h-6 w-6 text-indigo-400 animate-pulse" />
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            AEGIS AI
          </span>
        </div>

        {/* Workspace Switcher */}
        <div className="p-4 border-b border-slate-800">
          <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">
            Active Workspace
          </div>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-200 py-1.5 px-3 rounded-lg flex items-center justify-between",
                organizationPreviewTextContainer: "text-left",
              },
            }}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <Shield className="h-4 w-4 text-indigo-400" />
            <span>Dashboard Cockpit</span>
          </Link>
          <Link
            href="/dashboard/organization"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <Users className="h-4 w-4 text-cyan-400" />
            <span>Team Members</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition"
          >
            <Lock className="h-4 w-4 text-rose-400" />
            <span>Workspace Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-center text-slate-600 text-xxs font-mono">
          Sprint 2 Foundation Active
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-400">Environment:</span>
            <span className="px-2.5 py-0.5 text-xxs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-mono uppercase font-semibold">
              Development
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Workspace Sync Active</span>
            </div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">{children}</main>
      </div>
    </div>
  );
}
