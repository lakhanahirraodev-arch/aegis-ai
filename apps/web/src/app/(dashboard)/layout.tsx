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
  ChevronLeft,
  Menu,
} from "lucide-react";
import CommandPalette from "@/shared/components/CommandPalette";

// Helper placeholder constants declared before usage to avoid TDZ errors
const HelpCircle = Shield;
const FolderLock = Shield;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-surface-canvas text-text-primary font-sans antialiased">
      {/* Command Palette */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Sidebar - Width: 260px (collapsed to 64px) */}
      <aside
        className={`bg-surface-sidebar border-r border-border-subtle flex flex-col z-20 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-[260px]"
        }`}
      >
        {/* Top Logo Header */}
        <div className="h-16 px-4 border-b border-border-subtle flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center shrink-0">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-card-title text-text-primary tracking-tight select-none">
                Aegis AI
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-custom hidden md:block"
            aria-label="Toggle Sidebar"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="p-4 border-b border-border-subtle shrink-0">
          {!sidebarCollapsed ? (
            <div className="space-y-1.5">
              <div className="text-metadata text-text-muted px-1.5 font-medium select-none">
                Workspace
              </div>
              <OrganizationSwitcher
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    organizationSwitcherTrigger: `w-full border border-border-default py-1.5 px-3 rounded-md flex items-center justify-between transition-custom text-sidebar-label font-medium bg-surface-canvas hover:bg-surface-hover text-text-secondary`,
                    organizationPreviewTextContainer: "text-left",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-full bg-surface-canvas border border-border-default flex items-center justify-center text-text-secondary text-[12px] font-bold select-none">
                WS
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              {!sidebarCollapsed && (
                <div className="text-metadata text-text-muted px-3.5 select-none font-medium tracking-wide">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {group.links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`group relative flex items-center rounded-md transition-custom font-medium ${
                        sidebarCollapsed
                          ? "justify-center p-2"
                          : "space-x-3.5 px-3.5 py-2.5 text-sidebar-label"
                      } ${
                        isActive
                          ? "bg-surface-hover text-accent"
                          : "text-text-secondary hover:bg-surface-hover/60 hover:text-text-primary"
                      }`}
                      title={link.name}
                    >
                      {isActive && !sidebarCollapsed && (
                        <div className="absolute left-0 top-2.5 bottom-2.5 w-0.75 bg-accent rounded-r" />
                      )}
                      <link.icon
                        className={`h-4.5 w-4.5 shrink-0 transition-custom ${
                          isActive ? "text-accent" : "text-text-muted group-hover:text-text-primary"
                        }`}
                      />
                      {!sidebarCollapsed && <span>{link.name}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-border-subtle text-center text-metadata font-mono text-text-muted select-none">
            v0.1.0-alpha
          </div>
        )}
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border-subtle flex items-center justify-between px-8 bg-surface-canvas/90 backdrop-blur shrink-0 z-10">
          {/* Left panel: Search trigger */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded hover:bg-surface-hover text-text-muted hover:text-text-primary transition-custom md:hidden"
              aria-label="Open Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-md border border-border-default text-metadata font-medium transition-custom bg-surface-card hover:bg-surface-hover text-text-muted hover:text-text-secondary"
            >
              <Search className="h-4 w-4" />
              <span className="pr-8">Search shortcuts...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-canvas border border-border-default rounded text-text-muted uppercase select-none">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right panel: User Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification triggers */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen((o) => !o)}
                className="p-2 rounded-md border border-border-default transition-custom bg-surface-card hover:bg-surface-hover text-text-muted hover:text-text-primary relative"
              >
                <Bell className="h-4.5 w-4.5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent"></span>
              </button>

              {/* Mock Notification Panel Popover */}
              {notificationOpen && (
                <div className="absolute right-0 mt-3 w-80 rounded-xl border border-border-default p-4 shadow-xl bg-surface-elevated z-30 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                    <span className="text-metadata font-semibold text-text-primary">
                      Workspace Alerts
                    </span>
                    <button
                      onClick={() => setNotificationOpen(false)}
                      className="text-[12px] text-accent font-medium hover:underline"
                    >
                      Dismiss All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    <div className="p-3 bg-surface-card rounded-md border border-border-subtle text-metadata leading-relaxed">
                      <div className="font-semibold text-text-secondary">Identity Guard Alert</div>
                      <p className="text-text-muted mt-0.5">
                        Scanned lookalike account detected on X/Twitter.
                      </p>
                    </div>
                    <div className="p-3 bg-surface-card rounded-md border border-border-subtle text-metadata leading-relaxed">
                      <div className="font-semibold text-text-secondary">
                        AI Agent Scan Run Complete
                      </div>
                      <p className="text-text-muted mt-0.5">
                        Discovery Agent finalized 15 YouTube copyright checks.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-border-subtle" />
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto bg-surface-canvas">{children}</main>
      </div>
    </div>
  );
}
