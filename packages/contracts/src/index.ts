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
