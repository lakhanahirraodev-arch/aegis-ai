import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { Permission, WorkspaceRole, hasPermission } from "@aegis/contracts";

declare module "fastify" {
  interface FastifyInstance {
    requirePermission(
      permission: Permission,
    ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const permissionsPlugin: FastifyPluginAsync = async (fastify) => {
  /**
   * Fastify middleware hook that enforces capability checks.
   * Leverages the resolved actor type and role mappings.
   */
  fastify.decorate("requirePermission", (permission: Permission) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // 1. Verify authentication context is present
      if (!request.actor) {
        reply
          .code(401)
          .send({ error: "Unauthorized", message: "Authentication context is required" });
        return;
      }

      // 2. Enforce system actor permission bypass
      if (request.actor.type === "SYSTEM") {
        return; // Full capability for internal processes
      }

      // 3. Enforce AI Agent scoped capabilities
      if (request.actor.type === "AI_AGENT") {
        const allowedAgentPermissions: Permission[] = [
          "VIEW_DASHBOARD",
          "VIEW_EVIDENCE",
          "RUN_SCANS",
          "TRIAGE_DETECTIONS",
        ];
        if (allowedAgentPermissions.includes(permission)) {
          return;
        }
        reply.code(403).send({
          error: "Forbidden",
          message: `AI Agent actor is restricted from executing: ${permission}`,
        });
        return;
      }

      // 4. Enforce Workspace-level RBAC for User and Integration Actors
      if (!request.actor.workspaceId) {
        reply.code(400).send({
          error: "Bad Request",
          message: "Workspace header context (x-workspace-id) is required",
        });
        return;
      }

      const role = request.workspaceRole;
      if (!role) {
        reply.code(403).send({
          error: "Forbidden",
          message: "Access denied. Active workspace membership role not resolved",
        });
        return;
      }

      if (!hasPermission(role, permission)) {
        reply.code(403).send({
          error: "Forbidden",
          message: `Insufficient permissions. Workspace role [${role}] does not carry capability [${permission}]`,
        });
        return;
      }
    };
  });
};

export default fp(permissionsPlugin, { name: "permissions", dependencies: ["auth"] });
