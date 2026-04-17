#!/usr/bin/env python3
"""
Import workshop descriptions, instructors, images, and category from the
external Next-Levels source project.

Reads:
  /Users/maladawe/Downloads/next-levels-source-code/src/data/index.ts
  backend/database/data/ku_student_week_workshops.php  (for slug list)

Writes:
  backend/database/data/source_workshop_descriptions.php
    -> map of slug -> [description_ar, description_en, image_url, category, instructor]
"""

from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_TS = Path("/Users/maladawe/Downloads/next-levels-source-code/src/data/index.ts")
WORKSHOPS_PHP = ROOT / "backend/database/data/ku_student_week_workshops.php"
OUT_PHP = ROOT / "backend/database/data/source_workshop_descriptions.php"


# ---- helpers ----------------------------------------------------------------


AR_DIACRITICS = "".join(chr(c) for c in range(0x0610, 0x0615 + 1)) \
    + "".join(chr(c) for c in range(0x064B, 0x0652 + 1)) \
    + "\u0670"


def normalize_ar(s: str) -> str:
    """Normalize Arabic title for fuzzy matching."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    # strip diacritics
    s = "".join(ch for ch in s if ch not in AR_DIACRITICS)
    # unify alif variants
    s = s.replace("\u0623", "\u0627").replace("\u0625", "\u0627").replace("\u0622", "\u0627")
    # unify ya variants
    s = s.replace("\u0649", "\u064A")
    # unify ta marbuta vs ha
    # (keep as-is; usually meaningful)
    # collapse whitespace + drop punctuation
    s = re.sub(r"[\s\u00A0\u200E\u200F]+", " ", s)
    s = re.sub(r"[\.,؛،:!?\(\)\[\]\-–—_\/«»\"']", "", s)
    return s.strip().lower()


def php_str(s: str) -> str:
    """Encode a string as a PHP single-quoted literal."""
    return "'" + (s or "").replace("\\", "\\\\").replace("'", "\\'") + "'"


# ---- step 1: load slugs + arabic titles from current php data ---------------


def load_slug_titles() -> list[tuple[str, str]]:
    text = WORKSHOPS_PHP.read_text(encoding="utf-8")
    # rows pattern: ['ms-w-001', 'title', 'presenter', '2026-04-26', '09:30', true|false],
    pattern = re.compile(
        r"\['(ms-w-\d{3})',\s*'([^']*)',\s*'([^']*)',\s*'(\d{4}-\d{2}-\d{2})',\s*'(\d{2}:\d{2})',\s*(true|false)\]",
    )
    return [(m.group(1), m.group(2)) for m in pattern.finditer(text)]


# ---- step 2: parse source TS file -------------------------------------------


def parse_workshops_array(text: str, var_name: str) -> list[dict]:
    """Find `const <var_name> = [ ... ]` and parse its objects."""
    start_marker = f"const {var_name} = ["
    start = text.find(start_marker)
    if start < 0:
        raise RuntimeError(f"Could not find {start_marker}")
    # find matching closing ];
    i = start + len(start_marker)
    depth = 1
    while i < len(text) and depth:
        ch = text[i]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
        i += 1
    body = text[start + len(start_marker): i - 1]

    # Each entry: { t: "...", tEn: "...", d: "...", dEn: "..." }
    # Use a tolerant regex: capture each {...} block's fields by name.
    entries: list[dict] = []
    obj_re = re.compile(r"\{\s*(.*?)\s*\}", re.DOTALL)
    field_re = re.compile(r'(\w+):\s*"((?:[^"\\]|\\.)*)"')
    for m in obj_re.finditer(body):
        fields = dict(field_re.findall(m.group(1)))
        if "t" in fields and "tEn" in fields:
            entries.append({
                "t": fields.get("t", "").replace('\\"', '"').replace("\\\\", "\\"),
                "tEn": fields.get("tEn", "").replace('\\"', '"').replace("\\\\", "\\"),
                "d": fields.get("d", "").replace('\\"', '"').replace("\\\\", "\\"),
                "dEn": fields.get("dEn", "").replace('\\"', '"').replace("\\\\", "\\"),
            })
    return entries


def parse_trainer_map(text: str) -> dict[str, str]:
    start_marker = "const workshopTrainerMap: Record<string, string> = {"
    start = text.find(start_marker)
    if start < 0:
        raise RuntimeError("Could not find workshopTrainerMap")
    i = start + len(start_marker)
    depth = 1
    while i < len(text) and depth:
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        i += 1
    body = text[start + len(start_marker): i - 1]
    pair_re = re.compile(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"')
    return {m.group(1): m.group(2) for m in pair_re.findall(body) and pair_re.finditer(body)}


def parse_trainer_map_safe(text: str) -> dict[str, str]:
    start_marker = "const workshopTrainerMap: Record<string, string> = {"
    start = text.find(start_marker)
    if start < 0:
        return {}
    i = start + len(start_marker)
    depth = 1
    while i < len(text) and depth:
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
        i += 1
    body = text[start + len(start_marker): i - 1]
    pair_re = re.compile(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"')
    out = {}
    for m in pair_re.finditer(body):
        out[m.group(1)] = m.group(2)
    return out


# ---- step 3: image router (mirror of getImageForTitle in source TS) ---------

TECH_IMAGES = [
    "https://vibe.filesafe.space/1775667546795098704/assets/930494c0-639e-4204-9b81-864dfd122a63.png",
    "https://vibe.filesafe.space/1775667546795098704/assets/9b513010-c4f6-4079-9f6b-302a2b262aec.jpg",
    "https://vibe.filesafe.space/1775667546795098704/assets/e254e55b-e8d0-4e29-8445-52ebc8871934.jpg",
]
ART_IMAGES = [
    "https://vibe.filesafe.space/1775667546795098704/assets/762bd79d-dd84-4a3b-b416-d6e490834e80.png",
    "https://vibe.filesafe.space/1775667546795098704/assets/76fd7f81-a364-4934-a0e4-6e803b86ec84.jpg",
    "https://vibe.filesafe.space/1775667546795098704/assets/bc485eb7-32c1-4023-97c0-3a762a97f744.jpg",
]
HEALTH_IMAGES = [
    "https://vibe.filesafe.space/1775667546795098704/assets/593058e3-ae1c-498a-9aed-8c0d113d213a.png",
    "https://vibe.filesafe.space/1775667546795098704/assets/4f262b3d-b79b-40c4-b2c1-eac956ce65d0.jpg",
    "https://vibe.filesafe.space/1775667546795098704/assets/483603f6-15c1-4d08-9790-d23a33c09b1c.jpg",
]
BUSINESS_IMAGES = [
    "https://vibe.filesafe.space/1775667546795098704/assets/ccbfa398-0f39-492e-8bc8-976071e63d3b.png",
    "https://vibe.filesafe.space/1775667546795098704/assets/e767d052-b53b-423e-8ceb-7c2146b27714.jpg",
    "https://vibe.filesafe.space/1775667546795098704/assets/26a955e2-c254-4e58-83d3-8572ac964a54.jpg",
]
GENERAL_IMAGES = [
    "https://vibe.filesafe.space/1775667546795098704/assets/6a807b31-075f-46ca-a962-8a17bbbd24ac.png",
    "https://vibe.filesafe.space/1775667546795098704/assets/3a577abe-c0ff-4ccf-a24c-4015a990df93.jpg",
    "https://vibe.filesafe.space/1775667546795098704/assets/4c23850e-875c-49a2-8fe0-450835b107cb.jpg",
]


def image_for_title(title: str, index: int) -> str:
    t = title.lower()
    if any(k in t for k in ("ذكاء", "ai", "بايثون", "بيانات", "سيبراني", "أتمتة", "تطبيق")):
        return TECH_IMAGES[index % len(TECH_IMAGES)]
    if any(k in t for k in ("رسم", "تصميم", "جرافيك", "تصوير", "فيديو", "فني", "ديجتال", "فنون", "لقطة", "سيناريو")):
        return ART_IMAGES[index % len(ART_IMAGES)]
    if any(k in t for k in ("توتر", "ضغط", "مشاعر", "نوم", "صمود", "عاطفي", "نفس", "صحة", "تفكير", "اكل", "تركيز")):
        return HEALTH_IMAGES[index % len(HEALTH_IMAGES)]
    if any(k in t for k in ("عمل", "وظيفة", "مقابلة", "سيرة", "قانون", "تسويق", "تخطيط", "تجاري", "أرباح", "ايميل")):
        return BUSINESS_IMAGES[index % len(BUSINESS_IMAGES)]
    return GENERAL_IMAGES[index % len(GENERAL_IMAGES)]


# ---- step 4: matching -------------------------------------------------------


def best_match(target: str, candidates: dict[str, dict]) -> dict | None:
    """Find best candidate by exact normalized match, then prefix/contains, then token overlap."""
    n = normalize_ar(target)
    if not n:
        return None
    if n in candidates:
        return candidates[n]
    # prefix or contains
    for k, v in candidates.items():
        if n.startswith(k) or k.startswith(n):
            return v
    for k, v in candidates.items():
        if n in k or k in n:
            return v
    # token-set Jaccard similarity for fuzzy matches (e.g. extra/missing words)
    target_tokens = set(t for t in n.split() if len(t) > 2)
    if not target_tokens:
        return None
    best_score = 0.0
    best = None
    for k, v in candidates.items():
        cand_tokens = set(t for t in k.split() if len(t) > 2)
        if not cand_tokens:
            continue
        inter = target_tokens & cand_tokens
        union = target_tokens | cand_tokens
        score = len(inter) / len(union) if union else 0.0
        if score > best_score:
            best_score = score
            best = v
    if best_score >= 0.6:
        return best
    return None


# ---- main ------------------------------------------------------------------


def main() -> int:
    if not SOURCE_TS.exists():
        print(f"ERROR: source TS not found at {SOURCE_TS}", file=sys.stderr)
        return 1
    if not WORKSHOPS_PHP.exists():
        print(f"ERROR: workshops PHP not found at {WORKSHOPS_PHP}", file=sys.stderr)
        return 1

    src = SOURCE_TS.read_text(encoding="utf-8")

    professional = parse_workshops_array(src, "professionalWorkshops")
    personal = parse_workshops_array(src, "personalWorkshops")
    trainer_map = parse_trainer_map_safe(src)

    print(f"professionalWorkshops: {len(professional)}")
    print(f"personalWorkshops:     {len(personal)}")
    print(f"workshopTrainerMap:    {len(trainer_map)}")

    # build candidate lookup: normalized title -> entry
    candidates: dict[str, dict] = {}

    def add_entry(entry: dict, category: str, idx: int):
        title = entry["t"]
        norm = normalize_ar(title)
        if not norm:
            return
        trainer = trainer_map.get(title, "")
        candidates[norm] = {
            "title": title,
            "title_en": entry["tEn"],
            "description_ar": entry["d"],
            "description_en": entry["dEn"],
            "category": category,
            "image_url": image_for_title(title, idx),
            "instructor": trainer,
        }

    for i, e in enumerate(professional):
        add_entry(e, "professional", i)
    for i, e in enumerate(personal):
        add_entry(e, "personal", i + 50)

    print(f"candidates indexed:    {len(candidates)}")

    # match each slug to a source entry
    slug_titles = load_slug_titles()
    print(f"slugs in workshops:    {len(slug_titles)}")

    matched: dict[str, dict] = {}
    unmatched: list[tuple[str, str]] = []
    for slug, ar_title in slug_titles:
        match = best_match(ar_title, candidates)
        if match:
            matched[slug] = match
        else:
            unmatched.append((slug, ar_title))

    print(f"matched:               {len(matched)}")
    if unmatched:
        print(f"UNMATCHED ({len(unmatched)}):")
        for slug, t in unmatched:
            print(f"  {slug} :: {t}")

    # write PHP output
    lines = [
        "<?php",
        "",
        "/**",
        " * Imported from next-levels source project — do not edit by hand.",
        " * Generated by tools/import_source_workshops.py",
        " *",
        " * Map: ms-w-### slug -> rich workshop data (description, image, category, instructor).",
        " */",
        "",
        "return [",
    ]
    for slug in sorted(matched.keys()):
        m = matched[slug]
        lines.append(f"    {php_str(slug)} => [")
        lines.append(f"        'title' => {php_str(m['title'])},")
        lines.append(f"        'title_en' => {php_str(m['title_en'])},")
        lines.append(f"        'description_ar' => {php_str(m['description_ar'])},")
        lines.append(f"        'description_en' => {php_str(m['description_en'])},")
        lines.append(f"        'category' => {php_str(m['category'])},")
        lines.append(f"        'image_url' => {php_str(m['image_url'])},")
        lines.append(f"        'instructor' => {php_str(m['instructor'])},")
        lines.append("    ],")
    lines.append("];")
    lines.append("")

    OUT_PHP.write_text("\n".join(lines), encoding="utf-8")
    print(f"wrote {OUT_PHP}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
