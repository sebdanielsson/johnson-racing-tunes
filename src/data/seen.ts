import { initialTunes } from "@/data/tunes";

const STORAGE_KEY = "jrt-seen";

function readSeen(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    // Stored value could be anything (corrupted/hand-edited) — accept it only
    // if it's genuinely an array of strings, otherwise start fresh.
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((x): x is string => typeof x === "string"));
    }
  } catch {
    // malformed JSON or storage unavailable — ignore
  }
  return new Set();
}

// What the visitor had already seen on their previous visit. Captured once, so
// every dataset we ingest this session is compared against the same baseline.
const baseline = readSeen();

/**
 * Tune ids that are new since the visitor was last here. Starts from the baked
 * dataset and grows if a live refresh surfaces ids the visitor hasn't seen.
 * Empty on the first ever visit (so we don't flag the whole catalogue).
 */
export const newSinceIds = new Set<string>();

/**
 * Fold a dataset's ids into the "new since last visit" set and persist the
 * union of everything seen so the next visit compares against it. Safe to call
 * repeatedly (initial load + every refresh).
 */
export function ingestSeen(ids: string[]): void {
  if (baseline.size > 0) {
    for (const id of ids) if (!baseline.has(id)) newSinceIds.add(id);
  }
  if (typeof window === "undefined") return;
  try {
    const union = new Set(baseline);
    for (const id of ids) union.add(id);
    for (const id of newSinceIds) union.add(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...union]));
  } catch {
    // storage unavailable — ignore
  }
}

ingestSeen(initialTunes.map((t) => t.id));
