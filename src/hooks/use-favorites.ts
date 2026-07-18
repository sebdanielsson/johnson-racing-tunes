import { useSyncExternalStore } from "react";

const STORAGE_KEY = "jrt-favorites";

function read(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

let favorites = read();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites]));
  } catch {
    // storage may be unavailable — keep in-memory only
  }
}

export const favoritesStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return favorites;
  },
  toggle(id: string) {
    const next = new Set(favorites);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    favorites = next;
    persist();
    emit();
  },
  clear() {
    favorites = new Set();
    persist();
    emit();
  },
  has(id: string) {
    return favorites.has(id);
  },
};

// Keep tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      favorites = read();
      emit();
    }
  });
}

export function useFavorites() {
  return useSyncExternalStore(
    favoritesStore.subscribe,
    favoritesStore.getSnapshot,
    () => favorites,
  );
}
