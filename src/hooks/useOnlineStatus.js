import { useState, useEffect } from "react";

/**
 * WHAT: Track whether the browser reports an active network connection.
 *
 * HOW:
 * - Seed state from `navigator.onLine`.
 * - Subscribe to `window` `online` / `offline` events; cleanup on unmount.
 *
 * WHY: Show a non-blocking banner so users understand why search or favorites
 * sync might fail. Beats discovering a cryptic fetch error with no context.
 *
 * PITFALLS:
 * - `navigator.onLine === true` does *not* guarantee your API is reachable
 *   (captive portals, DNS failures). Treat this as a coarse UX signal.
 * - SSR: `navigator` is missing — guard if you ever server-render.
 *
 * @returns {boolean} `true` when the browser thinks it is online
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return online;
}
