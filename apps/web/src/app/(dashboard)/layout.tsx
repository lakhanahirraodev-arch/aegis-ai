"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import {
  Shield,
  Compass,
  FileText,
  Activity,
  Lock,
  Users,
  Search,
  Bell,
  Sun,
  Moon,
  HelpCircle,
  FolderLock,
} from "lucide-react";
import CommandPalette from "@/shared/components/CommandPalette";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Listen for Ctrl+K command palette trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navGroups = [
    {
      title: "Monitor",
      links: [
        { name: "Overview Cockpit", href: "/dashboard", icon: Shield },
        { name: "Live Guardian", href: "/dashboard/live-guardian", icon: Compass },
        { name: "Reputation Intelligence", href: "/dashboard/reputation", icon: Shield },
        { name: "Content Protection", href: "/dashboard/content", icon: FileText },
        { name: "Identity Safeguards", href: "/dashboard/identity", icon: Shield },
        { name: "Threat Intelligence", href: "/dashboard/threats", icon: Shield },
        { name: "AI Autonomous Agents", href: "/dashboard/agents", icon: Activity },
      ],
    },
    {
      title: "Governance",
      links: [
        { name: "Evidence Center", href: "/dashboard/evidence", icon: FolderLock },
        { name: "Triaged Incidents", href: "/dashboard/incidents", icon: Shield },
        { name: "Safety Reports", href: "/dashboard/reports", icon: FileText },
        { name: "Metrics Analytics", href: "/dashboard/analytics", icon: Activity },
        { name: "System Audit Logs", href: "/dashboard/audit", icon: FileText },
      ],
    },
    {
      title: "Configuration",
      links: [
        { name: "Developer Integrations", href: "/dashboard/integrations", icon: Shield },
        { name: "Workspace Team", href: "/dashboard/team", icon: Users },
        { name: "Organization Settings", href: "/dashboard/organization", icon: Users },
        { name: "Billing & Plans", href: "/dashboard/billing", icon: Lock },
        { name: "Security Settings", href: "/dashboard/settings", icon: Lock },
        { name: "Help Desk", href: "/dashboard/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <div
      className={`flex h-screen overflow-hidden ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}
    >
      {/* Command Palette */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar */}
      <aside
        className={`w-64 border-r flex flex-col transition duration-150 ${
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 border-b flex items-center space-x-2 ${
            theme === "dark" ? "border-slate-800" : "border-slate-200"
          }`}
        >
          <Shield className="h-6 w-6 text-indigo-500 animate-pulse" />
          <span className="font-bold text-base bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text text-transparent uppercase tracking-wider">
            Aegis AI
          </span>
        </div>

        {/* Workspace Switcher */}
        <div
          className={`p-4 border-b ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}
        >
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-2 font-bold">
            Active Workspace
          </div>
          <OrganizationSwitcher
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger: `w-full border py-1.5 px-3 rounded-lg flex items-center justify-between transition text-xs font-semibold ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-200"
                    : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                }`,
                organizationPreviewTextContainer: "text-left",
              },
            }}
          />
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider pl-3 font-bold">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? theme === "dark"
                            ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20"
                            : "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : theme === "dark"
                            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                      }`}
                    >
                      <link.icon
                        className={`h-4 w-4 ${isActive ? "text-indigo-500" : "text-slate-500"}`}
                      />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`p-4 border-t text-center text-[10px] font-mono ${
            theme === "dark"
              ? "border-slate-800 bg-slate-950/20 text-slate-650"
              : "border-slate-200 bg-slate-50 text-slate-500"
          }`}
        >
          Sprint 3 Design Shell Active
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className={`h-16 border-b flex items-center justify-between px-8 ${
            theme === "dark" ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
          }`}
        >
          {/* Left panel: Search trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
              theme === "dark"
                ? "bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-500 hover:text-slate-400"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-600"
            }`}
          >
            <Search className="h-4 w-4" />
            <span className="pr-8">Search console shortcuts...</span>
            <kbd className="px-1.5 py-0.5 text-xxs font-mono bg-slate-900 border border-slate-800/80 rounded text-slate-500 uppercase font-semibold">
              Ctrl+K
            </kbd>
          </button>

          {/* Right panel: User Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme switcher */}
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className={`p-2 rounded-lg border transition ${
                theme === "dark"
                  ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-800"
              }`}
              title="Toggle styling theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Notification triggers */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen((o) => !o)}
                className={`p-2 rounded-lg border transition relative ${
                  theme === "dark"
                    ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-800"
                }`}
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500"></span>
              </button>

              {/* Mock Notification Panel Popover */}
              {notificationOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-xl border p-4 shadow-2xl z-35 space-y-3 ${
                    theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                    <span className="text-xs font-bold text-slate-200">Workspace Alerts</span>
                    <button
                      onClick={() => setNotificationOpen(false)}
                      className="text-[10px] text-indigo-400 font-semibold uppercase hover:underline"
                    >
                      Dismiss All
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto">
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-850/40 text-xxs leading-relaxed">
                      <div className="font-bold text-slate-300">Identity Guard Alert</div>
                      <p className="text-slate-500 mt-0.5">
                        Scanned lookalike account detected on X/Twitter.
                      </p>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-850/40 text-xxs leading-relaxed">
                      <div className="font-bold text-slate-300">AI Agent Scan Run Complete</div>
                      <p className="text-slate-500 mt-0.5">
                        Discovery Agent finalized 15 YouTube copyright checks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main
          className={`flex-1 overflow-y-auto p-8 transition ${
            theme === "dark" ? "bg-slate-950" : "bg-slate-100"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
