import type { Tune } from "@/data/tunes";

// One entry per Forza game: [display name, sheet gid, short code].
export const SHEET_SOURCES: [string, string, string][] = [
  ["Forza Horizon 6", "1371665614", "FH6"],
  ["Forza Horizon 5", "1590093733", "FH5"],
  ["Forza Horizon 4", "1743877007", "FH4"],
  ["Forza Horizon 3", "1902579857", "FH3"],
  ["Forza Motorsport 7", "1673506332", "FM7"],
];

const SHEET_ID = "1F3xqy6yodUmnuua08YU-fet4KDDoIbaoNZRiZ9U8yxk";

// Same-origin proxy path (Vite dev server / Vercel rewrite) → docs.google.com,
// which bypasses CORS. The gviz endpoint returns CSV with a 200 (no redirect).
function sheetUrl(gid: string): string {
  return `/sheets/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

const GAME_ORDER: Record<string, number> = {
  FH6: 0,
  FH5: 1,
  FH4: 2,
  FH3: 3,
  FM7: 4,
};
const CLASS_ORDER: Record<string, number> = {
  D: 0, C: 1, B: 2, A: 3, S1: 4, S2: 5, X: 6, R: 7, P: 8,
};
const LETTER_CLASSES = ["D", "C", "B", "A", "S1", "S2", "X", "R", "P"];
const HEADER_CELLS = new Set(["CLASS", "CAR CLASS", "CAR DIVISION / CLASS"]);

const clean = (s: string | undefined) => (s ?? "").trim();
const splitMulti = (s: string) =>
  (s ?? "").split(/[\r\n]+/).map((x) => x.trim()).filter(Boolean);

function normClass(c: string): string {
  const b = clean(c)
    .toUpperCase()
    .replace("-CLASS", "")
    .replace(" CLASS", "")
    .replace("CLASS", "")
    .trim();
  return LETTER_CLASSES.includes(b) ? b : clean(c);
}

/** Minimal RFC4180 CSV parser (handles quotes, commas and embedded newlines). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function findHeader(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const cells = new Set(rows[i].map((x) => clean(x).toUpperCase()));
    if ([...HEADER_CELLS].some((h) => cells.has(h)) && cells.has("CAR")) return i;
  }
  return 0;
}

function colmap(header: string[]): Record<string, number> {
  const m: Record<string, number> = {};
  header.forEach((h, i) => {
    const u = clean(h).toUpperCase();
    if (HEADER_CELLS.has(u)) m.class = i;
    else if (u === "CAR") m.car = i;
    else if (u === "MADE FOR" || u === "USAGE / TYPE") m.madeFor = i;
    else if (u === "CREATOR") m.creator = i;
    else if (u === "SHARE CODE") m.share = i;
    else if (u === "ADDITIONAL INFO" || u === "INFO") m.info = i;
    else if (u === "USED FOR VIDEO?") m.videoTitle = i;
    else if (u === "JOHNSON'S VIDEO FEATURE" || u === "LINK") m.videoUrl = i;
    else if (u === "NEW") m.new = i;
  });
  return m;
}

/** Fetch every sheet through the proxy and parse into the shared Tune shape. */
export async function fetchAllTunes(signal?: AbortSignal): Promise<Tune[]> {
  const csvByGame = await Promise.all(
    SHEET_SOURCES.map(async ([, gid]) => {
      const res = await fetch(sheetUrl(gid), { signal });
      if (!res.ok) throw new Error(`Sheet ${gid} returned ${res.status}`);
      return parseCsv(await res.text());
    }),
  );

  const out: Tune[] = [];
  let idc = 0;
  csvByGame.forEach((rows, sheetIdx) => {
    const [game, , code] = SHEET_SOURCES[sheetIdx];
    const hi = findHeader(rows);
    const m = colmap(rows[hi]);
    let cur = "";
    for (const r of rows.slice(hi + 1)) {
      if (!r.some((c) => clean(c))) continue;
      const g = (k: string) => {
        const i = m[k];
        return i !== undefined && i < r.length ? clean(r[i]) : "";
      };
      const raw = g("class") || cur;
      const car = g("car");
      if (!car || car.toUpperCase() === "CAR" || !raw) continue;
      if (g("class")) cur = g("class");
      let vu = g("videoUrl");
      vu = vu.startsWith("http") ? vu : "";
      const creators =
        splitMulti(g("creator")).length > 0
          ? splitMulti(g("creator"))
          : g("creator")
            ? [g("creator")]
            : [];
      const cls = normClass(raw);
      idc += 1;
      out.push({
        id: `${code}-${idc}`,
        game,
        gameCode: code,
        gameOrder: GAME_ORDER[code] ?? 99,
        class: cls,
        classOrder: CLASS_ORDER[cls] ?? 50,
        car,
        madeFor: g("madeFor"),
        creators,
        shareCodes: splitMulti(g("share")),
        info: g("info"),
        videoTitle: g("videoTitle"),
        videoUrl: vu,
        isNew: !!g("new"),
      });
    }
  });
  return out;
}
