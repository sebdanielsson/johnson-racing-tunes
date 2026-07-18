import { initialTunes } from "@/data/tunes";

const STORAGE_KEY = "jrt-seen";

/**
 * Tune ids that are new since the visitor was last here. Computed once from the
 * baked dataset against the ids stored on the previous visit, then the current
 * ids are persisted so the next visit compares against now. Empty on first
 * visit (so we don't flag the entire catalogue).
 */
function computeNewSince(): Set<string> {
  const currentIds = initialTunes.map((t) => t.id);
  if (typeof window === "undefined") return new Set();
  let seen: string[] = [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) seen = JSON.parse(raw) as string[];
  } catch {
    seen = [];
  }
  const seenSet = new Set(seen);
  const fresh =
    seenSet.size === 0
      ? new Set<string>()
      : new Set(currentIds.filter((id) => !seenSet.has(id)));

  // Persist the current catalogue for next time.
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentIds));
  } catch {
    // storage unavailable — ignore
  }
  return fresh;
}

export const newSinceIds: Set<string> = computeNewSince();
export const newSinceCount = newSinceIds.size;
