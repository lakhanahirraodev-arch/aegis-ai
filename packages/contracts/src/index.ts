import { z } from "zod";

export const domainEventSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  occurredAt: z.string().datetime(),
  workspaceId: z.string().uuid(),
  aggregate: z.object({
    type: z.string(),
    id: z.string().uuid(),
    version: z.number().int().nonnegative(),
  }),
  correlationId: z.string().uuid().nullable(),
  payload: z.any(),
});

export type DomainEvent = z.infer<typeof domainEventSchema>;

export const errorResponseSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int(),
  detail: z.string(),
  instance: z.string().optional(),
  code: z.string(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// FUTURE-PROOF AUTHENTICATION & AUTHORIZATION SCHEMA

export type ActorType = "USER" | "AI_AGENT" | "SYSTEM" | "INTEGRATION";

export interface Actor {
  type: ActorType;
  id: string; // User ID, Agent ID, API Key ID, or System Process ID
  workspaceId?: string; // Tenant context
}

export type WorkspaceRole =
  "OWNER" | "ADMIN" | "MANAGER" | "MODERATOR" | "CREATOR" | "ANALYST" | "VIEWER";

export type Permission =
  | "VIEW_DASHBOARD"
  | "MANAGE_PROFILES"
  | "CONFIGURE_MONITORS"
  | "RUN_SCANS"
  | "VIEW_EVIDENCE"
  | "REQUEST_EVIDENCE_URL"
  | "MANAGE_RETENTION"
  | "TRIAGE_DETECTIONS"
  | "MANAGE_CASES"
  | "APPROVE_ENFORCEMENT"
  | "MANAGE_MEMBERS"
  | "MANAGE_INTEGRATIONS"
  | "VIEW_AUDIT_LOGS"
  | "DELETE_WORKSPACE";

// Capability Matrix (RBAC permissions mapping)
export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  OWNER: [
    "VIEW_DASHBOARD",
    "MANAGE_PROFILES",
    "CONFIGURE_MONITORS",
    "RUN_SCANS",
    "VIEW_EVIDENCE",
    "REQUEST_EVIDENCE_URL",
    "MANAGE_RETENTION",
    "TRIAGE_DETECTIONS",
    "MANAGE_CASES",
    "APPROVE_ENFORCEMENT",
    "MANAGE_MEMBERS",
    "MANAGE_INTEGRATIONS",
    "VIEW_AUDIT_LOGS",
    "DELETE_WORKSPACE",
  ],
  ADMIN: [
    "VIEW_DASHBOARD",
    "MANAGE_PROFILES",
    "CONFIGURE_MONITORS",
    "RUN_SCANS",
    "VIEW_EVIDENCE",
    "REQUEST_EVIDENCE_URL",
    "MANAGE_RETENTION",
    "TRIAGE_DETECTIONS",
    "MANAGE_CASES",
    "APPROVE_ENFORCEMENT",
    "MANAGE_MEMBERS",
    "MANAGE_INTEGRATIONS",
    "VIEW_AUDIT_LOGS",
  ],
  MANAGER: [
    "VIEW_DASHBOARD",
    "MANAGE_PROFILES",
    "CONFIGURE_MONITORS",
    "RUN_SCANS",
    "VIEW_EVIDENCE",
    "REQUEST_EVIDENCE_URL",
    "MANAGE_RETENTION",
    "TRIAGE_DETECTIONS",
    "MANAGE_CASES",
    "APPROVE_ENFORCEMENT",
    "MANAGE_MEMBERS",
  ],
  MODERATOR: ["VIEW_DASHBOARD", "VIEW_EVIDENCE", "TRIAGE_DETECTIONS", "MANAGE_CASES"],
  CREATOR: [
    "VIEW_DASHBOARD",
    "MANAGE_PROFILES",
    "VIEW_EVIDENCE",
    "TRIAGE_DETECTIONS",
    "MANAGE_CASES",
  ],
  ANALYST: [
    "VIEW_DASHBOARD",
    "VIEW_EVIDENCE",
    "REQUEST_EVIDENCE_URL",
    "TRIAGE_DETECTIONS",
    "MANAGE_CASES",
  ],
  VIEWER: ["VIEW_DASHBOARD", "VIEW_EVIDENCE"],
};

export function hasPermission(role: WorkspaceRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
