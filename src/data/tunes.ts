import raw from "@/data/tunes.json";

export interface Tune {
  id: string;
  game: string;
  gameCode: string;
  gameOrder: number;
  class: string;
  classOrder: number;
  car: string;
  madeFor: string;
  creators: string[];
  shareCodes: string[];
  info: string;
  videoTitle: string;
  videoUrl: string;
  isNew: boolean;
}

export const tunes = raw as Tune[];

/** Games in display order (as they appear in the source). */
export const games = [...new Set(tunes.map((t) => t.game))].sort(
  (a, b) =>
    (tunes.find((t) => t.game === a)?.gameOrder ?? 0) -
    (tunes.find((t) => t.game === b)?.gameOrder ?? 0),
);

export const gameCodeByName: Record<string, string> = Object.fromEntries(
  tunes.map((t) => [t.game, t.gameCode]),
);

/** Short label used on badges / compact UI. */
export const gameShort: Record<string, string> = {
  "Forza Horizon 6": "FH6",
  "Forza Horizon 5": "FH5",
  "Forza Horizon 4": "FH4",
  "Forza Horizon 3": "FH3",
  "Forza Motorsport 7": "FM7",
};

/** Canonical performance-class ordering for the letter classes. */
const LETTER_CLASSES = ["D", "C", "B", "A", "S1", "S2", "X", "R", "P"];

export function sortedClasses(subset: Tune[] = tunes): string[] {
  const present = [...new Set(subset.map((t) => t.class))];
  return present.sort((a, b) => {
    const ia = LETTER_CLASSES.indexOf(a);
    const ib = LETTER_CLASSES.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });
}

export function isLetterClass(c: string): boolean {
  return LETTER_CLASSES.includes(c);
}

export const allCreators = [
  ...new Set(tunes.flatMap((t) => t.creators)),
].sort((a, b) => a.localeCompare(b));

/** Primary "made for" tag, taking the first segment before a slash / dash join. */
export function primaryMadeFor(madeFor: string): string {
  if (!madeFor) return "Other";
  const first = madeFor.split(/[\n]/)[0].trim();
  return first || "Other";
}

export const stats = {
  total: tunes.length,
  games: games.length,
  creators: allCreators.length,
  videos: new Set(tunes.filter((t) => t.videoUrl).map((t) => t.videoUrl)).size,
  shareCodes: tunes.reduce((n, t) => n + t.shareCodes.length, 0),
};
