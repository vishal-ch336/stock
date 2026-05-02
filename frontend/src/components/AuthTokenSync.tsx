import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dataConnector } from "@/lib/dataConnector";

/**
 * Syncs the Clerk session token into the DataConnector instance.
 * Render this once inside the authenticated part of the app.
 */
export const AuthTokenSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    const sync = async () => {
      const token = await getToken();
      if (!cancelled) {
        dataConnector.setAuthToken(token);
      }
    };

    sync();

    // Refresh token every 55 seconds (Clerk tokens expire after ~60s)
    const interval = setInterval(sync, 55_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      dataConnector.setAuthToken(null);
    };
  }, [getToken]);

  return null;
};
