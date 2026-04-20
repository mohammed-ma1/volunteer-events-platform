#!/usr/bin/env python3
"""
Patch image_url in backend/database/data/source_workshop_descriptions.php from a
JSON map of slug -> full public URL (exact strings from R2 / your browser).

Only slugs listed in the JSON are updated; all other workshops keep their current URL.

Usage (repo root):
  cp tools/workshop_r2_urls.example.json tools/workshop_r2_urls.json
  # Edit tools/workshop_r2_urls.json (gitignored) — one slug -> full URL per line
  python3 tools/apply_workshop_image_urls_from_json.py

  python3 tools/apply_workshop_image_urls_from_json.py /path/to/urls.json
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHP = ROOT / "backend/database/data/source_workshop_descriptions.php"
DEFAULT_JSON = ROOT / "tools/workshop_r2_urls.json"


def php_quote(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def main() -> int:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_JSON
    if not path.is_file():
        print(f"Missing {path} — copy tools/workshop_r2_urls.example.json and fill URLs.", file=sys.stderr)
        return 1
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        print("JSON root must be an object: {\"ms-w-001\": \"https://...\", ...}", file=sys.stderr)
        return 1

    overrides = {k: v for k, v in data.items() if isinstance(k, str) and isinstance(v, str) and v.strip()}
    if not overrides:
        print("No string slug -> url entries found.", file=sys.stderr)
        return 1

    lines = PHP.read_text(encoding="utf-8").splitlines(keepends=True)
    slug_re = re.compile(r"^\s*'(ms-w-\d{3})'\s*=>\s*\[\s*$")
    image_re = re.compile(r"^(\s*'image_url'\s*=>\s*)'(?:[^'\\\\]|\\\\.)*',\s*$")

    current_slug: str | None = None
    updated = 0
    applied: set[str] = set()
    out: list[str] = []

    for line in lines:
        sm = slug_re.match(line)
        if sm:
            current_slug = sm.group(1)
            out.append(line)
            continue

        im = image_re.match(line)
        if im and current_slug and current_slug in overrides:
            url = overrides[current_slug].strip()
            out.append(f"{im.group(1)}'{php_quote(url)}',\n")
            updated += 1
            applied.add(current_slug)
            continue

        out.append(line)

    not_found = sorted(set(overrides) - applied)
    for slug in not_found:
        print(f"Warning: no image_url line patched for {slug} (check slug exists in PHP)", file=sys.stderr)

    PHP.write_text("".join(out), encoding="utf-8")
    print(f"Patched {updated} image_url(s) from {path.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
