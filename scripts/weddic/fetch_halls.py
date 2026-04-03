#!/usr/bin/env python3
"""
웨딕(weddic.com) 공개 JSON API로 웨딩홀 목록 수집
==============================================
HTML 크롤링 대신 Next.js Route Handler 엔드포인트를 호출합니다.

  GET https://www.weddic.com/api/halls     — 상세 필드 (식대·보증 숫자 등)
  GET https://www.weddic.com/api/venues    — 지도용 경량 목록 (옵션 비교용)

의존성: Python 3.10+ 표준 라이브러리만

실행 (프로젝트 루트):
    python3 scripts/weddic/fetch_halls.py
    python3 scripts/weddic/fetch_halls.py --venues-only   # venues만 저장 (비교)

결과: data/weddic/weddic_halls.csv
"""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data" / "weddic"
DATA_DIR.mkdir(parents=True, exist_ok=True)

BASE = "https://www.weddic.com"
URL_HALLS = f"{BASE}/api/halls"
URL_VENUES = f"{BASE}/api/venues"

OUTPUT_MAIN = DATA_DIR / "weddic_halls.csv"
OUTPUT_VENUES = DATA_DIR / "weddic_venues.csv"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "ko-KR,ko;q=0.9",
    "Referer": f"{BASE}/",
}


def fetch_json(url: str, timeout: int = 60) -> dict | list | None:
    try:
        req = Request(url, headers=HEADERS)
        with urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace")
            return json.loads(raw)
    except HTTPError as e:
        print(f"HTTP {e.code} — {url}", file=sys.stderr)
        return None
    except URLError as e:
        print(f"네트워크 오류: {e.reason} — {url}", file=sys.stderr)
        return None
    except json.JSONDecodeError as e:
        print(f"JSON 파싱 실패: {e}", file=sys.stderr)
        return None


def normalize_hall(h: dict) -> dict:
    """API 객체를 CSV용 평면 dict로 (리스트·중첩은 JSON 문자열)."""
    sub = h.get("subTypes")
    if isinstance(sub, (list, dict)):
        sub_s = json.dumps(sub, ensure_ascii=False)
    else:
        sub_s = sub if sub is not None else ""

    def num(v):
        if v is None:
            return ""
        if isinstance(v, (int, float)):
            return v
        return v

    return {
        "id": str(h.get("id", "")),
        "name": (h.get("name") or "").strip(),
        "address": (h.get("address") or "").strip(),
        "regionDepth1": (h.get("regionDepth1") or "") or "",
        "regionDepth2": (h.get("regionDepth2") or "") or "",
        "lat": num(h.get("lat")),
        "lng": num(h.get("lng")),
        "hallType": (h.get("hallType") or h.get("style") or "").strip(),
        "subTypes_json": sub_s,
        "mealCost": (h.get("mealCost") or "").strip(),
        "mealCostMin": num(h.get("mealCostMin")),
        "mealCostMax": num(h.get("mealCostMax")),
        "guarantee": (h.get("guarantee") or "").strip(),
        "guaranteeMin": num(h.get("guaranteeMin")),
        "guaranteeMax": num(h.get("guaranteeMax")),
        "interval": (h.get("interval") or "").strip(),
        "intervalMinutes": num(h.get("intervalMinutes")),
        "venueFee": (h.get("venueFee") or "").strip(),
        "rentalCostMin": num(h.get("rentalCostMin")),
        "rentalCostMax": num(h.get("rentalCostMax")),
        "phone": (h.get("phone") or "").strip(),
        "website": (h.get("website") or "").strip(),
        "source_url": BASE + "/",
        "source": "weddic",
    }


HALLS_FIELDS = [
    "id",
    "name",
    "address",
    "regionDepth1",
    "regionDepth2",
    "lat",
    "lng",
    "hallType",
    "subTypes_json",
    "mealCost",
    "mealCostMin",
    "mealCostMax",
    "guarantee",
    "guaranteeMin",
    "guaranteeMax",
    "interval",
    "intervalMinutes",
    "venueFee",
    "rentalCostMin",
    "rentalCostMax",
    "phone",
    "website",
    "source_url",
    "source",
]


def save_csv(rows: list[dict], path: Path, fieldnames: list[str]) -> None:
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        w.writeheader()
        for row in rows:
            out: dict[str, str] = {}
            for k in fieldnames:
                v = row.get(k, "")
                if v is None:
                    out[k] = ""
                elif isinstance(v, bool):
                    out[k] = "true" if v else "false"
                elif isinstance(v, float):
                    out[k] = str(v)
                elif isinstance(v, int):
                    out[k] = str(v)
                else:
                    out[k] = str(v)
            w.writerow(out)
    print(f"✅ 저장: {path}  ({len(rows)}개)")


def main() -> None:
    venues_only = "--venues-only" in sys.argv

    print("=" * 55)
    print("  웨딕 API 수집  |  " + (URL_VENUES if venues_only else URL_HALLS))
    print("=" * 55)

    if venues_only:
        data = fetch_json(URL_VENUES)
        if not data or not isinstance(data, dict):
            sys.exit(1)
        raw = data.get("halls") or []
        rows = [normalize_hall(h) for h in raw]
        save_csv(rows, OUTPUT_VENUES, HALLS_FIELDS)
        print(f"\n완료: {OUTPUT_VENUES}")
        return

    data = fetch_json(URL_HALLS)
    if not data or not isinstance(data, dict):
        print("/api/halls 응답 없음", file=sys.stderr)
        sys.exit(1)

    raw = data.get("halls") or []
    rows = [normalize_hall(h) for h in raw]
    rows = [r for r in rows if r.get("name")]
    save_csv(rows, OUTPUT_MAIN, HALLS_FIELDS)

    print(f"\n완료! 총 {len(rows)}건 → {OUTPUT_MAIN}")
    print("Supabase 적재: python3 scripts/weddingcrowd/import_supabase.py --source weddic")


if __name__ == "__main__":
    main()
