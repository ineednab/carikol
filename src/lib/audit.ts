import { prisma } from "./prisma";
import { logger } from "./logger";

export type AuditEvent =
  | "campaign.created"
  | "campaign.updated"
  | "campaign.activated"
  | "campaign.closed"
  | "decision.recorded"
  | "decision.superseded"
  | "negotiation.started"
  | "negotiation.updated"
  | "outcome_review.submitted"
  | "creator.imported"
  | "brand.created";

interface LogAuditParams {
  event: AuditEvent;
  entityType: string;
  entityId: string;
  userId?: string;
  payload?: Record<string, unknown>;
}

export async function logAudit({
  event,
  entityType,
  entityId,
  userId,
  payload,
}: LogAuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        event,
        entityType,
        entityId,
        userId: userId ?? null,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : undefined,
      },
    });
  } catch (err) {
    // Audit log failure must never block the main operation
    logger.error("Failed to write audit log", {
      event,
      entityType,
      entityId,
      error: String(err),
    });
  }
}
