import { FastifyPluginAsync } from "fastify";
import { prisma } from "@aegis/database";
import { WorkspaceRole } from "@aegis/contracts";

const clerkWebhookRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * Syncs Clerk identity and organization updates in real time to PostgreSQL.
   */
  fastify.post("/webhooks/clerk", async (request, reply) => {
    const payload = request.body as any;
    const type = payload?.type;
    const data = payload?.data;

    if (!type || !data) {
      reply.code(400).send({ error: "Bad Request", message: "Invalid webhook payload format" });
      return;
    }

    try {
      if (type === "user.created") {
        await prisma.user.create({
          data: {
            clerkUserId: data.id,
            email: data.email_addresses?.[0]?.email_address || null,
            displayName: `${data.first_name || ""} ${data.last_name || ""}`.trim() || null,
          },
        });
      } else if (type === "user.deleted") {
        await prisma.user.deleteMany({
          where: { clerkUserId: data.id },
        });
      } else if (type === "organization.created") {
        await prisma.workspace.create({
          data: {
            clerkOrganizationId: data.id,
            name: data.name,
            plan: "CREATOR",
          },
        });
      } else if (type === "organization.deleted") {
        await prisma.workspace.deleteMany({
          where: { clerkOrganizationId: data.id },
        });
      } else if (
        type === "organizationMembership.created" ||
        type === "organizationMembership.updated"
      ) {
        const workspace = await prisma.workspace.findUnique({
          where: { clerkOrganizationId: data.organization.id },
        });
        const user = await prisma.user.findUnique({
          where: { clerkUserId: data.public_user_data.user_id },
        });

        if (workspace && user) {
          // Map Clerk roles to local RBAC roles
          let localRole: WorkspaceRole = "VIEWER";
          const clerkRole = data.role;
          if (clerkRole === "org:owner" || clerkRole === "owner") localRole = "OWNER";
          else if (clerkRole === "org:admin" || clerkRole === "admin") localRole = "ADMIN";
          else if (clerkRole === "org:manager" || clerkRole === "manager") localRole = "MANAGER";
          else if (clerkRole === "org:moderator" || clerkRole === "moderator")
            localRole = "MODERATOR";
          else if (clerkRole === "org:creator" || clerkRole === "creator") localRole = "CREATOR";
          else if (clerkRole === "org:analyst" || clerkRole === "analyst") localRole = "ANALYST";

          await prisma.workspaceMember.upsert({
            where: {
              workspaceId_userId: {
                workspaceId: workspace.id,
                userId: user.id,
              },
            },
            create: {
              workspaceId: workspace.id,
              userId: user.id,
              role: localRole,
              status: "ACTIVE",
            },
            update: {
              role: localRole,
              status: "ACTIVE",
            },
          });
        }
      } else if (type === "organizationMembership.deleted") {
        const workspace = await prisma.workspace.findUnique({
          where: { clerkOrganizationId: data.organization.id },
        });
        const user = await prisma.user.findUnique({
          where: { clerkUserId: data.public_user_data.user_id },
        });

        if (workspace && user) {
          await prisma.workspaceMember.deleteMany({
            where: {
              workspaceId: workspace.id,
              userId: user.id,
            },
          });
        }
      }

      return { success: true };
    } catch (err) {
      request.log.error(err, "Failed to process Clerk webhook event");
      reply
        .code(500)
        .send({ error: "Internal Server Error", message: "Failed to process webhook sync" });
    }
  });
};

export default clerkWebhookRoutes;
