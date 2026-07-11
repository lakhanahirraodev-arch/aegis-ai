"use client";

import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Shield, Compass, Lock, Activity, Eye, FileText, Globe } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-canvas text-text-primary selection:bg-accent/20 font-sans antialiased">
      {/* Header Bar */}
      <header className="border-b border-border-subtle bg-surface-canvas/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 select-none">
            <div className="h-6 w-6 rounded-md bg-accent flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="font-semibold text-card-title text-text-primary tracking-tight">
              Aegis AI
            </span>
            <span className="px-2 py-0.5 text-metadata bg-surface-hover text-text-muted border border-border-default rounded-md">
              v0.1.0-preview
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-status-green/5 text-status-green border border-status-green/10 px-3 py-1 rounded-md text-metadata font-mono select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-status-green"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full flex flex-col justify-center space-y-12">
        {/* Main Hero Header Section */}
        <section className="text-center space-y-6 max-w-3xl mx-auto py-6">
          <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 bg-accent-tint text-accent border border-accent/10 rounded-full text-metadata font-medium select-none">
            <span>Intelligent Trust & Safety OS for Creators</span>
          </div>

          <h1 className="text-hero font-semibold text-text-primary tracking-tight leading-tight">
            Quiet, professional protection for your digital likeness and community.
          </h1>

          <p className="text-body text-text-secondary leading-relaxed max-w-2xl mx-auto">
            Aegis AI runs silently in the background, analyzing copyright threats, tracking brand
            impersonators, and auto-moderating chat streams so you can focus on building your
            audience.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-button font-medium rounded-xl transition-custom shadow-lg shadow-accent/10 w-full sm:w-auto"
              >
                Open Workspace Console
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-6 py-3 bg-surface-card border border-border-default hover:bg-surface-hover text-text-secondary text-button font-medium rounded-xl transition-custom w-full sm:w-auto text-center"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-6 py-3 bg-accent hover:bg-accent-hover text-white text-button font-medium rounded-xl transition-custom shadow-lg shadow-accent/10 w-full sm:w-auto text-center"
              >
                Create Creator Account
              </Link>
            </SignedOut>
          </div>
        </section>

        {/* Feature Grid Overhaul */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Card 1 */}
          <div className="p-6 bg-surface-card border border-border-subtle rounded-xl hover:border-border-default transition-custom group select-none flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="h-9 w-9 bg-surface-canvas rounded-lg border border-border-default text-text-muted flex items-center justify-center mb-4 transition-custom group-hover:text-accent">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-card-title font-semibold text-text-primary mb-2">
                Likeness Safeguard
              </h3>
              <p className="text-metadata text-text-secondary leading-relaxed">
                Tracks digital lookalike profiles, platform handle squatters, and impersonations
                across major platforms.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-surface-card border border-border-subtle rounded-xl hover:border-border-default transition-custom group select-none flex flex-col justify-between min-h-[180px]">
            <div>
              <div className="h-9 w-9 bg-surface-canvas rounded-lg border border-border-default text-text-muted flex items-center justify-center mb-4 transition-custom group-hover:text-accent">
                <Compass className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-card-title font-semibold text-text-primary mb-2">
                Content Defense
              </h3>
              <p className="text-metadata text-text-secondary leading-relaxed">
                Monitors voice cloning indices, deepfake media uploads, and unauthorized copyright
                distributions.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-surface-card border border-border-subtle rounded-xl hover:border-border-default transition-custom group select-none flex flex-col justify-between min-h-[180px]">
            <div>
              {/* AI Violet reserved exclusively for AI features */}
              <div className="h-9 w-9 bg-ai-surface rounded-lg border border-ai-accent/15 text-ai-accent flex items-center justify-center mb-4 transition-custom">
                <Activity className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-card-title font-semibold text-text-primary mb-2">
                Live Guardian AI
              </h3>
              <p className="text-metadata text-text-secondary leading-relaxed">
                Ingests live streams at ultra-low latency, auto-moderating raids and flagging chat
                toxicity.
              </p>
            </div>
          </div>
        </div>

        {/* Console Overview Status Card */}
        <section className="bg-surface-card border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-sidebar flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="h-2 w-2 rounded-full bg-status-blue"></span>
              <span className="text-metadata font-mono text-text-muted uppercase">
                Active System Status
              </span>
            </div>
            <span className="text-metadata font-mono text-accent font-semibold">
              Live Ingestion Pipeline
            </span>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
            <div className="bg-surface-canvas p-4 rounded-xl border border-border-default flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-metadata font-medium text-text-muted block uppercase">
                  Detections
                </span>
                <span className="text-number font-bold text-text-primary mt-1 block">0</span>
              </div>
              <div className="mt-3 flex items-center text-metadata text-text-muted space-x-2">
                <Shield className="h-4 w-4" />
                <span>Guardian Secure</span>
              </div>
            </div>

            <div className="bg-surface-canvas p-4 rounded-xl border border-border-default flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-metadata font-medium text-text-muted block uppercase">
                  Open Cases
                </span>
                <span className="text-number font-bold text-text-primary mt-1 block">0</span>
              </div>
              <div className="mt-3 flex items-center text-metadata text-text-muted space-x-2">
                <FileText className="h-4 w-4" />
                <span>No action required</span>
              </div>
            </div>

            <div className="bg-surface-canvas p-4 rounded-xl border border-border-default flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-metadata font-medium text-text-muted block uppercase">
                  Live Streams
                </span>
                <span className="text-number font-bold text-text-primary mt-1 block">0</span>
              </div>
              <div className="mt-3 flex items-center text-metadata text-text-muted space-x-2">
                <Eye className="h-4 w-4" />
                <span>Ready to ingest</span>
              </div>
            </div>

            <div className="bg-surface-canvas p-4 rounded-xl border border-border-default flex flex-col justify-between min-h-[90px]">
              <div>
                <span className="text-metadata font-medium text-text-muted block uppercase">
                  Ingest Integrations
                </span>
                <span className="text-number font-bold text-accent mt-1 block">3</span>
              </div>
              <div className="mt-3 flex items-center text-metadata text-text-muted space-x-2">
                <Globe className="h-4 w-4 text-accent" />
                <span>YouTube Twitch Discord</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-surface-sidebar py-6 mt-12 select-none">
        <div className="max-w-6xl mx-auto px-6 text-center text-text-muted text-metadata">
          Aegis AI Operating System. Built with privacy and protection first.
        </div>
      </footer>
    </div>
  );
}
