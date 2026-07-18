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
    out = []
    idc = 0
    for game, (gid, code, order) in SHEETS.items():
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
            cls = norm_class(raw)
            vu = g("videoUrl")
            idc += 1
            out.append(
                {
                    "id": f"{code}-{idc}",
                    "game": game,
                    "gameCode": code,
                    "gameOrder": order,
                    "class": cls,
                    "classOrder": CLASS_ORDER.get(cls, 50),
                    "car": car,
                    "madeFor": g("madeFor"),
                    "creators": split_multi(g("creator")) or ([g("creator")] if g("creator") else []),
                    "shareCodes": split_multi(g("share")),
                    "info": g("info"),
                    "videoTitle": g("videoTitle"),
                    "videoUrl": vu if vu.startswith("http") else "",
                    "isNew": bool(g("new")),
                }
            )

    dest = Path(__file__).resolve().parent.parent / "src" / "data" / "tunes.json"
    dest.write_text(json.dumps(out, indent=0, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(out)} tunes to {dest}")
    print("By game:", dict(Counter(t["game"] for t in out)))


if __name__ == "__main__":
    main()
