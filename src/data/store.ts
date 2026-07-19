import { useSyncExternalStore } from "react";

import { initialTunes, type Tune } from "@/data/tunes";
import { computeDerived, type Derived } from "@/data/derive";
import { fetchAllTunes } from "@/data/parse";
import { ingestSeen } from "@/data/seen";

export type RefreshStatus = "idle" | "loading" | "error";

export interface DataState extends Derived {
  status: RefreshStatus;
  lastUpdated: number | null;
  error: string | null;
}

function build(
  tunes: Tune[],
  extra: Pick<DataState, "status" | "lastUpdated" | "error">,
): DataState {
  return { ...computeDerived(tunes), ...extra };
}

let state: DataState = build(initialTunes, {
  status: "idle",
  lastUpdated: null,
  error: null,
});

const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function set(next: DataState) {
  state = next;
  emit();
}

let inFlight: AbortController | null = null;

export const dataStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return state;
  },
  /** Re-fetch every sheet through the proxy and swap in the fresh dataset. */
  async refresh() {
    if (state.status === "loading") return;
    inFlight?.abort();
    const controller = new AbortController();
    inFlight = controller;
    set({ ...state, status: "loading", error: null });
    try {
      const tunes = await fetchAllTunes(controller.signal);
      if (controller.signal.aborted) return;
      if (!tunes.length) throw new Error("No tunes returned");
      // Fold any newly-surfaced ids into the "new since last visit" set.
      ingestSeen(tunes.map((t) => t.id));
      set(build(tunes, { status: "idle", lastUpdated: Date.now(), error: null }));
    } catch (err) {
      if (controller.signal.aborted) return;
      set({
        ...state,
        status: "error",
        error: err instanceof Error ? err.message : "Refresh failed",
      });
    } finally {
      if (inFlight === controller) inFlight = null;
    }
  },
};

export function useData(): DataState {
  return useSyncExternalStore(dataStore.subscribe, dataStore.getSnapshot, () => state);
}
