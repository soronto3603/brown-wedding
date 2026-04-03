#!/usr/bin/env python3
"""
네이버 블로그 검색 API → bw_hall_sources upsert
================================================
실행:
    python3 scripts/naver/fetch_blog_sources.py
    python3 scripts/naver/fetch_blog_sources.py --limit 10
    python3 scripts/naver/fetch_blog_sources.py --hall-id <uuid>

환경변수:
    NAVER_CLIENT_ID
    NAVER_CLIENT_SECRET
    SUPABASE_URL (또는 NUXT_PUBLIC_SUPABASE_URL)
    SUPABASE_SERVICE_ROLE_KEY (권장) 또는 구호환 SUPABASE_SERVICE_KEY
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
import time
from datetime import datetime, timedelta, timezone
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

from supabase import Client, create_client

# ── 설정 ────────────────────────────────────────────────────────
NAVER_SEARCH_URL = "https://openapi.naver.com/v1/search/blog.json"
RESULTS_PER_HALL = 5  # 홀당 저장할 최대 결과 수(두 쿼리 합산·URL 중복 제거 후)
QUERIES_PER_HALL = [
    "{name} 웨딩홀 후기",
    "{name} 식대 보증인원",
]
DELAY_MIN = 0.3
DELAY_MAX = 0.8

SOURCE_TYPE_MAP = [
    ("blog.naver.com", "naver_blog"),
    ("tistory.com", "tistory"),
    ("iwedding.co.kr", "iwedding"),
    ("directwedding.co.kr", "directwedding"),
]


def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NUXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get(
        "SUPABASE_SERVICE_KEY"
    )
    if not url or not key:
        print(
            "❌ SUPABASE_URL(또는 NUXT_PUBLIC_SUPABASE_URL)과\n"
            "   SUPABASE_SERVICE_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.",
            file=sys.stderr,
        )
        sys.exit(1)
    return create_client(url, key)


def get_naver_headers() -> dict:
    cid = os.environ.get("NAVER_CLIENT_ID")
    sec = os.environ.get("NAVER_CLIENT_SECRET")
    if not cid or not sec:
        print(
            "❌ NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수를 설정하세요.",
            file=sys.stderr,
        )
        sys.exit(1)
    return {
        "X-Naver-Client-Id": cid,
        "X-Naver-Client-Secret": sec,
        "Accept": "application/json",
    }


def search_naver_blog(query: str, display: int = 5) -> list[dict]:
    url = f"{NAVER_SEARCH_URL}?query={quote(query)}&display={display}&sort=sim"
    try:
        req = Request(url, headers=get_naver_headers())
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data.get("items", [])
    except HTTPError as e:
        print(f"  HTTP {e.code} — {query!r}", file=sys.stderr)
        return []
    except (URLError, json.JSONDecodeError) as e:
        print(f"  오류: {e}", file=sys.stderr)
        return []


def clean_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def detect_source_type(url: str) -> str:
    for domain, stype in SOURCE_TYPE_MAP:
        if domain in url:
            return stype
    return "other"


def parse_pub_date(date_str: str) -> str | None:
    """네이버 blog API: postdate 는 보통 YYYYMMDD, 일부는 RFC 2822."""
    if not date_str or not str(date_str).strip():
        return None
    s = str(date_str).strip()
    try:
        if len(s) == 8 and s.isdigit():
            dt = datetime.strptime(s, "%Y%m%d").replace(
                tzinfo=timezone(timedelta(hours=9))
            )
            return dt.isoformat()
        dt = datetime.strptime(s, "%a, %d %b %Y %H:%M:%S %z")
        return dt.isoformat()
    except Exception:
        return None


def process_hall(sb: Client, hall_id: str, name: str) -> int:
    seen_urls: set[str] = set()
    rows: list[dict] = []
    kst = timezone(timedelta(hours=9))
    fetched_iso = datetime.now(kst).isoformat()

    for query_tpl in QUERIES_PER_HALL:
        if len(rows) >= RESULTS_PER_HALL:
            break
        query = query_tpl.format(name=name)
        need = min(RESULTS_PER_HALL - len(rows), 5)
        items = search_naver_blog(query, display=max(need, 1))

        for item in items:
            if len(rows) >= RESULTS_PER_HALL:
                break
            url = item.get("link", "")
            if not url or url in seen_urls:
                continue
            seen_urls.add(url)
            raw_date = item.get("postdate") or item.get("pubDate") or ""
            rows.append(
                {
                    "hall_id": hall_id,
                    "source_type": detect_source_type(url),
                    "title": clean_html(item.get("title", "")),
                    "summary": clean_html(item.get("description", "")),
                    "url": url,
                    "published_at": parse_pub_date(raw_date),
                    "fetched_at": fetched_iso,
                }
            )

        time.sleep(random.uniform(DELAY_MIN, DELAY_MAX))

    if rows:
        sb.table("bw_hall_sources").upsert(
            rows,
            on_conflict="url",
            ignore_duplicates=True,
        ).execute()

    return len(rows)


def get_halls(sb: Client, hall_id: str | None, limit: int | None) -> list[dict]:
    query = sb.table("bw_halls").select("id, name")
    if hall_id:
        query = query.eq("id", hall_id)
    if limit:
        query = query.limit(limit)
    res = query.execute()
    return res.data or []


def main() -> None:
    parser = argparse.ArgumentParser(description="네이버 블로그 검색 → bw_hall_sources")
    parser.add_argument("--hall-id", help="단일 홀 UUID")
    parser.add_argument("--limit", type=int, help="처리할 최대 홀 수")
    args = parser.parse_args()

    sb = get_supabase()
    halls = get_halls(sb, args.hall_id, args.limit)
    total = len(halls)

    print("=" * 55)
    print(f"  네이버 블로그 수집  |  대상 {total}개 홀")
    print("=" * 55)

    saved = 0
    for i, row in enumerate(halls, 1):
        print(f"[{i:03d}/{total}] {row['name']}", end="  ", flush=True)
        n = process_hall(sb, row["id"], row["name"])
        print(f"+{n}건")
        saved += n

    print(f"\n완료 — 총 {saved}건 저장")


if __name__ == "__main__":
    main()
