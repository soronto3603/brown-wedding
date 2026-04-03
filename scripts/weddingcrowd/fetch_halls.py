#!/usr/bin/env python3
"""
웨딩크라우드(weddingcrowd.kr) 웨딩홀 목록·상세 수집 (레거시 HTML 크롤링)
================================================================
공개 JSON이 필요하면 `scripts/weddic/fetch_halls.py`(weddic.com/api) 사용.

의존성: Python 3.10+ 표준 라이브러리만 (pip 불필요)

실행 (프로젝트 루트에서):
    python3 scripts/weddingcrowd/fetch_halls.py           # 최대 25페이지
    python3 scripts/weddingcrowd/fetch_halls.py 5         # 5페이지만
    python3 scripts/weddingcrowd/fetch_halls.py 3 --detail  # 상세 포함 (느림)

결과: data/weddingcrowd/wedding_halls.csv (+ --detail 시 wedding_halls_detail.csv)
"""

from __future__ import annotations

import csv
import random
import re
import sys
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

# 프로젝트 루트 (…/brown-wedding)
ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "weddingcrowd"
DATA_DIR.mkdir(parents=True, exist_ok=True)

# ── 설정 ──────────────────────────────────────────────────
BASE_URL = "https://weddingcrowd.kr"
LIST_URL = BASE_URL + "/hall/list.php?page={page}"
DETAIL_URL = BASE_URL + "/hall/view.php?idx={idx}"
OUTPUT_LIST = DATA_DIR / "wedding_halls.csv"
OUTPUT_DETAIL = DATA_DIR / "wedding_halls_detail.csv"
DELAY_MIN = 1.2
DELAY_MAX = 2.5
MAX_PAGES = 25

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Referer": "https://weddingcrowd.kr/hall/",
    "Connection": "keep-alive",
}


def parse_hall_list(html: str) -> list[dict]:
    """목록 HTML에서 `div.itembx` 블록만 추출 (상단 GNB <li>와 구분)."""
    halls: list[dict] = []
    for chunk in html.split('class="itembx"')[1:]:
        m = re.match(
            r'\s*onClick="location\.href=\'\./view\.php\?idx=(\d+)\';"',
            chunk,
        )
        if not m:
            continue
        idx = m.group(1)
        img = re.search(r'<img\s+src="([^"]+)"', chunk)
        thumb = img.group(1) if img else ""
        loc = re.search(r'<p class="location">([^<]*)</p>', chunk)
        region = (loc.group(1) or "").strip()
        title = re.search(r'<div class="title">([^<]+)</div>', chunk)
        name = (title.group(1) or "").strip() if title else ""
        tag_block = re.search(r'<p class="hash-tags">(.*?)</p>', chunk, re.DOTALL)
        raw = (tag_block.group(1) if tag_block else "").replace("&nbsp;", " ")
        raw = re.sub(r"\s+", " ", raw)
        tags = [t for t in re.findall(r"#([^#\s<]+)", raw) if t]
        url = f"{BASE_URL}/hall/view.php?idx={idx}"
        if name and idx:
            halls.append(
                {
                    "name": name,
                    "region": region,
                    "tags": tags,
                    "thumb": thumb,
                    "url": url,
                    "idx": idx,
                }
            )
    return halls


class DetailParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.data = {
            "phone": "",
            "address": "",
            "hall_type": "",
            "capacity": "",
            "food_type": "",
            "subway": "",
        }
        self._prev_text = ""

    def handle_data(self, data):
        data = data.strip()
        if not data:
            return

        if re.match(r"^\d{2,4}-\d{3,4}-\d{4}$", data) or re.match(
            r"^\d{4}-\d{4}$", data
        ):
            if not self.data["phone"]:
                self.data["phone"] = data

        m = re.search(r"(\d+)\s*~?\s*(\d+)?\s*명", data)
        if m and ("보증" in self._prev_text or "인원" in self._prev_text):
            self.data["capacity"] = data

        for kw in [
            "일반웨딩홀",
            "호텔웨딩홀",
            "컨벤션",
            "하우스",
            "채플",
            "스몰웨딩",
            "야외예식",
        ]:
            if kw in data and not self.data["hall_type"]:
                self.data["hall_type"] = kw

        for kw in ["뷔페", "한식코스", "양식코스", "한정식", "코스요리"]:
            if kw in data and not self.data["food_type"]:
                self.data["food_type"] = kw

        self._prev_text = data


def fetch_html(url: str, retries: int = 3) -> str | None:
    for attempt in range(retries):
        try:
            req = Request(url, headers=HEADERS)
            resp = urlopen(req, timeout=15)
            return resp.read().decode("utf-8", errors="ignore")
        except HTTPError as e:
            print(f"    HTTP {e.code} — {url}")
            return None
        except URLError as e:
            print(f"    URLError (시도 {attempt + 1}): {e.reason}")
            if attempt < retries - 1:
                time.sleep(2**attempt)
    return None


def collect_list(max_pages: int = MAX_PAGES) -> list[dict]:
    all_halls: list[dict] = []
    seen: set[str] = set()

    for page in range(1, max_pages + 1):
        url = LIST_URL.format(page=page)
        print(f"[{page:02d}/{max_pages}] {url}", end="  →  ", flush=True)

        html = fetch_html(url)
        if not html:
            print("SKIP")
            continue

        page_halls = parse_hall_list(html)

        new = 0
        for h in page_halls:
            key = h.get("idx") or h.get("url")
            if key and key not in seen:
                seen.add(key)
                all_halls.append(h)
                new += 1

        print(f"+{new}개  (누적 {len(all_halls)}개)")

        if new == 0 and page > 3:
            print("  → 신규 없음, 수집 종료")
            break

        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    return all_halls


def enrich_detail(halls: list[dict]) -> list[dict]:
    print(f"\n상세 정보 수집 시작 ({len(halls)}개)...")
    for i, h in enumerate(halls, 1):
        if not h.get("idx"):
            continue
        url = DETAIL_URL.format(idx=h["idx"])
        print(f"  [{i:03d}/{len(halls)}] {h['name']}", end="  ", flush=True)

        html = fetch_html(url)
        if html:
            parser = DetailParser()
            parser.feed(html)
            h.update(parser.data)
            print("✓")
        else:
            print("SKIP")

        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    return halls


def save_list_csv(halls: list[dict], path: Path):
    fields = ["name", "region", "tags", "thumb", "url", "idx"]
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for h in halls:
            row = dict(h)
            row["tags"] = "|".join(h.get("tags", []))
            w.writerow(row)
    print(f"✅ 저장: {path}  ({len(halls)}개)")


def save_detail_csv(halls: list[dict], path: Path):
    fields = [
        "name",
        "region",
        "tags",
        "hall_type",
        "food_type",
        "capacity",
        "phone",
        "address",
        "subway",
        "thumb",
        "url",
        "idx",
    ]
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        w.writeheader()
        for h in halls:
            row = dict(h)
            row["tags"] = "|".join(h.get("tags", []))
            w.writerow(row)
    print(f"✅ 저장: {path}  ({len(halls)}개)")


if __name__ == "__main__":
    argv = [a for a in sys.argv[1:] if a != "--detail"]
    pages = int(argv[0]) if argv else MAX_PAGES
    detail_mode = "--detail" in sys.argv

    print("=" * 55)
    print(f"  웨딩크라우드 수집  |  최대 {pages}페이지  |  출력: {DATA_DIR}")
    print("=" * 55)

    halls = collect_list(pages)
    save_list_csv(halls, OUTPUT_LIST)

    if detail_mode and halls:
        halls = enrich_detail(halls)
        save_detail_csv(halls, OUTPUT_DETAIL)

    print(f"\n완료! 총 {len(halls)}개 웨딩홀")
    print(f"목록: {OUTPUT_LIST}")
    if detail_mode:
        print(f"상세: {OUTPUT_DETAIL}")
