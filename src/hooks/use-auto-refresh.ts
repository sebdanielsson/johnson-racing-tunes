import * as React from "react";

import { dataStore, useData } from "@/data/store";

const INTERVAL_MS = 6 * 60 * 60 * 1000; // every 6 hours while the app is open
const STALE_MS = 60 * 60 * 1000; // treat data older than 1 hour as stale

/**
 * Keep the dataset fresh without user action: a background refresh on load, on
 * a periodic interval, when connectivity returns, and when the tab is refocused
 * after the data has gone stale. Every refresh is best-effort — while offline
 * (e.g. an installed PWA) the baked dataset stays in place.
 */
export function useAutoRefresh() {
  const { lastUpdated } = useData();
  const lastUpdatedRef = React.useRef(lastUpdated);
  lastUpdatedRef.current = lastUpdated;

  React.useEffect(() => {
    const refresh = () => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      void dataStore.refresh();
    };

    // Pull the latest live data on load; the baked dataset shows until it lands.
    refresh();

    const interval = window.setInterval(refresh, INTERVAL_MS);
    const onOnline = () => refresh();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const lu = lastUpdatedRef.current;
      if (lu === null || Date.now() - lu > STALE_MS) refresh();
    };

    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
}
