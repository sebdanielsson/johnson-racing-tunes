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

// tunes.json is dictionary-encoded to keep the payload small; expand it here.
// Repeated values are deduplicated into lookup tables referenced by index.
type PackedRow = [
  string, // gameCode
  string, // class
  number, // car index
  number, // madeFor index
  number[], // creator indices
  string[], // shareCodes
  string, // info
  number, // video index (-1 = none)
  number, // isNew (0/1)
];

const packed = raw as {
  creators: string[];
  videos: [string, string][]; // [title, url]
  cars: string[];
  madeFor: string[];
  rows: PackedRow[];
};

const GAME_BY_CODE: Record<string, { name: string; order: number }> = {
  FH6: { name: "Forza Horizon 6", order: 0 },
  FH5: { name: "Forza Horizon 5", order: 1 },
  FH4: { name: "Forza Horizon 4", order: 2 },
  FH3: { name: "Forza Horizon 3", order: 3 },
  FM7: { name: "Forza Motorsport 7", order: 4 },
};

/**
 * Canonical performance-class ordering, best → worst. "P" only shows up as a
 * Motorsport PI class (998 PI), but it tops the ladder wherever it appears.
 */
const LETTER_CLASSES = ["P", "X", "R", "S2", "S1", "A", "B", "C", "D"];
const LETTER_RANK: Record<string, number> = Object.fromEntries(
  LETTER_CLASSES.map((c, i) => [c, i]),
);

/**
 * Sort rank for a class name, best first. Horizon uses the letter ladder above;
 * Motorsport spells its classes out ("Hypercar / 900 PI"), so those are ranked
 * by their PI number and grouped after the letters. Unknown classes sort last.
 */
export function classRank(cls: string): number {
  const letter = LETTER_RANK[cls];
  if (letter !== undefined) return letter;
  const pi = /(\d+)\s*PI/.exec(cls);
  if (pi) return 100 + (1000 - Number(pi[1]));
  return 9999;
}

/** The dataset baked at build time — used as the instant, offline-safe seed. */
export const initialTunes: Tune[] = packed.rows.map((row, i) => {
  const [code, cls, carIdx, mfIdx, creatorIdx, shareCodes, info, vIdx, isNew] = row;
  const game = GAME_BY_CODE[code] ?? { name: code, order: 99 };
  const video = vIdx >= 0 ? packed.videos[vIdx] : undefined;
  return {
    id: `${code}-${i + 1}`,
    game: game.name,
    gameCode: code,
    gameOrder: game.order,
    class: cls,
    classOrder: classRank(cls),
    car: packed.cars[carIdx],
    madeFor: packed.madeFor[mfIdx],
    creators: creatorIdx.map((ci) => packed.creators[ci]),
    shareCodes,
    info,
    videoTitle: video?.[0] ?? "",
    videoUrl: video?.[1] ?? "",
    isNew: isNew === 1,
  };
});

/** Short label used on badges / compact UI. */
export const gameShort: Record<string, string> = {
  "Forza Horizon 6": "FH6",
  "Forza Horizon 5": "FH5",
  "Forza Horizon 4": "FH4",
  "Forza Horizon 3": "FH3",
  "Forza Motorsport 7": "FM7",
};

export function sortedClasses(subset: Tune[]): string[] {
  const present = [...new Set(subset.map((t) => t.class))];
  return present.sort((a, b) => classRank(a) - classRank(b) || a.localeCompare(b));
}

export function isLetterClass(c: string): boolean {
  return LETTER_CLASSES.includes(c);
}
