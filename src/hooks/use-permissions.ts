import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { db } from "@/lib/offline/db";

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      if (status === "authenticated" && session?.user) {
        // Sync to Dexie for offline support
        await db.users.put({
          id: session.user.id,
          name: session.user.name || "",
          email: session.user.email || "",
          role: session.user.role,
          permissions: session.user.permissions,
          department: session.user.department,
          lastSynced: Date.now(),
        });
        setPermissions(session.user.permissions);
        setLoading(false);
      } else if (status === "unauthenticated") {
        // If offline, try to get permissions from Dexie
        if (typeof window !== "undefined" && !navigator.onLine) {
          const offlineUsers = await db.users.toArray();
          if (offlineUsers.length > 0) {
            // Pick the most recently synced user
            const latestUser = offlineUsers.sort((a, b) => b.lastSynced - a.lastSynced)[0];
            setPermissions(latestUser.permissions);
          }
        }
        setLoading(false);
      } else if (status === "loading") {
        setLoading(true);
      }
    };

    checkPermissions();
  }, [session, status]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes("all");
  };

  return { permissions, hasPermission, loading };
}
