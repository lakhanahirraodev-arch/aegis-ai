import { FastifyPluginAsync, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { prisma } from "@aegis/database";

declare module "fastify" {
  interface FastifyRequest {
    logAudit(params: {
      action: string;
      resourceType: string;
      resourceId?: string | null;
      outcome: "SUCCESS" | "FAILURE";
      metadata?: any;
    }): Promise<void>;
  }
}

const auditPlugin: FastifyPluginAsync = async (fastify) => {
  /**
   * Fastify request decorator that writes audit trails.
   * Records actor types and workspace contexts.
   */
  fastify.decorateRequest("logAudit", async function (this: FastifyRequest, params) {
    const workspaceId = this.actor?.workspaceId;
    if (!workspaceId) {
      return; // Requires workspace context for tenant logs
    }

    try {
      await prisma.auditLog.create({
        data: {
          workspaceId,
          actorType: this.actor.type,
          actorId: this.actor.id,
          action: params.action,
          resourceType: params.resourceType,
          resourceId: params.resourceId || null,
          outcome: params.outcome,
          correlationId: (this.headers["x-request-id"] as string) || null,
          metadata: params.metadata || {},
        },
      });
    } catch (err) {
      this.log.error(err, "Failed to write audit log database record");
    }
  });
};

export default fp(auditPlugin, { name: "audit", dependencies: ["auth"] });
