import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import jwt from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { Actor, ActorType, WorkspaceRole } from "@aegis/contracts";
import { getTenantClient, prisma } from "@aegis/database";

declare module "fastify" {
  interface FastifyRequest {
    actor: Actor;
    workspaceClient?: ReturnType<typeof getTenantClient>;
    workspaceRole?: WorkspaceRole;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const isDev = process.env.NODE_ENV === "development";

  // Cache JWKS client
  const jwks = jwksClient({
    jwksUri: "https://api.clerk.com/v1/jwks", // Standard fallback, can be configured
    cache: true,
    rateLimit: true,
  });

  function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
    if (!header.kid) {
      return callback(new Error("Missing kid in token header"));
    }
    jwks.getSigningKey(header.kid, (err, key) => {
      if (err) return callback(err);
      const signingKey = key?.getPublicKey();
      callback(null, signingKey);
    });
  }

  // Fastify auth hook to verify credentials
  fastify.decorate("authenticate", async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 1. Check for mock/testing headers in local development
      if (isDev && request.headers["x-mock-actor-id"]) {
        const actorId = request.headers["x-mock-actor-id"] as string;
        const workspaceId = request.headers["x-mock-workspace-id"] as string | undefined;
        const actorType = (request.headers["x-mock-actor-type"] as ActorType) || "USER";
        const role = (request.headers["x-mock-role"] as WorkspaceRole) || "VIEWER";

        request.actor = {
          type: actorType,
          id: actorId,
          workspaceId,
        };

        if (workspaceId) {
          request.workspaceClient = getTenantClient(workspaceId);
          request.workspaceRole = role;
        }

        request.log.debug(
          `Mock auth resolved: ActorType=${actorType}, ActorId=${actorId}, WorkspaceId=${workspaceId}, Role=${role}`,
        );
        return;
      }

      // 2. Production Clerk JWT validation
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        reply
          .code(401)
          .send({ error: "Unauthorized", message: "Missing or invalid authorization header" });
        return;
      }

      const token = authHeader.split(" ")[1];

      // Decode and verify token
      const decoded = await new Promise<any>((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decodedToken) => {
          if (err) reject(err);
          else resolve(decodedToken);
        });
      });

      // Extract fields from token payload (Clerk stores active org/workspace in standard claims)
      const actorId = decoded.sub; // Clerk User ID
      const workspaceId = (request.headers["x-workspace-id"] as string) || decoded.org_id; // Clerk Org ID

      request.actor = {
        type: "USER",
        id: actorId,
        workspaceId,
      };

      if (workspaceId) {
        request.workspaceClient = getTenantClient(workspaceId);

        // Find workspace role in DB to verify membership and fetch permission role mapping
        const membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: actorId, // Local user mapping will be synced via webhook
            },
          },
        });

        if (membership && membership.status === "ACTIVE") {
          request.workspaceRole = membership.role as WorkspaceRole;
        } else {
          // If workspace is requested but membership is missing or inactive, deny access
          reply.code(403).send({
            error: "Forbidden",
            message: "User is not an active member of this workspace",
          });
          return;
        }
      }

      request.log.debug(`Auth succeeded: ActorId=${actorId}, WorkspaceId=${workspaceId}`);
    } catch (err: any) {
      request.log.error(err, "Authentication failed");
      reply.code(401).send({ error: "Unauthorized", message: "Token verification failed" });
    }
  });
};

export default fp(authPlugin, { name: "auth" });
