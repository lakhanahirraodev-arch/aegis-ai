"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Link2,
  Link2Off,
  Shield,
  Zap,
  Clock,
  ExternalLink,
} from "lucide-react";
import DashboardPageWrapper from "@/shared/components/DashboardPageWrapper";

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
    color: "#EF4444",
    iconBg: "bg-status-red-bg border-status-red/10",
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
    color: "#A855F7",
    iconBg: "bg-accent-tint border-accent/15",
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
    color: "#38BDF8",
    iconBg: "bg-status-blue-bg border-status-blue/15",
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
    color: "#B5BEC9",
    iconBg: "bg-surface-hover border-border-default",
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
    color: "#B5BEC9",
    iconBg: "bg-surface-hover border-border-default",
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
    color: "#B5BEC9",
    iconBg: "bg-surface-hover border-border-default",
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
    color: "#B5BEC9",
    iconBg: "bg-surface-hover border-border-default",
  },
};

// ─── Platform Icon Components ─────────────────────────────────────────────

function PlatformIcon({ platform, size = 18 }: { platform: PlatformKey; size?: number }) {
  const icons: Record<PlatformKey, React.ReactNode> = {
    YOUTUBE: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#EF4444">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    TWITCH: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#3B82F6">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    DISCORD: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#38BDF8">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.132 18.11a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
      </svg>
    ),
    TIKTOK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.19a8.16 8.16 0 0 0 4.76 1.52V7.26a4.85 4.85 0 0 1-1-.57z" />
      </svg>
    ),
    INSTAGRAM: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
    KICK: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
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
      className: "text-status-green bg-status-green/5 border-status-green/10",
      dotClass: "bg-status-green",
    },
    PENDING: {
      label: "Pending",
      className: "text-status-amber bg-status-amber/5 border-status-amber/10",
      dotClass: "bg-status-amber",
    },
    REAUTH_REQUIRED: {
      label: "Reauth Required",
      className: "text-status-amber bg-status-amber/5 border-status-amber/10",
      dotClass: "bg-status-amber",
    },
    REVOKED: {
      label: "Disconnected",
      className: "text-status-red bg-status-red/5 border-status-red/10",
      dotClass: "bg-status-red",
    },
    NOT_CONNECTED: {
      label: "Not Connected",
      className: "text-text-muted bg-surface-canvas border-border-default",
      dotClass: "bg-text-disabled",
    },
  };

  const cfg = configs[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-metadata font-mono border ${cfg.className}`}
    >
      {/* Simple 8px circle dot */}
      <span className={`h-2 w-2 rounded-full ${cfg.dotClass}`} />
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
    <div
      className={`relative bg-surface-card border border-border-default rounded-xl p-6 flex flex-col gap-4 transition-custom select-none shadow-subtle ${
        isConnected ? "border-accent" : "hover:border-border-default"
      } ${isStub ? "opacity-60" : ""}`}
    >
      {/* Coming soon badge */}
      {isStub && (
        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-md text-metadata font-medium bg-surface-hover text-text-muted border border-border-default">
          Coming Soon
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 bg-surface-canvas border-border-default`}
        >
          <PlatformIcon platform={platform} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-text-primary text-card-title">{meta.name}</h3>
            <StatusBadge status={meta.status} />
          </div>
          {meta.handle && (
            <p className="text-metadata text-text-muted mt-0.5 truncate">@{meta.handle}</p>
          )}
        </div>
      </div>

      {/* Description: body text (15px) */}
      <p className="text-body text-text-secondary leading-relaxed">{meta.description}</p>

      {/* Connected details */}
      {isConnected && meta.lastSync && (
        <div className="flex items-center gap-3 text-metadata text-text-muted">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-text-muted" />
            Sync: {meta.lastSync}
          </span>
          {meta.webhookEnabled && (
            <span className="flex items-center gap-1 text-status-green font-mono">
              <Zap className="w-3.5 h-3.5 text-status-green" />
              Webhooks active
            </span>
          )}
        </div>
      )}

      {/* Webhook endpoint */}
      {isConnected && (
        <div className="px-3 py-2 bg-surface-canvas border border-border-default rounded-md text-metadata text-text-muted font-mono truncate select-all">
          POST /v1/webhooks/platforms/{platform.toLowerCase()}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 mt-auto">
        {!isConnected && !isRevoked && (
          <button
            onClick={() => !isStub && onConnect(platform)}
            disabled={loading || isStub}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-button font-medium transition-custom shadow-subtle ${
              isStub
                ? "bg-surface-canvas text-text-disabled cursor-not-allowed border border-border-default"
                : "bg-accent hover:bg-accent-hover text-white disabled:opacity-50"
            }`}
          >
            <Link2 className="w-4 h-4" />
            Connect Platform
          </button>
        )}

        {isRevoked && (
          <button
            onClick={() => onReconnect(platform)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-button font-medium bg-status-amber-bg hover:bg-status-amber-bg/85 text-status-amber border border-status-amber/15 transition-custom disabled:opacity-50 shadow-subtle"
          >
            <RefreshCw className="w-4 h-4" />
            Reconnect
          </button>
        )}

        {isConnected && (
          <>
            <button
              onClick={() => onReconnect(platform)}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-button font-medium bg-surface-hover hover:bg-surface-hover/80 text-text-secondary border border-border-default transition-custom disabled:opacity-50 shadow-subtle"
              title="Refresh connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDisconnect(platform)}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-button font-medium bg-status-red-bg hover:bg-status-red-bg/85 text-status-red border border-status-red/15 transition-custom disabled:opacity-50 shadow-subtle"
            >
              <Link2Off className="w-4 h-4" />
              Disconnect
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Webhook Security Info Panel ──────────────────────────────────────────

function WebhookSecurityPanel() {
  return (
    <div className="bg-surface-card border border-border-default rounded-xl p-6 space-y-4 select-none shadow-subtle">
      <div className="flex items-center gap-2.5 mb-1">
        <Shield className="w-4.5 h-4.5 text-accent" />
        <h3 className="font-semibold text-text-primary text-card-title">
          Webhook Verification Policy
        </h3>
      </div>
      <p className="text-body text-text-secondary leading-relaxed">
        All inbound webhooks are verified using cryptographic signature verification algorithms
        before payload normalization and dispatch. Twitch uses HMAC-SHA256, Discord uses Ed25519,
        and YouTube uses HTTPS challenge verification.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="p-4 bg-surface-canvas border border-border-default rounded-xl shadow-subtle">
          <div className="text-metadata text-text-muted font-mono uppercase">Twitch</div>
          <div className="text-body font-semibold text-text-secondary mt-1">HMAC-SHA256</div>
        </div>
        <div className="p-4 bg-surface-canvas border border-border-default rounded-xl shadow-subtle">
          <div className="text-metadata text-text-muted font-mono uppercase">Discord</div>
          <div className="text-body font-semibold text-text-secondary mt-1">Ed25519</div>
        </div>
        <div className="p-4 bg-surface-canvas border border-border-default rounded-xl shadow-subtle">
          <div className="text-metadata text-text-muted font-mono uppercase">YouTube</div>
          <div className="text-body font-semibold text-text-secondary mt-1">hub.secret</div>
        </div>
        <div className="p-4 bg-surface-canvas border border-border-default rounded-xl shadow-subtle">
          <div className="text-metadata text-text-muted font-mono uppercase">Vault Store</div>
          <div className="text-body font-semibold text-text-secondary mt-1">AES-256-GCM</div>
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
            className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl text-metadata font-medium border ${
              notification.type === "success"
                ? "bg-status-green-bg border-status-green/10 text-status-green"
                : "bg-status-red-bg border-status-red/10 text-status-red"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4.5 h-4.5" />
            ) : (
              <XCircle className="w-4.5 h-4.5" />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {/* Fully implemented platforms */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-section font-semibold text-text-primary select-none">
                Ingest Channels
              </h2>
              <p className="text-metadata text-text-muted mt-0.5 select-none">
                Full OAuth handshake, automated webhooks, and raw event dispatch
              </p>
            </div>
            <a
              href="https://docs.aegis.ai/integrations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-metadata text-accent hover:underline transition-colors font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Integration Docs
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="space-y-6">
          <div>
            <h2 className="text-section font-semibold text-text-primary select-none font-sans">
              Upcoming Ingests
            </h2>
            <p className="text-metadata text-text-muted mt-0.5 select-none font-sans">
              Interface and database contracts compiled — platform integration launching in
              subsequent release cycles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
