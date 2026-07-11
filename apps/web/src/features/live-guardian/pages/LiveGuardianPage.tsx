"use client";

import React, { useState, useEffect, useRef } from "react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";
import { Radio, Send, Cpu, Play, Pause, AlertTriangle } from "lucide-react";

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface LiveMessage {
  id: string;
  author: string;
  text: string;
  platform: "TWITCH" | "YOUTUBE" | "DISCORD" | "TIKTOK" | "KICK" | "INSTAGRAM";
  timestamp: string;
  riskScore: number;
  classifications: string[];
  recommendedAction: string;
  status: "CLASSIFIED" | "ACTIONED" | "RECEIVED" | "QUARANTINED";
  moderatorDecision?: string;
}

interface IncidentAlert {
  id: string;
  title: string;
  severity: "HIGH" | "CRITICAL";
  time: string;
  status: "OPEN" | "RESOLVED";
}

// ─── SCENARIOS ──────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    name: "Safe greeting",
    text: "Hello everyone! Stoked to be here for the stream.",
    type: "SAFE",
  },
  { name: "Safe question", text: "What microphone do you use? Sounds super clean.", type: "SAFE" },
  { name: "Repetitive Spam", text: "WUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUUT", type: "SPAM" },
  {
    name: "Ad Spam",
    text: "Visit freefollowers.net to grow your live channels now!",
    type: "SPAM",
  },
  {
    name: "Scam Phishing",
    text: "FREE CRYPO AIRDROP! Double your Ethereum at ethereum-gift.org",
    type: "SCAM",
  },
  { name: "Harassment", text: "You are an absolute idiot and a total loser.", type: "TOXICITY" },
  { name: "Hate Speech", text: "I hate you so much, go kill yourself retard.", type: "TOXICITY" },
  {
    name: "Violent Threat",
    text: "I know where you live, I will bomb your house.",
    type: "THREAT",
  },
];

export default function LiveGuardianPage() {
  // ─── STATES ───────────────────────────────────────────────────────────────

  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [incidents, setIncidents] = useState<IncidentAlert[]>([]);

  // Real-time Stats
  const [messagesCount, setMessagesCount] = useState(0);
  const [anomaliesCount, setAnomaliesCount] = useState(0);
  const [healthScore, setHealthScore] = useState(100);

  // Simulator Controls
  const [selectedPlatform, setSelectedPlatform] = useState<LiveMessage["platform"]>("TWITCH");
  const [customText, setCustomText] = useState("");
  const [autoStreamActive, setAutoStreamActive] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<
    "CONNECTED" | "DISCONNECTED" | "FALLBACK"
  >("FALLBACK");
  const [isInjecting, setIsInjecting] = useState(false);

  const autoStreamInterval = useRef<NodeJS.Timeout | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ─── MOCK HEURISTICS PIPELINE (Fallback Mode) ──────────────────────────────

  const runLocalPipeline = (text: string, platform: LiveMessage["platform"]): LiveMessage => {
    const clean = text.toLowerCase();
    let riskScore = 0;
    const classifications: string[] = [];
    let recommendedAction = "NOTIFY_MODERATOR";

    // Threat Check
    if (clean.includes("bomb") || clean.includes("kill everyone") || clean.includes("shoot")) {
      riskScore = 96.5;
      classifications.push("THREAT");
      recommendedAction = "BAN";
    }
    // Toxicity & Hate Speech
    else if (
      clean.includes("kill yourself") ||
      clean.includes("retard") ||
      clean.includes("hate you")
    ) {
      riskScore = 88.0;
      classifications.push("HATE_SPEECH");
      recommendedAction = "BAN";
    } else if (clean.includes("suck") || clean.includes("idiot") || clean.includes("loser")) {
      riskScore = 64.2;
      classifications.push("TOXICITY");
      recommendedAction = "DELETE_MESSAGE";
    }
    // Scam Links
    else if (
      clean.includes("free crypto") ||
      clean.includes("airdrop") ||
      clean.includes(".org") ||
      clean.includes("gift.org")
    ) {
      riskScore = 82.4;
      classifications.push("SCAM_LINK");
      recommendedAction = "TIMEOUT";
    }
    // Spam
    else if (/(.)\1{4,}/.test(clean) || clean.includes("visit free")) {
      riskScore = 38.5;
      classifications.push("SPAM");
      recommendedAction = "WARN";
    }
    // Safe standard noise
    else {
      riskScore = parseFloat((Math.random() * 8).toFixed(2));
      recommendedAction = "APPROVE";
    }

    return {
      id: `local_msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      author: `User_${Math.floor(Math.random() * 9000 + 1000)}`,
      text,
      platform,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      riskScore,
      classifications,
      recommendedAction,
      status: "CLASSIFIED",
    };
  };

  // ─── ACTIONS ──────────────────────────────────────────────────────────────

  const handleModeratorAction = async (messageId: string, action: string) => {
    // 1. Try to sync to backend API
    try {
      const tokenHeader = {
        "x-mock-actor-id": "mock-moderator-id",
        "x-mock-role": "MODERATOR",
      } as any;
      const res = await fetch("http://localhost:4000/v1/live/actions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...tokenHeader,
        },
        body: JSON.stringify({ messageId, actionType: action }),
      });
      if (res.ok) {
        setApiConnectionStatus("CONNECTED");
      }
    } catch {
      setApiConnectionStatus("FALLBACK");
    }

    // 2. Perform optimistic client update
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status: "ACTIONED", moderatorDecision: action } : msg,
      ),
    );

    // If banned/timed out, remove risk indicators or update counts
    const message = messages.find((m) => m.id === messageId);
    if (message && message.riskScore >= 75) {
      // Resolve associated alerts
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.title.includes(message.author) ? { ...inc, status: "RESOLVED" } : inc,
        ),
      );
    }
  };

  // ─── WEBHOOK DISPATCH SIMULATION ──────────────────────────────────────────

  const injectMessage = async (text: string, platform: LiveMessage["platform"]) => {
    setIsInjecting(true);
    let resolvedMessage: LiveMessage;

    // 1. Attempt API server simulation
    try {
      const res = await fetch("http://localhost:4000/v1/live/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, authorName: `Simulated_${platform.charAt(0)}`, text }),
      });

      if (res.ok) {
        setApiConnectionStatus("CONNECTED");
        await res.json();

        // Fetch latest messages from API
        const sessionRes = await fetch("http://localhost:4000/v1/live/sessions");
        const sessionData = await sessionRes.json();
        const activeSess = sessionData.sessions?.[0];

        if (activeSess) {
          const msgRes = await fetch(
            `http://localhost:4000/v1/live/sessions/${activeSess.id}/messages`,
          );
          const msgData = await msgRes.json();

          if (msgData.messages) {
            const mapped = msgData.messages.map((m: any) => {
              const meta = m.metadata as Record<string, any>;
              return {
                id: m.id,
                author: meta?.authorName ?? "Anonymous",
                text: meta?.text ?? "",
                platform: m.liveSession?.liveChannel?.platform ?? "TWITCH",
                timestamp: new Date(m.receivedAt).toLocaleTimeString(),
                riskScore: meta?.riskScore ?? 0,
                classifications: m.findings?.map((f: any) => f.category) ?? [],
                recommendedAction: meta?.recommendedAction ?? "APPROVE",
                status: m.status,
              };
            });
            setMessages(mapped);
          }
        }
        setIsInjecting(false);
        return;
      }
    } catch {
      setApiConnectionStatus("FALLBACK");
    }

    // 2. Client Fallback Pipeline Simulation
    resolvedMessage = runLocalPipeline(text, platform);

    setMessages((prev) => [resolvedMessage, ...prev].slice(0, 100));
    setMessagesCount((c) => c + 1);

    if (resolvedMessage.riskScore >= 45) {
      setAnomaliesCount((a) => a + 1);
    }

    // Add Incident
    if (resolvedMessage.riskScore >= 75) {
      const category = resolvedMessage.classifications[0] ?? "ABUSE";
      const newInc: IncidentAlert = {
        id: `inc_${Date.now()}`,
        title: `High Risk by ${resolvedMessage.author} [${category}]`,
        severity: resolvedMessage.riskScore >= 90 ? "CRITICAL" : "HIGH",
        time: "Just now",
        status: "OPEN",
      };
      setIncidents((prev) => [newInc, ...prev].slice(0, 20));
    }

    setIsInjecting(false);
  };

  // Recalculate health
  useEffect(() => {
    if (messages.length === 0) return;
    const sum = messages.reduce((acc, m) => acc + m.riskScore, 0);
    const avgRisk = sum / messages.length;
    setHealthScore(parseFloat(Math.max(0, 100 - avgRisk).toFixed(1)));
  }, [messages]);

  // ─── AUTO-STREAM SIMULATION ────────────────────────────────────────────────

  useEffect(() => {
    if (autoStreamActive) {
      autoStreamInterval.current = setInterval(() => {
        // Randomly pick a platform
        const p: LiveMessage["platform"] = Math.random() > 0.5 ? "TWITCH" : "YOUTUBE";
        // 70% safe, 30% bad scenarios
        const isBad = Math.random() < 0.3;
        const choices = isBad
          ? SCENARIOS.filter((s) => s.type !== "SAFE")
          : SCENARIOS.filter((s) => s.type === "SAFE");

        const scenario = choices[Math.floor(Math.random() * choices.length)];
        injectMessage(scenario.text, p);
      }, 1800);
    } else {
      if (autoStreamInterval.current) clearInterval(autoStreamInterval.current);
    }

    return () => {
      if (autoStreamInterval.current) clearInterval(autoStreamInterval.current);
    };
  }, [autoStreamActive]);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <DashboardPageWrapper
      title="Live Stream Guardian"
      description="Flagship real-time AI moderation console displaying live streams, telemetry queues, and evidence events."
      category="Monitor"
    >
      <div className="space-y-10 select-none">
        {/* Core Live Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Ingested Chat Messages"
            value={messagesCount.toString()}
            trend="Live"
            trendDirection="neutral"
            description="Active parser events captured"
          />
          <StatCard
            title="Flagged Anomalies"
            value={anomaliesCount.toString()}
            trend={anomaliesCount > 0 ? "Flagged" : "Clear"}
            trendDirection={anomaliesCount > 0 ? "up" : "neutral"}
            description="Auto-blocked spam or threats"
          />
          <StatCard
            title="Messages Per Minute"
            value={autoStreamActive ? "33.3" : "0.0"}
            trend={autoStreamActive ? "Active Ingest" : "Idle"}
            trendDirection={autoStreamActive ? "up" : "neutral"}
            description="Moving live stream rate"
          />
          <div className="bg-surface-card border border-border-subtle p-6 rounded-xl space-y-3 shadow-subtle flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-metadata font-medium text-text-muted">Community Health</span>
              <span className="inline-flex items-center text-metadata font-semibold font-mono text-status-green">
                {healthScore}%
              </span>
            </div>
            <div className="text-number font-bold text-text-primary tracking-tight">
              {healthScore >= 80 ? "Healthy" : healthScore >= 50 ? "Restricted" : "Critical"}
            </div>
            <div className="text-metadata text-text-secondary leading-normal">
              Average clean workspace metric
            </div>
          </div>
        </div>

        {/* Console Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Live Feed Column (Left/Center) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-card border border-border-default rounded-xl p-6 flex flex-col h-[560px] shadow-subtle">
              {/* Console Header */}
              <div className="flex items-center justify-between border-b border-border-default pb-4 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="h-2 w-2 rounded-full bg-status-green animate-pulse"></div>
                  <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2">
                    <Radio className="h-4 w-4 text-status-red" />
                    Live Moderation Feed
                  </h3>
                </div>

                {/* Connection Status Label */}
                <span
                  className={`px-2.5 py-0.5 rounded-md text-metadata font-mono border ${
                    apiConnectionStatus === "CONNECTED"
                      ? "bg-status-green/5 border-status-green/10 text-status-green"
                      : apiConnectionStatus === "FALLBACK"
                        ? "bg-status-amber/5 border-status-amber/10 text-status-amber"
                        : "bg-status-red/5 border-status-red/10 text-status-red"
                  }`}
                >
                  System: {apiConnectionStatus.toLowerCase()}
                </span>
              </div>

              {/* Chat messages list */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <Send className="h-8 w-8 text-text-muted mb-3" />
                    <p className="text-body font-medium text-text-secondary">
                      Waiting for live messages...
                    </p>
                    <p className="text-metadata text-text-muted max-w-xs mt-1">
                      Use the Simulator Console below to inject mock chat data and trigger the
                      moderation pipeline.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isToxic = msg.riskScore >= 45;
                    const isActioned = msg.status === "ACTIONED";

                    return (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-xl border transition-custom flex items-start justify-between gap-4 ${
                          isActioned
                            ? "bg-surface-hover/30 border-border-subtle opacity-70"
                            : isToxic
                              ? "bg-status-red-bg/30 border-status-red/15"
                              : "bg-surface-hover/20 border-border-subtle"
                        }`}
                      >
                        <div className="space-y-2 min-w-0">
                          {/* Top Meta info */}
                          <div className="flex items-center space-x-2.5 text-metadata">
                            <span className="font-mono text-text-muted">{msg.timestamp}</span>
                            <span className="text-border-default">|</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider text-white ${
                                msg.platform === "TWITCH" ? "bg-[#3B82F6]" : "bg-status-red"
                              }`}
                            >
                              {msg.platform}
                            </span>
                            <span className="text-border-default">|</span>
                            <span className="font-semibold text-text-primary">@{msg.author}</span>
                          </div>

                          {/* Message Body */}
                          <p className="text-body text-text-secondary break-words">{msg.text}</p>

                          {/* Classifications / Verdict tags */}
                          {msg.classifications.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {msg.classifications.map((cls) => (
                                <span
                                  key={cls}
                                  className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-status-red-bg text-status-red border border-status-red/10"
                                >
                                  {cls}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* AI recommended feedback */}
                          <div className="flex items-center space-x-2 text-metadata pt-1 text-text-muted">
                            <Cpu className="h-3.5 w-3.5 text-ai-accent" />
                            <span>Rec:</span>
                            <span className="font-semibold text-text-secondary font-mono">
                              {msg.recommendedAction}
                            </span>
                            <span>(Risk: {msg.riskScore}%)</span>
                          </div>
                        </div>

                        {/* Actions controls */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {isActioned ? (
                            <span className="px-2 py-1 bg-surface-hover border border-border-default rounded-md text-metadata font-semibold text-text-muted select-none">
                              {msg.moderatorDecision} applied
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleModeratorAction(msg.id, "APPROVE")}
                                className="px-2.5 py-1 text-metadata font-medium bg-surface-canvas hover:bg-surface-hover text-text-secondary border border-border-default rounded-lg transition-custom shadow-subtle"
                              >
                                Approve
                              </button>

                              <button
                                onClick={() => handleModeratorAction(msg.id, "DELETE")}
                                className="px-2.5 py-1 text-metadata font-medium bg-status-red-bg hover:bg-status-red-bg/90 text-status-red border border-status-red/15 rounded-lg transition-custom shadow-subtle"
                              >
                                Delete
                              </button>

                              <button
                                onClick={() => handleModeratorAction(msg.id, "BAN")}
                                className="px-2.5 py-1 text-metadata font-semibold bg-status-red-bg hover:bg-status-red-bg/95 text-status-red border border-status-red/20 rounded-lg transition-custom shadow-subtle"
                              >
                                Ban
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Ingestion Stream simulator (Sprint 5 Live console controller) */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-6 shadow-subtle">
              <div className="flex items-center justify-between border-b border-border-default pb-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2">
                    <Play className="h-4.5 w-4.5 text-accent" />
                    Live Webhook Ingest Simulator
                  </h3>
                  <p className="text-metadata text-text-muted">
                    Simulate real-time provider payload ingestion to trace the moderation pipeline
                  </p>
                </div>

                {/* Auto Stream Switch */}
                <button
                  onClick={() => setAutoStreamActive(!autoStreamActive)}
                  className={`px-4 py-2 rounded-xl text-metadata font-semibold flex items-center gap-2 transition-custom shadow-subtle ${
                    autoStreamActive
                      ? "bg-status-red-bg text-status-red border border-status-red/15"
                      : "bg-accent text-white hover:bg-accent-hover"
                  }`}
                >
                  {autoStreamActive ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause Stream
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Start Mock Stream (1.8s)
                    </>
                  )}
                </button>
              </div>

              {/* Scenario Preset Grid */}
              <div className="space-y-3">
                <span className="text-metadata font-semibold text-text-muted uppercase tracking-wider block">
                  Scenario presets
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {SCENARIOS.map((sc) => (
                    <button
                      key={sc.name}
                      onClick={() => injectMessage(sc.text, selectedPlatform)}
                      disabled={isInjecting}
                      className="p-3 text-left bg-surface-canvas border border-border-default rounded-xl transition-custom hover:bg-surface-hover hover:border-border-default text-metadata font-medium flex flex-col justify-between group shadow-subtle"
                    >
                      <span className="text-text-primary group-hover:text-accent font-semibold">
                        {sc.name}
                      </span>
                      <span className="text-text-muted mt-2 text-[10px] truncate max-w-full font-mono font-normal">
                        "{sc.text}"
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom payload inject form */}
              <div className="flex gap-4 pt-2">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as any)}
                  className="px-3 bg-surface-canvas border border-border-default rounded-xl text-metadata font-semibold focus:outline-none focus:border-accent text-text-secondary select-none"
                >
                  <option value="TWITCH">Twitch</option>
                  <option value="YOUTUBE">YouTube</option>
                </select>

                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a custom message to inject..."
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customText.trim()) {
                        injectMessage(customText, selectedPlatform);
                        setCustomText("");
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-surface-canvas border border-border-default rounded-xl text-body focus:outline-none focus:border-accent text-text-secondary"
                  />

                  <button
                    onClick={() => {
                      if (customText.trim()) {
                        injectMessage(customText, selectedPlatform);
                        setCustomText("");
                      }
                    }}
                    disabled={isInjecting || !customText.trim()}
                    className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-xl text-button font-medium transition-custom flex items-center gap-2 shadow-subtle"
                  >
                    <Send className="h-4 w-4" />
                    Inject
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Incidents Alerts Feed Column (Right) */}
          <div className="space-y-8">
            {/* Active Incident Alert Center */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
              <div className="flex justify-between items-center pb-2 border-b border-border-default">
                <h3 className="font-semibold text-card-title text-text-primary flex items-center gap-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-status-red" />
                  Threat Alerts Center
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-status-red-bg text-status-red border border-status-red/10">
                  {incidents.filter((i) => i.status === "OPEN").length} open
                </span>
              </div>

              {/* Incidents scroll list */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {incidents.length === 0 ? (
                  <div className="py-8 text-center text-metadata text-text-muted">
                    No threat alerts flagged in active session.
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className={`p-3.5 rounded-lg border flex items-center justify-between ${
                        inc.status === "RESOLVED"
                          ? "bg-surface-hover/20 border-border-subtle opacity-60"
                          : inc.severity === "CRITICAL"
                            ? "bg-status-red-bg/25 border-status-red/15"
                            : "bg-status-amber-bg/25 border-status-amber/15"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              inc.status === "RESOLVED"
                                ? "bg-text-disabled"
                                : inc.severity === "CRITICAL"
                                  ? "bg-status-red"
                                  : "bg-status-amber"
                            }`}
                          />
                          <span className="text-metadata font-semibold text-text-primary leading-tight">
                            {inc.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-text-muted font-mono">{inc.time}</div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          inc.status === "RESOLVED"
                            ? "bg-surface-hover text-text-muted"
                            : inc.severity === "CRITICAL"
                              ? "bg-status-red text-white"
                              : "bg-status-amber text-white"
                        }`}
                      >
                        {inc.status.toLowerCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* AI Agent Status Board */}
            <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 shadow-subtle">
              <div className="flex justify-between items-center pb-2 border-b border-border-default select-none">
                <h3 className="font-semibold text-card-title text-text-primary">
                  AI Moderation Status
                </h3>
              </div>
              <div className="space-y-3 pt-1">
                <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex items-center justify-between">
                  <span className="text-body font-medium text-text-secondary">Toxicity Engine</span>
                  <span className="text-metadata text-status-green font-mono">active</span>
                </div>
                <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex items-center justify-between">
                  <span className="text-body font-medium text-text-secondary">
                    Scam Links Classifier
                  </span>
                  <span className="text-metadata text-status-green font-mono">active</span>
                </div>
                <div className="p-3 bg-surface-canvas border border-border-default rounded-lg flex items-center justify-between">
                  <span className="text-body font-medium text-text-secondary">
                    Spam Mitigation Bot
                  </span>
                  <span className="text-metadata text-status-green font-mono">active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardPageWrapper>
  );
}
