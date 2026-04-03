#!/usr/bin/env python3
"""
CSV → public.bw_halls 적재 (Supabase PostgREST)

환경 변수:
  SUPABASE_URL 또는 NUXT_PUBLIC_SUPABASE_URL  (예: https://xxxx.supabase.co)
  SUPABASE_SERVICE_ROLE_KEY

  터미널에서 변수가 비어 있으면 direnv 없이 실행한 경우입니다.
    set -a && . ./.envrc && set +a   # 또는 export 로 직접 설정

실행 (프로젝트 루트):
  python3 scripts/weddingcrowd/import_supabase.py --source weddic
  python3 scripts/weddingcrowd/import_supabase.py --source weddingcrowd
  python3 scripts/weddingcrowd/import_supabase.py --dry-run
"""

from __future__ import annotations

import csv
import json
import os
import re
import socket
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
WC_DIR = ROOT / "data" / "weddingcrowd"
LIST_CSV = WC_DIR / "wedding_halls.csv"
DETAIL_CSV = WC_DIR / "wedding_halls_detail.csv"
WC_SQL_OUT = WC_DIR / "seed_bw_halls.sql"

WEDDIC_DIR = ROOT / "data" / "weddic"
WEDDIC_CSV = WEDDIC_DIR / "weddic_halls.csv"
WEDDIC_SQL_OUT = WEDDIC_DIR / "seed_bw_halls.sql"


def supabase_base() -> str:
    return (
        os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
        or os.environ.get("NUXT_PUBLIC_SUPABASE_URL", "").strip().rstrip("/")
    )


def check_supabase_host_resolvable(base: str) -> tuple[bool, str]:
    """
    Errno 8 (nodename nor servname) 방지용: 요청 전에 호스트 DNS 조회.
    실패 시 (False, 안내 문자열).
    """
    parsed = urlparse(base)
    host = parsed.hostname or ""
    if not host:
        return False, f"URL에 호스트가 없습니다. 예: https://xxxxx.supabase.co  (입력값: {base!r})"
    if parsed.scheme not in ("https", "http"):
        return False, f"URL은 https:// 로 시작해야 합니다. (현재: {parsed.scheme!r})"
    try:
        socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
    except OSError as e:
        return (
            False,
            "\n".join(
                [
                    f"[DNS] 호스트를 찾을 수 없습니다: {host}",
                    f"  시스템 오류: {e}",
                    "  조치:",
                    "  1) Supabase 대시보드 → Settings → API → Project URL 복사",
                    "     형식: https://<project-ref>.supabase.co (오타·공백 없음)",
                    "  2) 터미널에서 확인:  nslookup " + host,
                    "  3) 프로젝트가 일시정지/삭제되지 않았는지 확인",
                    "  4) VPN/사내 DNS가 *.supabase.co 를 막는지 확인",
                    "  환경 변수: export NUXT_PUBLIC_SUPABASE_URL='https://....supabase.co'",
                ]
            ),
        )
    return True, ""


def slug_weddingcrowd(idx: str, name: str) -> str:
    suf = (idx or "").strip() or re.sub(r"\s+", "-", name.strip())[:40] or "unknown"
    return f"weddingcrowd-{suf}"


def split_region(region: str) -> tuple[str | None, str | None]:
    if not region:
        return None, None
    parts = region.split(None, 1)
    if len(parts) == 1:
        return parts[0], None
    return parts[0], parts[1]


def parse_capacity(s: str) -> tuple[int | None, int | None]:
    if not s:
        return None, None
    m = re.search(r"(\d+)\s*~\s*(\d+)", s)
    if m:
        return int(m.group(1)), int(m.group(2))
    m = re.search(r"(\d+)\s*명", s)
    if m:
        v = int(m.group(1))
        return v, v
    return None, None


def tags_cell(cell: str) -> list[str]:
    if not cell:
        return []
    return [t.strip() for t in cell.split("|") if t.strip()]


def parse_int_cell(v: str | None) -> int | None:
    if v is None or not str(v).strip():
        return None
    try:
        return int(float(str(v).strip()))
    except (ValueError, TypeError):
        return None


def parse_float_cell(v: str | None) -> float | None:
    if v is None or not str(v).strip():
        return None
    try:
        return float(str(v).strip())
    except (ValueError, TypeError):
        return None


def hall_food_arrays(
    hall_type: str, food_type: str
) -> tuple[list[str] | None, list[str] | None]:
    ht = [hall_type] if hall_type and hall_type.strip() else None
    ft = [food_type] if food_type and food_type.strip() else None
    return ht, ft


def row_to_record_weddingcrowd(row: dict, has_detail: bool) -> dict:
    idx = (row.get("idx") or "").strip()
    name = (row.get("name") or "").strip()
    region = (row.get("region") or "").strip()
    city, district = split_region(region)

    tags = tags_cell(row.get("tags") or "")

    if has_detail:
        hall_type = (row.get("hall_type") or "").strip()
        food_type = (row.get("food_type") or "").strip()
        cap_s = (row.get("capacity") or "").strip()
        phone = (row.get("phone") or "").strip() or None
        address = (row.get("address") or "").strip() or None
    else:
        hall_type = food_type = ""
        cap_s = ""
        phone = address = None

    cmin, cmax = parse_capacity(cap_s)
    ht, ft = hall_food_arrays(hall_type, food_type)

    thumb = (row.get("thumb") or "").strip() or None
    source_url = (row.get("url") or "").strip() or None

    return {
        "name": name,
        "slug": slug_weddingcrowd(idx, name),
        "region_city": city,
        "region_district": district,
        "address": address,
        "phone": phone,
        "lat": None,
        "lng": None,
        "hall_type": ht,
        "food_type": ft,
        "capacity_min": cmin,
        "capacity_max": cmax,
        "food_price_min": None,
        "food_price_max": None,
        "tags": tags if tags else None,
        "thumb_url": thumb,
        "source_url": source_url,
        "source_name": "weddingcrowd",
        "source_idx": idx or None,
        "status": "pending",
        "is_verified": False,
    }


def row_to_record_weddic(row: dict) -> dict:
    idx = (row.get("id") or "").strip()
    name = (row.get("name") or "").strip()
    d1 = (row.get("regionDepth1") or "").strip() or None
    d2 = (row.get("regionDepth2") or "").strip() or None
    addr = (row.get("address") or "").strip() or None
    if not d1 and addr:
        parts = addr.split(None, 1)
        d1 = parts[0] if parts else None
        d2 = parts[1] if len(parts) > 1 else None

    hall_type_str = (row.get("hallType") or "").strip()
    ht = [hall_type_str] if hall_type_str else None

    tags: list[str] | None = None
    raw_sub = (row.get("subTypes_json") or "").strip()
    if raw_sub:
        try:
            parsed = json.loads(raw_sub)
            if isinstance(parsed, list):
                tags = [str(x) for x in parsed]
            elif isinstance(parsed, str):
                tags = [parsed]
        except json.JSONDecodeError:
            tags = None

    return {
        "name": name,
        "slug": f"weddic-{idx}",
        "region_city": d1,
        "region_district": d2,
        "address": addr,
        "phone": (row.get("phone") or "").strip() or None,
        "lat": parse_float_cell(row.get("lat")),
        "lng": parse_float_cell(row.get("lng")),
        "hall_type": ht,
        "food_type": None,
        "capacity_min": parse_int_cell(row.get("guaranteeMin")),
        "capacity_max": parse_int_cell(row.get("guaranteeMax")),
        "food_price_min": parse_int_cell(row.get("mealCostMin")),
        "food_price_max": parse_int_cell(row.get("mealCostMax")),
        "tags": tags,
        "thumb_url": None,
        "source_url": (row.get("source_url") or "https://www.weddic.com/").strip(),
        "source_name": "weddic",
        "source_idx": idx or None,
        "status": "pending",
        "is_verified": False,
    }


def row_to_bw_record(row: dict, source: str, has_detail: bool) -> dict:
    if source == "weddic":
        return row_to_record_weddic(row)
    return row_to_record_weddingcrowd(row, has_detail)


BW_COLS = [
    "name",
    "slug",
    "region_city",
    "region_district",
    "address",
    "phone",
    "lat",
    "lng",
    "hall_type",
    "food_type",
    "capacity_min",
    "capacity_max",
    "food_price_min",
    "food_price_max",
    "tags",
    "thumb_url",
    "source_url",
    "source_name",
    "source_idx",
    "status",
    "is_verified",
]


def sql_escape(s: str | None) -> str:
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def sql_array_str(items: list[str] | None) -> str:
    if not items:
        return "NULL"
    parts = ["'" + i.replace("'", "''") + "'" for i in items]
    return "ARRAY[" + ", ".join(parts) + "]::text[]"


def record_to_sql_insert(rec: dict) -> str:
    parts: list[str] = []
    for c in BW_COLS:
        v = rec.get(c)
        if v is None:
            parts.append("NULL")
        elif c in ("hall_type", "food_type", "tags"):
            if isinstance(v, list):
                parts.append(sql_array_str(v))
            else:
                parts.append("NULL")
        elif c == "is_verified":
            parts.append("false" if not v else "true")
        elif c in ("capacity_min", "capacity_max", "food_price_min", "food_price_max"):
            parts.append(str(int(v)) if v is not None else "NULL")
        elif c in ("lat", "lng"):
            if v is not None:
                parts.append(str(float(v)))
            else:
                parts.append("NULL")
        elif isinstance(v, str):
            parts.append(sql_escape(v))
        else:
            parts.append(sql_escape(str(v)))

    updates = ", ".join(f"{c} = EXCLUDED.{c}" for c in BW_COLS if c not in ("slug",))
    return (
        "INSERT INTO public.bw_halls ("
        + ", ".join(BW_COLS)
        + ") VALUES ("
        + ", ".join(parts)
        + ") ON CONFLICT (slug) DO UPDATE SET "
        + updates
        + ", updated_at = now();"
    )


def load_rows() -> tuple[list[dict], str, bool]:
    source = "weddingcrowd"
    path: Path = DETAIL_CSV if DETAIL_CSV.exists() else LIST_CSV

    if "--source" in sys.argv:
        i = sys.argv.index("--source")
        if i + 1 >= len(sys.argv):
            print("사용: --source weddic | weddingcrowd", file=sys.stderr)
            sys.exit(1)
        arg = sys.argv[i + 1].lower().strip()
        if arg == "weddic":
            source = "weddic"
            path = WEDDIC_CSV
        elif arg == "weddingcrowd":
            source = "weddingcrowd"
            path = DETAIL_CSV if DETAIL_CSV.exists() else LIST_CSV
        else:
            print("--source 는 weddic 또는 weddingcrowd", file=sys.stderr)
            sys.exit(1)

    if not path.exists():
        print(f"CSV 없음: {path}", file=sys.stderr)
        sys.exit(1)

    has_detail = source == "weddingcrowd" and path == DETAIL_CSV
    rows: list[dict] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        r = csv.DictReader(f)
        for row in r:
            rows.append(row)
    return rows, source, has_detail


def post_rest(rows: list[dict], source: str, has_detail: bool) -> bool:
    """성공 True, 스킵/네트워크 실패 False (호출 측에서 SQL 폴백 가능)."""
    base = supabase_base()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not base or not key:
        return False

    ok_dns, dns_msg = check_supabase_host_resolvable(base)
    if not ok_dns:
        print(dns_msg, file=sys.stderr)
        return False

    parsed = urlparse(base)
    print(f"Supabase 연결 시도: https://{parsed.hostname}/ …", flush=True)

    url = f"{base}/rest/v1/bw_halls?on_conflict=slug"
    payload = []
    for r in rows:
        if not (r.get("name") or "").strip():
            continue
        payload.append(row_to_bw_record(r, source, has_detail))
    if not payload:
        print("REST: 넣을 행 없음")
        return False
    chunk_size = 80
    for start in range(0, len(payload), chunk_size):
        chunk = payload[start : start + chunk_size]
        body = json.dumps(chunk, ensure_ascii=False).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=body,
            method="POST",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                print(
                    f"REST OK: {resp.status} rows {start + 1}-{start + len(chunk)}/{len(payload)}"
                )
        except urllib.error.URLError as e:
            print(
                f"REST 네트워크 오류: {e}\n"
                "  (DNS는 통과했지만 TLS/프록시/방화벽 문제일 수 있습니다.)",
                file=sys.stderr,
            )
            return False
        except urllib.error.HTTPError as e:
            err = e.read().decode("utf-8", errors="replace")
            print(f"REST 실패 {e.code}: {err}", file=sys.stderr)
            sys.exit(1)
    return True


def write_sql(rows: list[dict], source: str, has_detail: bool, out: Path) -> None:
    lines = [
        f"-- brown-wedding: {source} → bw_halls (slug ON CONFLICT)",
        "-- Supabase SQL Editor에서 실행 (또는 psql)",
        "",
    ]
    n = 0
    for r in rows:
        if not (r.get("name") or "").strip():
            continue
        rec = row_to_bw_record(r, source, has_detail)
        lines.append(record_to_sql_insert(rec))
        lines.append("")
        n += 1
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(lines), encoding="utf-8")
    print(f"SQL 저장: {out} ({n}건)")


def main() -> None:
    dry = "--dry-run" in sys.argv
    rows, source, has_detail = load_rows()
    print(
        f"읽음: {len(rows)}행 | 소스={source} | weddingcrowd상세={'예' if has_detail else '아니오'}"
    )

    sql_out = WEDDIC_SQL_OUT if source == "weddic" else WC_SQL_OUT

    base = supabase_base()
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

    if base and key and not dry:
        ok = post_rest(rows, source, has_detail)
        if not ok:
            print("REST 실패 또는 스킵 — SQL 파일로 저장합니다.", file=sys.stderr)
            write_sql(rows, source, has_detail, sql_out)
    else:
        if not (base and key):
            print(
                "SUPABASE_URL(또는 NUXT_PUBLIC_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY 없음 — SQL만 생성합니다."
            )
        write_sql(rows, source, has_detail, sql_out)
        if dry:
            print("(dry-run: REST 호출 안 함)")


if __name__ == "__main__":
    main()
