import { getSession } from "@/lib/session";
import { User, Permission, hasPermission } from "./auth";

// Server-side version - reads the HTTP-only session cookie
export async function getServerUser(): Promise<User | null> {
  const session = await getSession();
  if (!session || !session.user) return null;
  return session.user;
}

/**
 * Helper to require a permission in a server-side route.
 * Returns the user if authorized, otherwise throws an error or returns null.
 */
export async function authorize(permission: Permission): Promise<User> {
  console.log(`Authorize Helper called for: ${permission}`);
  const user = await getServerUser();
  if (!user) {
    console.warn("Authorize: No user found");
    throw new Error("Unauthorized: No user session found");
  }
  if (!hasPermission(user, permission)) {
    console.warn(`Authorize: User ${user.role} lacks permission ${permission}`);
    throw new Error(`Unauthorized: Insufficient permissions for ${permission}`);
  }
  console.log("Authorize: Success");
  return user;
}
