import { PrismaClient } from "@prisma/client";

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

export const prisma = basePrisma;

/**
 * Returns a Prisma client instance that automatically enforces tenant isolation
 * by injecting workspaceId filters into all queries and database operations.
 */
export function getTenantClient(workspaceId: string) {
  return basePrisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          // Skip auto-injection for global models
          const globalModels = ["User", "Workspace"];
          if (globalModels.includes(model)) {
            return query(args);
          }

          const typedArgs = (args || {}) as any;
          const op = operation as string;

          // Enforce filter on reads/updates/deletes
          if (
            op === "findFirst" ||
            op === "findFirstOrThrow" ||
            op === "findUnique" ||
            op === "findUniqueOrThrow" ||
            op === "findMany" ||
            op === "update" ||
            op === "updateMany" ||
            op === "upsert" ||
            op === "delete" ||
            op === "deleteMany" ||
            op === "count" ||
            op === "aggregate" ||
            op === "groupBy"
          ) {
            typedArgs.where = typedArgs.where || {};
            typedArgs.where.workspaceId = workspaceId;
          }

          // Enforce parameter on writes
          if (op === "create") {
            typedArgs.data = typedArgs.data || {};
            typedArgs.data.workspaceId = workspaceId;
          } else if (op === "createMany") {
            if (Array.isArray(typedArgs.data)) {
              typedArgs.data = typedArgs.data.map((item: any) => ({
                ...item,
                workspaceId,
              }));
            } else if (typedArgs.data) {
              typedArgs.data.workspaceId = workspaceId;
            }
          } else if (op === "upsert") {
            typedArgs.create = typedArgs.create || {};
            typedArgs.create.workspaceId = workspaceId;
            typedArgs.update = typedArgs.update || {};
            typedArgs.update.workspaceId = workspaceId;
          }

          return query(typedArgs);
        },
      },
    },
  });
}

export * from "@prisma/client";
