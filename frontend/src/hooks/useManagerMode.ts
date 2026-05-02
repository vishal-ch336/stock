import { useUser } from "@clerk/clerk-react";

/**
 * Returns true if the currently signed-in user has { role: "manager" }
 * set in their Clerk publicMetadata.
 *
 * To grant someone manager access:
 *  1. Open your Clerk Dashboard → Users
 *  2. Click the user → Metadata tab → Public Metadata
 *  3. Set: { "role": "manager" }
 */
export const useManagerMode = (): boolean => {
  const { user } = useUser();
  if (!user) return false;
  const meta = user.publicMetadata as Record<string, string> | undefined;
  return meta?.role === "manager";
};
