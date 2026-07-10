import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { prisma } from "@aegis/database";

declare module "fastify" {
  interface FastifyInstance {
    requireFeature(
      featureCode: string,
    ): (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const featureFlagsPlugin: FastifyPluginAsync = async (fastify) => {
  /**
   * Fastify middleware hook that enforces billing/tier gating.
   * Resolves the workspace plan to check for paid feature support.
   */
  fastify.decorate("requireFeature", (featureCode: string) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const workspaceId = request.actor?.workspaceId;
      if (!workspaceId) {
        return; // Bypassed for non-tenant routes
      }

      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { plan: true },
      });

      if (!workspace) {
        reply.code(404).send({ error: "Not Found", message: "Workspace context invalid" });
        return;
      }

      // Gate premium features based on subscription tier
      if (featureCode === "LIVE_STREAM_GUARDIAN") {
        const premiumPlans = ["PRO", "BUSINESS", "ENTERPRISE"];
        if (!premiumPlans.includes(workspace.plan)) {
          reply.code(402).send({
            error: "Payment Required",
            message: `Feature [${featureCode}] is locked on plan tier: ${workspace.plan}. Upgrade required.`,
          });
          return;
        }
      }
    };
  });
};

export default fp(featureFlagsPlugin, { name: "featureFlags" });
