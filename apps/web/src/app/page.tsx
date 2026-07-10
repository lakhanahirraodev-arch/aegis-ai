import React from "react";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Shield, FileText, Search, Activity, Lock, Users, Clock } from "@aegis/ui";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-600/10 rounded-lg border border-indigo-500/20 text-indigo-400">
              <Shield className="h-6 w-6 animate-pulse" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AEGIS AI
            </span>
            <span className="px-2 py-0.5 text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-medium">
              OS v1.0.0-scaffold
            </span>
          </div>
          <nav className="flex items-center space-x-4">
            <span className="text-sm text-slate-400 font-medium">System Status:</span>
            <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All Systems Operational</span>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Dashboard Preview Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <section className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Trust & Safety Operating System
            </h1>
            <p className="mt-3 text-lg text-slate-400 max-w-2xl">
              Real-time threat discovery, evidence locker preservation, and community moderation for
              creators and brands.
            </p>
          </div>
          <div className="mt-6 md:mt-0 flex space-x-3 justify-center">
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-lg hover:shadow-indigo-500/20 transition duration-150"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 rounded-lg text-sm font-semibold transition duration-150"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-lg hover:shadow-indigo-500/20 transition duration-150"
              >
                Register Workspace
              </Link>
            </SignedOut>
          </div>
        </section>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-indigo-500/30 transition duration-300 group">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Identity & Reputation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitors social networks for lookalike handles and deepfake profiles to protect your
              brand likeness.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition duration-300 group">
            <div className="h-10 w-10 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Content Protection</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Scans media hosting sites for duplicate assets, audio voice clones, and copyrighted
              video re-uploads.
            </p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-rose-500/30 transition duration-300 group">
            <div className="h-10 w-10 bg-rose-500/10 rounded-lg border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Activity className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Stream Guardian</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ingests live chat feeds at low latency to filter toxicity and protect stream
              integrity.
            </p>
          </div>
        </div>

        {/* Console Summary */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
                Active System Status
              </span>
            </div>
            <span className="text-xs font-mono text-indigo-400 font-bold">
              100% Mock Connectivity
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider mb-1">
                  Detections
                </span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400 space-x-1.5">
                <Shield className="h-3.5 w-3.5 text-slate-500" />
                <span>Scans Ready</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider mb-1">
                  Open Cases
                </span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400 space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span>No Actions Required</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider mb-1">
                  Live Channels
                </span>
                <span className="text-2xl font-bold text-white">0</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400 space-x-1.5">
                <Users className="h-3.5 w-3.5 text-slate-500" />
                <span>No Streams Active</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider mb-1">
                  Average Latency
                </span>
                <span className="text-2xl font-bold text-indigo-400">0 ms</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-400 space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Scaffold Pipeline OK</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-600 text-xs">
          Aegis AI operating system architecture scaffold. Ready for Phase 1.
        </div>
      </footer>
    </div>
  );
}
