import * as React from "react";
import { registerSW } from "virtual:pwa-register";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly while the app stays open
const RESUME_CHECK_MS = 15 * 60 * 1000; // on resume, but not on every app switch
const STARTUP_MS = 30 * 1000; // a build found this soon after arriving applies at once
const AWAY_MS = 5 * 60 * 1000; // away this long → coming back counts as arriving

/**
 * Keep an installed PWA on the latest deployed build. On its own the browser
 * only re-checks the service worker on navigation (and at most daily), so an
 * installed app that is resumed rather than cold-started can sit on a weeks-old
 * build — which is what the commit in the footer reports.
 *
 * We check on start, hourly while open, on resume (throttled) and when
 * connectivity returns. Every check is best-effort: offline the installed build
 * keeps running, exactly as it does today.
 *
 * A new build only takes over on a page reload, so we apply it at a moment that
 * can't interrupt: right after startup, while the app is backgrounded, or on
 * returning after a while away. Filters and the open tune live in the URL, so a
 * reload keeps the user where they were.
 */
export function useAppUpdate() {
  React.useEffect(() => {
    const loadedAt = Date.now();
    let registration: ServiceWorkerRegistration | undefined;
    let lastCheck = loadedAt; // registering already fetches sw.js
    // When the user last arrived: page load, or coming back after a while away.
    // An installed PWA is usually resumed rather than cold-started, so both
    // count as "just opened it".
    let arrivedAt = loadedAt;
    let hiddenAt: number | null = null;
    /** Set once a new build is installed and waiting to take over. */
    let pending: (() => void) | null = null;
    let applying = false;

    const applyPending = () => {
      const apply = pending;
      pending = null;
      apply?.();
    };

    // Was a worker already in charge when this page loaded? If so, any handover
    // means a new build took over — either ours, or one applied by another open
    // tab. Either way this document is now running superseded JS whose lazily
    // imported chunks are gone from the cache, so it has to reload. The one
    // handover that isn't an update is the first-visit install claiming a page
    // that started out uncontrolled; `applying` still catches a real swap there.
    const wasControlled = navigator.serviceWorker?.controller != null;
    const onControllerChange = () => {
      if (applying || wasControlled) window.location.reload();
    };
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);

    const check = () => {
      // Offline: stay on the installed build instead of logging a failure.
      if (navigator.onLine === false || !registration) return;
      lastCheck = Date.now();
      void registration.update().catch(() => {});
    };

    // No-op in dev (the plugin only ships a service worker in builds).
    const updateSW = registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, r) {
        registration = r;
      },
      // The reload is ours to time (see below), not the plugin's.
      onNeedReload() {},
      onNeedRefresh() {
        // Fires twice for the same build (once on `installed`, once on
        // `waiting`); the first one already armed the swap.
        if (pending || applying) return;
        // Hands over to the waiting worker; the page reloads once it takes
        // control.
        pending = () => {
          applying = true;
          void updateSW();
        };
        // Nothing to interrupt just after the user arrives, or while they are
        // not looking; anything later waits for one of those moments.
        if (Date.now() - arrivedAt < STARTUP_MS || document.visibilityState === "hidden") {
          applyPending();
        }
      },
    });

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        // Nobody is looking — the cheapest possible moment to swap builds.
        applyPending();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (away > AWAY_MS) {
        arrivedAt = Date.now();
        // A build that landed while they were away takes over now, before they
        // get back into it.
        if (pending) {
          applyPending();
          return;
        }
      }
      // Arriving is always worth a check — otherwise the resume throttle, which
      // is longer than AWAY_MS, would skip the one check that matters most.
      if (away > AWAY_MS || Date.now() - lastCheck > RESUME_CHECK_MS) check();
    };

    const interval = window.setInterval(check, CHECK_INTERVAL_MS);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", onVisibility);
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);
}
