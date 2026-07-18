#!/usr/bin/env python3
"""Normalize the Johnson Racing Tunes Google Sheet into src/data/tunes.json.

The source spreadsheet has one sheet per Forza game, each with a slightly
different column layout. This script downloads every sheet as CSV, detects the
header row, maps columns to a single shared shape, and writes a flat JSON array.

Usage:  python scripts/normalize.py
"""

import csv
import io
import json
import re
import urllib.request
from collections import Counter
from pathlib import Path

SHEET_ID = "1F3xqy6yodUmnuua08YU-fet4KDDoIbaoNZRiZ9U8yxk"

# game display name -> (gid, short code, display order)
SHEETS = {
    "Forza Horizon 6": ("1371665614", "FH6", 0),
    "Forza Horizon 5": ("1590093733", "FH5", 1),
    "Forza Horizon 4": ("1743877007", "FH4", 2),
    "Forza Horizon 3": ("1902579857", "FH3", 3),
    "Forza Motorsport 7": ("1673506332", "FM7", 4),
}

LETTER_CLASSES = ["D", "C", "B", "A", "S1", "S2", "X", "R", "P"]
CLASS_ORDER = {c: i for i, c in enumerate(LETTER_CLASSES)}
HEADER_CELLS = {"CLASS", "CAR CLASS", "CAR DIVISION / CLASS"}


def clean(s: str) -> str:
    return (s or "").strip()


def split_multi(s: str) -> list[str]:
    return [p.strip() for p in re.split(r"[\r\n]+", s or "") if p.strip()]


def norm_class(c: str) -> str:
    base = (
        clean(c).upper().replace("-CLASS", "").replace(" CLASS", "").replace("CLASS", "").strip()
    )
    return base if base in CLASS_ORDER else clean(c)


def find_header(rows: list[list[str]]) -> int:
    for i, r in enumerate(rows[:20]):
        cells = {clean(c).upper() for c in r}
        if (cells & HEADER_CELLS) and "CAR" in cells:
            return i
    return 0


def colmap(header: list[str]) -> dict[str, int]:
    m: dict[str, int] = {}
    for i, h in enumerate(header):
        u = clean(h).upper()
        if u in HEADER_CELLS:
            m["class"] = i
        elif u == "CAR":
            m["car"] = i
        elif u in ("MADE FOR", "USAGE / TYPE"):
            m["madeFor"] = i
        elif u == "CREATOR":
            m["creator"] = i
        elif u == "SHARE CODE":
            m["share"] = i
        elif u in ("ADDITIONAL INFO", "INFO"):
            m["info"] = i
        elif u == "USED FOR VIDEO?":
            m["videoTitle"] = i
        elif u in ("JOHNSON'S VIDEO FEATURE", "LINK"):
            m["videoUrl"] = i
        elif u == "NEW":
            m["new"] = i
    return m


def fetch_csv(gid: str) -> list[list[str]]:
    url = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={gid}"
    with urllib.request.urlopen(url) as resp:
        text = resp.read().decode("utf-8")
    return list(csv.reader(io.StringIO(text)))


def main() -> None:
    # Dictionary tables (deduplicated) referenced by index from each row.
    creators: list[str] = []
    creators_idx: dict[str, int] = {}
    videos: list[list[str]] = []
    videos_idx: dict[tuple[str, str], int] = {}

    def creator_index(name: str) -> int:
        if name not in creators_idx:
            creators_idx[name] = len(creators)
            creators.append(name)
        return creators_idx[name]

    def video_index(title: str, url: str) -> int:
        key = (title, url)
        if key not in videos_idx:
            videos_idx[key] = len(videos)
            videos.append([title, url])
        return videos_idx[key]

    # row shape src/data/tunes.ts expects:
    # [code, class, car, madeFor, creatorIdx[], shareCodes[], info, videoIdx, isNew]
    rows_out = []
    games_seen = Counter()
    for game, (gid, code, _order) in SHEETS.items():
        rows = fetch_csv(gid)
        hi = find_header(rows)
        m = colmap(rows[hi])
        cur = ""
        for r in rows[hi + 1 :]:
            if not any(clean(c) for c in r):
                continue

            def g(k: str) -> str:
                i = m.get(k)
                return clean(r[i]) if i is not None and i < len(r) else ""

            raw = g("class") or cur
            car = g("car")
            if not car or car.upper() == "CAR" or not raw:
                continue
            if g("class"):
                cur = g("class")
            vu = g("videoUrl")
            vu = vu if vu.startswith("http") else ""
            vt = g("videoTitle")
            crs = split_multi(g("creator")) or ([g("creator")] if g("creator") else [])
            rows_out.append(
                [
                    code,
                    norm_class(raw),
                    car,
                    g("madeFor"),
                    [creator_index(x) for x in crs],
                    split_multi(g("share")),
                    g("info"),
                    video_index(vt, vu) if (vt or vu) else -1,
                    1 if g("new") else 0,
                ]
            )
            games_seen[game] += 1

    dest = Path(__file__).resolve().parent.parent / "src" / "data" / "tunes.json"
    payload = {"creators": creators, "videos": videos, "rows": rows_out}
    dest.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"Wrote {len(rows_out)} tunes to {dest}")
    print("By game:", dict(games_seen))


if __name__ == "__main__":
    main()
