"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Link2,
  Link2Off,
  Shield,
  Zap,
  Clock,
  Globe,
  ExternalLink,
} from "lucide-react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";
import { StatCard } from "@/shared/components/Widgets";

// ─── Platform metadata ──────────────────────────────────────────────────────

type PlatformKey = "YOUTUBE" | "TWITCH" | "DISCORD" | "TIKTOK" | "INSTAGRAM" | "KICK" | "X";

interface PlatformMeta {
  name: string;
  handle: string | null;
  description: string;
  status: "ACTIVE" | "PENDING" | "REAUTH_REQUIRED" | "REVOKED" | "NOT_CONNECTED";
  lastSync: string | null;
  scopes: string[];
  webhookEnabled: boolean;
  isFullyImplemented: boolean;
  color: string;
  iconBg: string;
}

const PLATFORM_META: Record<PlatformKey, PlatformMeta> = {
  YOUTUBE: {
    name: "YouTube",
    handle: null,
    description:
      "Connect your channel for livestream monitoring, comment ingestion, and content alerts.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: true,
    color: "#FF0000",
    iconBg: "bg-red-500/10 border-red-500/20",
  },
  TWITCH: {
    name: "Twitch",
    handle: null,
    description:
      "Enable real-time chat moderation, ban events, raid detection, and stream lifecycle.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: true,
    color: "#9146FF",
    iconBg: "bg-purple-500/10 border-purple-500/20",
  },
  DISCORD: {
    name: "Discord",
    handle: null,
    description:
      "Add the Aegis bot to your server for message monitoring, ban tracking, and community health.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: true,
    color: "#5865F2",
    iconBg: "bg-indigo-500/10 border-indigo-500/20",
  },
  TIKTOK: {
    name: "TikTok",
    handle: null,
    description: "TikTok live monitoring and comment ingestion. Coming soon.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: false,
    color: "#010101",
    iconBg: "bg-neutral-500/10 border-neutral-500/20",
  },
  INSTAGRAM: {
    name: "Instagram",
    handle: null,
    description: "Instagram live and mention tracking. Coming soon.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: false,
    color: "#E1306C",
    iconBg: "bg-pink-500/10 border-pink-500/20",
  },
  KICK: {
    name: "Kick",
    handle: null,
    description: "Kick streaming platform integration. Coming soon.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: false,
    color: "#53FC18",
    iconBg: "bg-green-500/10 border-green-500/20",
  },
  X: {
    name: "X (Twitter)",
    handle: null,
    description:
      "X mention tracking, keyword monitoring, and impersonation detection. Coming soon.",
    status: "NOT_CONNECTED",
    lastSync: null,
    scopes: [],
    webhookEnabled: false,
    isFullyImplemented: false,
    color: "#1DA1F2",
    iconBg: "bg-sky-500/10 border-sky-500/20",
  },
};

// ─── Platform Icon Components ─────────────────────────────────────────────

function PlatformIcon({ platform, size = 24 }: { platform: PlatformKey; size?: number }) {
  const icons: Record<PlatformKey, React.ReactNode> = {
    YOUTUBE: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    TWITCH: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#9146FF">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    DISCORD: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
    TIKTOK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.19a8.16 8.16 0 0 0 4.76 1.52V7.26a4.85 4.85 0 0 1-1-.57z" />
      </svg>
    ),
    INSTAGRAM: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="url(#ig-gradient)">
        <defs>
          <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F58529" />
            <stop offset="50%" stopColor="#DD2A7B" />
            <stop offset="100%" stopColor="#8134AF" />
          </linearGradient>
        </defs>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    KICK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#53FC18">
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M5 3h14v18H5V3zm7 4l-3 5 3 5h4l-3-5 3-5h-4z" />
      </svg>
    ),
    X: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  };
  return <>{icons[platform]}</>;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PlatformMeta["status"] }) {
  const configs = {
    ACTIVE: {
      label: "Connected",
      icon: CheckCircle2,
      className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    },
    PENDING: {
      label: "Pending",
      icon: Clock,
      className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    },
    REAUTH_REQUIRED: {
      label: "Reauth Required",
      icon: AlertTriangle,
      className: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    },
    REVOKED: {
      label: "Disconnected",
      icon: XCircle,
      className: "text-red-400 bg-red-400/10 border-red-400/20",
    },
    NOT_CONNECTED: {
      label: "Not Connected",
      icon: Globe,
      className: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    },
  };

  const cfg = configs[status];
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.className}`}
    >
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// ─── Platform Card ────────────────────────────────────────────────────────

interface PlatformCardProps {
  platform: PlatformKey;
  meta: PlatformMeta;
  onConnect: (platform: PlatformKey) => void;
  onDisconnect: (platform: PlatformKey) => void;
  onReconnect: (platform: PlatformKey) => void;
  loading: boolean;
}

function PlatformCard({
  platform,
  meta,
  onConnect,
  onDisconnect,
  onReconnect,
  loading,
}: PlatformCardProps) {
  const isConnected = meta.status === "ACTIVE";
  const isRevoked = meta.status === "REVOKED" || meta.status === "REAUTH_REQUIRED";
  const isStub = !meta.isFullyImplemented;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-slate-900 border rounded-xl p-5 flex flex-col gap-4 transition-colors ${
        isConnected ? "border-slate-700 shadow-lg shadow-black/20" : "border-slate-800"
      } ${isStub ? "opacity-70" : "hover:border-slate-600"}`}
    >
      {/* Coming soon badge */}
      {isStub && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
          Coming Soon
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${meta.iconBg}`}
        >
          <PlatformIcon platform={platform} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{meta.name}</h3>
            <StatusBadge status={meta.status} />
          </div>
          {meta.handle && <p className="text-xs text-slate-400 mt-0.5 truncate">@{meta.handle}</p>}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">{meta.description}</p>

      {/* Connected info */}
      {isConnected && meta.lastSync && (
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last sync {meta.lastSync}
          </span>
          {meta.webhookEnabled && (
            <span className="flex items-center gap-1 text-emerald-500">
              <Zap className="w-3 h-3" />
              Webhooks active
            </span>
          )}
        </div>
      )}

      {/* Scopes */}
      {isConnected && meta.scopes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {meta.scopes.slice(0, 3).map((scope) => (
            <span
              key={scope}
              className="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-400 rounded font-mono"
            >
              {scope.split("/").pop() ?? scope}
            </span>
          ))}
          {meta.scopes.length > 3 && (
            <span className="px-1.5 py-0.5 text-xs bg-slate-800 text-slate-500 rounded">
              +{meta.scopes.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Webhook endpoint */}
      {isConnected && (
        <div className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-500 font-mono truncate select-all">
          POST /v1/webhooks/platforms/{platform.toLowerCase()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {!isConnected && !isRevoked && (
          <button
            onClick={() => !isStub && onConnect(platform)}
            disabled={loading || isStub}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              isStub
                ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            Connect
          </button>
        )}

        {isRevoked && (
          <button
            onClick={() => onReconnect(platform)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-600/30 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reconnect
          </button>
        )}

        {isConnected && (
          <>
            <button
              onClick={() => onReconnect(platform)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all disabled:opacity-50"
              title="Refresh connection"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDisconnect(platform)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all disabled:opacity-50"
            >
              <Link2Off className="w-3.5 h-3.5" />
              Disconnect
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Webhook Security Info Panel ──────────────────────────────────────────

function WebhookSecurityPanel() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-indigo-400" />
        <h3 className="font-semibold text-white text-sm">Webhook Security</h3>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">
        All inbound webhooks are verified using platform-native signature algorithms before
        processing. Twitch uses HMAC-SHA256, Discord uses Ed25519, and YouTube uses HTTPS
        subscription verification.
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-xs text-slate-400">Twitch EventSub</span>
          <span className="text-xs text-emerald-400 font-mono">HMAC-SHA256</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-xs text-slate-400">Discord Interactions</span>
          <span className="text-xs text-emerald-400 font-mono">Ed25519</span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-slate-800">
          <span className="text-xs text-slate-400">YouTube PubSubHubbub</span>
          <span className="text-xs text-emerald-400 font-mono">HTTPS + hub.secret</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-xs text-slate-400">OAuth Tokens (at rest)</span>
          <span className="text-xs text-emerald-400 font-mono">AES-256-GCM</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [platforms, setPlatforms] = useState<Record<PlatformKey, PlatformMeta>>(() => ({
    ...PLATFORM_META,
  }));
  const [loadingPlatform, setLoadingPlatform] = useState<PlatformKey | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleConnect = useCallback(async (platform: PlatformKey) => {
    setLoadingPlatform(platform);
    try {
      // In a real app, call the API to get the OAuth URL and redirect
      // For now, simulate the connection flow
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setPlatforms((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: "ACTIVE",
          handle: `mock_${platform.toLowerCase()}_handle`,
          lastSync: "Just now",
          webhookEnabled: true,
          scopes: ["read", "write", "moderate"],
        },
      }));
      showNotification("success", `${PLATFORM_META[platform].name} connected successfully`);
    } catch {
      showNotification("error", `Failed to connect ${PLATFORM_META[platform].name}`);
    } finally {
      setLoadingPlatform(null);
    }
  }, []);

  const handleDisconnect = useCallback(async (platform: PlatformKey) => {
    setLoadingPlatform(platform);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPlatforms((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: "NOT_CONNECTED",
          handle: null,
          lastSync: null,
          webhookEnabled: false,
          scopes: [],
        },
      }));
      showNotification("success", `${PLATFORM_META[platform].name} disconnected`);
    } catch {
      showNotification("error", `Failed to disconnect ${PLATFORM_META[platform].name}`);
    } finally {
      setLoadingPlatform(null);
    }
  }, []);

  const handleReconnect = useCallback(async (platform: PlatformKey) => {
    setLoadingPlatform(platform);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPlatforms((prev) => ({
        ...prev,
        [platform]: {
          ...prev[platform],
          status: "ACTIVE",
          lastSync: "Just now",
          webhookEnabled: true,
        },
      }));
      showNotification("success", `${PLATFORM_META[platform].name} reconnected`);
    } catch {
      showNotification("error", `Failed to reconnect ${PLATFORM_META[platform].name}`);
    } finally {
      setLoadingPlatform(null);
    }
  }, []);

  const connectedCount = Object.values(platforms).filter((p) => p.status === "ACTIVE").length;
  const activeWebhooks = Object.values(platforms).filter((p) => p.webhookEnabled).length;

  return (
    <DashboardPageWrapper
      title="Platform Integrations"
      description="Connect your creator accounts to enable real-time monitoring, event ingestion, and automated moderation."
      category="Configuration"
    >
      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
              notification.type === "success"
                ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                : "bg-red-950 border-red-700 text-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Connected Platforms"
            value={String(connectedCount)}
            trend={connectedCount > 0 ? "Active" : "None"}
            trendDirection={connectedCount > 0 ? "up" : "neutral"}
            description="Live platform integrations"
          />
          <StatCard
            title="Active Webhooks"
            value={String(activeWebhooks)}
            trend={activeWebhooks > 0 ? "Receiving" : "Idle"}
            trendDirection={activeWebhooks > 0 ? "up" : "neutral"}
            description="Real-time event streams"
          />
          <StatCard
            title="Available Platforms"
            value="7"
            trend="3 Full, 4 Stub"
            trendDirection="neutral"
            description="Supported integrations"
          />
        </div>

        {/* Fully implemented platforms */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white">Live Platforms</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Full OAuth, webhooks, and event ingestion
              </p>
            </div>
            <a
              href="https://docs.aegis.ai/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Integration docs
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(["YOUTUBE", "TWITCH", "DISCORD"] as const).map((platform) => (
              <PlatformCard
                key={platform}
                platform={platform}
                meta={platforms[platform]}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onReconnect={handleReconnect}
                loading={loadingPlatform === platform}
              />
            ))}
          </div>
        </div>

        {/* Stub/coming soon platforms */}
        <div>
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Coming Soon</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Infrastructure ready — full provider implementation in a future sprint
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["TIKTOK", "INSTAGRAM", "KICK", "X"] as const).map((platform) => (
              <PlatformCard
                key={platform}
                platform={platform}
                meta={platforms[platform]}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onReconnect={handleReconnect}
                loading={loadingPlatform === platform}
              />
            ))}
          </div>
        </div>

        {/* Security info */}
        <WebhookSecurityPanel />
      </div>
    </DashboardPageWrapper>
  );
}
