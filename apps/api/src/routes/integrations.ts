import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aegis/database";
import { providerRegistry, type PlatformKey } from "../modules/integrations/ProviderRegistry";

/**
 * Integration management routes.
 *
 * GET  /v1/integrations                    — list all connected accounts for workspace
 * GET  /v1/integrations/:platform/connect  — initiate OAuth flow
 * GET  /v1/integrations/:platform/callback — handle OAuth callback
 * POST /v1/integrations/:platform/disconnect
 * POST /v1/integrations/:platform/reconnect
 * GET  /v1/integrations/:platform/health   — check connection health
 */
const integrationRoutes: FastifyPluginAsync = async (fastify) => {
  const auth = [
    async (req: any, rep: any) => await fastify.authenticate(req, rep),
    async (req: any, rep: any) => await fastify.requirePermission("MANAGE_INTEGRATIONS")(req, rep),
  ];

  // ─── List connected accounts ─────────────────────────────────────────────
  fastify.get(
    "/v1/integrations",
    {
      preValidation: [
        async (req: any, rep: any) => await fastify.authenticate(req, rep),
        async (req: any, rep: any) =>
          await fastify.requirePermission("VIEW_INTEGRATIONS")(req, rep),
      ],
    },
    async (request) => {
      const workspaceId = request.actor.workspaceId;
      if (!workspaceId) {
        return { accounts: [], platforms: providerRegistry.platforms() };
      }

      const accounts = await prisma.connectedAccount.findMany({
        where: { workspaceId },
        select: {
          id: true,
          platform: true,
          displayHandle: true,
          status: true,
          scopes: true,
          lastValidatedAt: true,
          createdAt: true,
          // Never expose secretReference to API consumers
        },
        orderBy: { createdAt: "desc" },
      });

      return {
        accounts,
        availablePlatforms: providerRegistry.platforms(),
      };
    },
  );

  // ─── Initiate OAuth ───────────────────────────────────────────────────────
  fastify.get<{ Params: { platform: string } }>(
    "/v1/integrations/:platform/connect",
    { preValidation: auth },
    async (request, reply) => {
      const { platform } = request.params;
      const workspaceId = request.actor.workspaceId;

      if (!workspaceId) {
        return reply.code(400).send({ error: "Workspace context required" });
      }

      if (!providerRegistry.has(platform)) {
        return reply.code(400).send({ error: `Unknown platform: ${platform}` });
      }

      const provider = providerRegistry.get(platform as PlatformKey);
      const state = `${workspaceId}:${Date.now()}`;
      const authUrl = await provider.getAuthorizationUrl(workspaceId, state);

      return reply.redirect(authUrl);
    },
  );

  // ─── OAuth Callback ───────────────────────────────────────────────────────
  fastify.get<{ Params: { platform: string }; Querystring: Record<string, string> }>(
    "/v1/integrations/:platform/callback",
    async (request, reply) => {
      const { platform } = request.params;
      const queryParams = request.query as Record<string, string>;

      // Extract workspaceId from state param
      const state = queryParams.state ?? "";
      const workspaceId = state.split(":")[0];

      if (!workspaceId || !providerRegistry.has(platform)) {
        return reply.code(400).send({ error: "Invalid callback parameters" });
      }

      const provider = providerRegistry.get(platform as PlatformKey);

      try {
        const result = await provider.handleCallback(workspaceId, queryParams);

        // Upsert ConnectedAccount
        await prisma.connectedAccount.upsert({
          where: {
            workspaceId_platform_externalAccountId: {
              workspaceId,
              platform: platform as any,
              externalAccountId: result.externalAccountId,
            },
          },
          update: {
            displayHandle: result.displayHandle,
            secretReference: result.secretReference,
            scopes: result.scopes,
            status: "ACTIVE",
            lastValidatedAt: new Date(),
          },
          create: {
            workspaceId,
            platform: platform as any,
            externalAccountId: result.externalAccountId,
            displayHandle: result.displayHandle,
            secretReference: result.secretReference,
            scopes: result.scopes,
            status: "ACTIVE",
            lastValidatedAt: new Date(),
          },
        });

        // Redirect to dashboard with success
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        return reply.redirect(
          `${dashboardUrl}/settings/integrations?connected=${platform}&status=success`,
        );
      } catch (err: unknown) {
        fastify.log.error(err, `OAuth callback failed for ${platform}`);
        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        return reply.redirect(
          `${dashboardUrl}/settings/integrations?connected=${platform}&status=error`,
        );
      }
    },
  );

  // ─── Disconnect ───────────────────────────────────────────────────────────
  fastify.post<{ Params: { platform: string } }>(
    "/v1/integrations/:platform/disconnect",
    { preValidation: auth },
    async (request, reply) => {
      const { platform } = request.params;
      const workspaceId = request.actor.workspaceId;

      if (!workspaceId || !providerRegistry.has(platform)) {
        return reply.code(400).send({ error: "Invalid platform or missing workspace" });
      }

      const account = await prisma.connectedAccount.findFirst({
        where: {
          workspaceId,
          platform: platform as any,
        },
        select: { id: true, secretReference: true },
      });

      if (!account) {
        return reply.code(404).send({ error: "No connected account found" });
      }

      const provider = providerRegistry.get(platform as PlatformKey);
      await provider.disconnect(workspaceId, account.secretReference);

      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: { status: "REVOKED" },
      });

      return { success: true };
    },
  );

  // ─── Reconnect (re-initiate OAuth) ───────────────────────────────────────
  fastify.post<{ Params: { platform: string } }>(
    "/v1/integrations/:platform/reconnect",
    { preValidation: auth },
    async (request, reply) => {
      const { platform } = request.params;
      const workspaceId = request.actor.workspaceId;

      if (!workspaceId || !providerRegistry.has(platform)) {
        return reply.code(400).send({ error: "Invalid parameters" });
      }

      const provider = providerRegistry.get(platform as PlatformKey);
      const state = `${workspaceId}:${Date.now()}`;
      const authUrl = await provider.getAuthorizationUrl(workspaceId, state);

      return { redirectUrl: authUrl };
    },
  );

  // ─── Health Check ─────────────────────────────────────────────────────────
  fastify.get<{ Params: { platform: string } }>(
    "/v1/integrations/:platform/health",
    {
      preValidation: [
        async (req: any, rep: any) => await fastify.authenticate(req, rep),
        async (req: any, rep: any) =>
          await fastify.requirePermission("VIEW_INTEGRATIONS")(req, rep),
      ],
    },
    async (request, reply) => {
      const { platform } = request.params;
      const workspaceId = request.actor.workspaceId;

      if (!workspaceId || !providerRegistry.has(platform)) {
        return reply.code(400).send({ error: "Invalid platform" });
      }

      const account = await prisma.connectedAccount.findFirst({
        where: {
          workspaceId,
          platform: platform as any,
        },
        select: { secretReference: true },
      });

      if (!account) {
        return { status: "NOT_CONNECTED" };
      }

      const provider = providerRegistry.get(platform as PlatformKey);
      const health = await provider.healthCheck(account.secretReference);

      // Update lastValidatedAt
      await prisma.connectedAccount.updateMany({
        where: {
          workspaceId,
          platform: platform as any,
        },
        data: { lastValidatedAt: new Date() },
      });

      return health;
    },
  );
};

export default integrationRoutes;
