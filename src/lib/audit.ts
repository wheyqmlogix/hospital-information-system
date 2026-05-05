import prisma from "./prisma";

interface AuditLogParams {
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "VIEW";
  table?: string;
  recordId?: string;
  changes?: any;
  userId?: string;
  performedById?: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Records an action in the AuditLog for compliance with the Data Privacy Act.
 */
export async function createAuditLog({
  action,
  table,
  recordId,
  changes,
  userId,
  performedById,
  ipAddress,
  userAgent,
}: AuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        action,
        table,
        recordId,
        changes: changes || undefined,
        userId,
        performedById,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Critical: Failed to record audit log:", error);
    // In a production system, you might want to alert if audit logging fails
  }
}
