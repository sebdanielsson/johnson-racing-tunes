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

const CLASS_ORDER_MAP: Record<string, number> = {
  D: 0,
  C: 1,
  B: 2,
  A: 3,
  S1: 4,
  S2: 5,
  X: 6,
  R: 7,
  P: 8,
};

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
    classOrder: CLASS_ORDER_MAP[cls] ?? 50,
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

/** Canonical performance-class ordering for the letter classes. */
const LETTER_CLASSES = ["D", "C", "B", "A", "S1", "S2", "X", "R", "P"];

export function sortedClasses(subset: Tune[]): string[] {
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
