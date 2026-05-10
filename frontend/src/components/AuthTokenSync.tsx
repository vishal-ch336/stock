import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { dataConnector } from "@/lib/dataConnector";
import { useUIStore } from "@/stores/useUIStore";

/**
 * Syncs the Clerk session token into the DataConnector instance.
 * Sets tokenReady=true after the first successful token fetch so that
 * data-fetching pages don't fire requests before the token is available.
 * Render this once inside the authenticated part of the app.
 */
export const AuthTokenSync = () => {
  const { getToken } = useAuth();
  const setTokenReady = useUIStore((s) => s.setTokenReady);

  useEffect(() => {
    let cancelled = false;

    const sync = async (isFirst = false) => {
      const token = await getToken();
      if (!cancelled) {
        dataConnector.setAuthToken(token);
        if (isFirst) setTokenReady(true);
      }
    };

    // First sync — sets tokenReady when done
    sync(true);

    // Refresh token every 55 seconds (Clerk tokens expire after ~60s)
    const interval = setInterval(() => sync(false), 55_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
      dataConnector.setAuthToken(null);
      setTokenReady(false);
    };
  }, [getToken]);

  return null;
};
