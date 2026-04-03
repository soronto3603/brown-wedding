#!/usr/bin/env python3
"""
weddic 웨딩홀 상세 데이터 수집 → Supabase upsert
=================================================
GET https://www.weddic.com/api/venues?id={weddic_id}&format=full

대상 행: bw_halls.slug 가 `weddic-420` 형태일 때, 뒤 숫자(420)를 웨딕 API id로 사용해
상세를 가져온 뒤 해당 uuid 행에 연결합니다. (성공 시 weddic_id 컬럼도 같은 값으로 갱신)

실행:
    python3 scripts/weddic/fetch_detail.py                  # slug 가 weddic-% 인 전체
    python3 scripts/weddic/fetch_detail.py --limit 10       # 테스트 10개
    python3 scripts/weddic/fetch_detail.py --weddic-id 649  # slug 가 weddic-649 인 홀만
    python3 scripts/weddic/fetch_detail.py --workers 8      # 동시 요청 수 (기본 5)

환경변수:
    SUPABASE_URL  프로젝트 URL (없으면 NUXT_PUBLIC_SUPABASE_URL 시도)
    SUPABASE_SERVICE_KEY 또는 SUPABASE_SERVICE_ROLE_KEY
        → 반드시 JWT payload role 이 "service_role" 인 키 (anon 이면 RLS 때문에 0건)

의존성:
    pip install supabase
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from supabase import Client, create_client

# ── 설정 ──────────────────────────────────────────────────────
BASE_URL = "https://www.weddic.com"
DETAIL_URL = BASE_URL + "/api/venues?id={id}&format=full"
DEFAULT_WORKERS = 5

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json",
    "Accept-Language": "ko-KR,ko;q=0.9",
    "Referer": BASE_URL + "/",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
}

# bw_halls.slug 예: weddic-420 → 웨딕 API id = 420
SLUG_RE = re.compile(r"^weddic-(\d+)$", re.IGNORECASE)


def weddic_id_from_slug(slug: str | None) -> int | None:
    if not slug or not isinstance(slug, str):
        return None
    m = SLUG_RE.match(slug.strip())
    return int(m.group(1)) if m else None


# fetch_halls.py 와 동일한 HTTP + JSON 로더
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


# ── Supabase 클라이언트 ─────────────────────────────────────────
def get_supabase() -> Client:
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NUXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    if not url or not key:
        print(
            "❌ SUPABASE_URL (또는 NUXT_PUBLIC_SUPABASE_URL) 과\n"
            "   SUPABASE_SERVICE_KEY 또는 SUPABASE_SERVICE_ROLE_KEY 를 설정하세요.\n"
            "   상세 수집은 service_role 키가 필요합니다 (anon 키는 RLS로 행이 안 보일 수 있음).",
            file=sys.stderr,
        )
        sys.exit(1)
    return create_client(url, key)


def explain_empty_targets(sb: Client) -> None:
    """대상 0건일 때 원인 추정용 샘플 조회."""
    print("", file=sys.stderr)
    print("대상 홀이 없습니다. 아래를 확인하세요.", file=sys.stderr)
    print("", file=sys.stderr)
    print(
        "  1) bw_halls.slug 가 `weddic-숫자` 패턴인 행이 있어야 합니다 (예: weddic-420 → API id=420).",
        file=sys.stderr,
    )
    print("", file=sys.stderr)
    try:
        probe = (
            sb.table("bw_halls")
            .select("id, slug, weddic_id, status")
            .like("slug", "weddic-%")
            .limit(12)
            .execute()
        )
        rows = probe.data or []
        if not rows:
            probe2 = (
                sb.table("bw_halls")
                .select("id, slug, status")
                .limit(8)
                .execute()
            )
            rows2 = probe2.data or []
            if not rows2:
                print(
                    "  2) 진단: bw_halls 를 한 줄도 못 읽었습니다.",
                    file=sys.stderr,
                )
                print(
                    "     → service_role 키인지, RLS로 막히지 않는지 확인하세요.",
                    file=sys.stderr,
                )
            else:
                print(
                    "  2) 진단: `slug like weddic-%` 인 행이 없습니다. 샘플 slug:",
                    file=sys.stderr,
                )
                for r in rows2:
                    print(f"     · slug={r.get('slug')!r}  status={r.get('status')!r}", file=sys.stderr)
                print(
                    "     → slug 를 weddic-{웨딕사이트id} 형태로 맞추거나, 적재 파이프라인을 확인하세요.",
                    file=sys.stderr,
                )
        else:
            print("  2) 진단: weddic-% slug 샘플 (파싱 가능한지 확인)", file=sys.stderr)
            for r in rows:
                p = weddic_id_from_slug(r.get("slug"))
                print(
                    f"     · slug={r.get('slug')!r}  → api_id={p!r}  status={r.get('status')!r}",
                    file=sys.stderr,
                )
    except Exception as e:
        print(f"  (진단 조회 실패: {e})", file=sys.stderr)


# ── 유틸 ────────────────────────────────────────────────────────
def none_if_empty(v: str | None) -> str | None:
    """'정보 부족', 빈 문자열 → None"""
    if v is None:
        return None
    s = str(v).strip()
    if s in ("", "정보 부족", "정보부족", "-", "—"):
        return None
    return s


def safe_int(v) -> int | None:
    try:
        return int(v) if v is not None else None
    except (TypeError, ValueError):
        return None


def safe_float(v) -> float | None:
    try:
        return float(v) if v is not None else None
    except (TypeError, ValueError):
        return None


# 웨딕 costs.rentalCostMin/Max 단위가 홀마다 다름 (API 불일치).
# · 텍스트 "390만" + 숫자 390 → 만원 단위
# · 텍스트 "300,000원" + 숫자 300000 → 이미 원 단위
# 목록 CSV 기준으로 1만 미만은 만원, 그 이상은 원으로 두면 대부분 일치.
WEDDIC_RENTAL_MANWON_THRESHOLD = 10_000


def rental_amount_to_store_won(v: int | None) -> int | None:
    """API 숫자 → DB 저장용 원화 정수 (integer 범위 내)."""
    if v is None:
        return None
    if v >= WEDDIC_RENTAL_MANWON_THRESHOLD:
        return v
    return v * 10_000


# ── bw_halls 메인 컬럼 업데이트 ───────────────────────────────
def upsert_hall_main(sb: Client, hall_id: str, wh: dict, weddic_id: int | None = None) -> None:
    payload = {
        "grade": none_if_empty(wh.get("grade")),
        "description": none_if_empty(wh.get("description")),
        "detail_content": none_if_empty(wh.get("detailContent")),
        "parking_info": none_if_empty(wh.get("parkingInfo")),
        "total_parking": safe_int(wh.get("totalParking")),
        "free_parking_min": safe_int(wh.get("freeParkingMinutes")),
        "transport": none_if_empty(wh.get("transport")),
        "has_shuttle": wh.get("hasShuttle"),
        "elevator_info": none_if_empty(wh.get("elevatorInfo")),
        "atm_location": none_if_empty(wh.get("atmLocation")),
    }
    if weddic_id is not None:
        payload["weddic_id"] = weddic_id
    sb.table("bw_halls").update(payload).eq("id", hall_id).execute()


# ── bw_hall_costs ──────────────────────────────────────────────
def upsert_costs(sb: Client, hall_id: str, costs: list) -> None:
    sb.table("bw_hall_costs").delete().eq("hall_id", hall_id).execute()

    rows = []
    for c in costs:
        rcmin = safe_int(c.get("rentalCostMin"))
        rcmax = safe_int(c.get("rentalCostMax"))
        rows.append(
            {
                "hall_id": hall_id,
                "target_date": none_if_empty(c.get("targetDate")),
                "meal_cost_min": safe_int(c.get("mealCostMin")),
                "meal_cost_max": safe_int(c.get("mealCostMax")),
                "meal_cost_text": none_if_empty(c.get("mealCost")),
                "rental_cost_min": rental_amount_to_store_won(rcmin),
                "rental_cost_max": rental_amount_to_store_won(rcmax),
                "rental_cost_text": none_if_empty(c.get("rentalCost")),
                "guarantee_min": safe_int(c.get("guaranteeMin")),
                "guarantee_max": safe_int(c.get("guaranteeMax")),
                "guarantee_text": none_if_empty(c.get("guarantee")),
                "add_cost": none_if_empty(c.get("addCost")),
                "contract_info": none_if_empty(c.get("contractInfo")),
                "external_corp": none_if_empty(c.get("externalCorp")),
                "source_link": none_if_empty(c.get("sourceLink")),
            }
        )

    if rows:
        sb.table("bw_hall_costs").insert(rows).execute()


# ── bw_hall_rooms ──────────────────────────────────────────────
def upsert_rooms(sb: Client, hall_id: str, halls: list) -> None:
    sb.table("bw_hall_rooms").delete().eq("hall_id", hall_id).execute()

    rows = []
    for h in halls:
        rows.append(
            {
                "hall_id": hall_id,
                "name": none_if_empty(h.get("name")),
                "type": none_if_empty(h.get("type")),
                "interval_text": none_if_empty(h.get("interval")),
                "interval_min": safe_int(h.get("intervalMinutes")),
                "feature": none_if_empty(h.get("feature")),
                "mood": none_if_empty(h.get("mood")),
                "bride_room": none_if_empty(h.get("brideRoom")),
                "guarantee_min": safe_int(h.get("guaranteeMin")),
                "guarantee_max": safe_int(h.get("guaranteeMax")),
                "capacity": safe_int(h.get("capacityInt")),
                "source_link": none_if_empty(h.get("sourceLink")),
            }
        )

    if rows:
        sb.table("bw_hall_rooms").insert(rows).execute()


# ── bw_hall_dinings ────────────────────────────────────────────
def upsert_dinings(sb: Client, hall_id: str, dinings: list) -> None:
    sb.table("bw_hall_dinings").delete().eq("hall_id", hall_id).execute()

    rows = []
    for d in dinings:
        rows.append(
            {
                "hall_id": hall_id,
                "food_type": none_if_empty(d.get("foodType")),
                "menu_info": none_if_empty(d.get("menuInfo")),
                "capacity": safe_int(d.get("capacityInt")),
                "family_room": none_if_empty(d.get("familyRoom")),
                "review_score": safe_float(d.get("reviewScore")),
                "taste_pros": none_if_empty(d.get("tastePros")),
                "taste_cons": none_if_empty(d.get("tasteCons")),
                "source_link": none_if_empty(d.get("sourceLink")),
            }
        )

    if rows:
        sb.table("bw_hall_dinings").insert(rows).execute()


# ── 단일 홀: 조회 / 저장 분리 (조회만 스레드 풀에서 병렬) ───────
def fetch_wedding_hall(weddic_id: int) -> dict | None:
    """웨딕 상세 JSON에서 weddingHall 객체만 반환. 실패 시 None."""
    data = fetch_json(DETAIL_URL.format(id=weddic_id))
    if not data or not isinstance(data, dict) or "weddingHall" not in data:
        return None
    return data["weddingHall"]


def persist_hall_detail(sb: Client, hall_id: str, weddic_id: int, wh: dict) -> bool:
    try:
        upsert_hall_main(sb, hall_id, wh, weddic_id=weddic_id)
        upsert_costs(sb, hall_id, wh.get("costs") or [])
        upsert_rooms(sb, hall_id, wh.get("halls") or [])
        upsert_dinings(sb, hall_id, wh.get("dinings") or [])
        return True
    except Exception as e:
        print(f"  ❌  DB 오류: {e}", file=sys.stderr)
        return False


def _fetch_row_detail(row: dict) -> tuple[dict, dict | None]:
    """ThreadPoolExecutor용: (원본 row, weddingHall 또는 None)."""
    wh = fetch_wedding_hall(row["weddic_id"])
    return row, wh


# ── bw_halls에서 대상 목록 조회 ────────────────────────────────
def get_target_halls(sb: Client, weddic_id: int | None, limit: int | None) -> list[dict]:
    """slug 가 `weddic-{숫자}` 인 행만; weddic_id 는 slug 에서 파싱."""
    query = sb.table("bw_halls").select("id, slug, name").like("slug", "weddic-%")

    if weddic_id is not None:
        query = query.eq("slug", f"weddic-{weddic_id}")

    # like 만으로는 weddic-abc 같은 행이 섞일 수 있어 파싱으로 확정
    fetch_limit = None
    if limit is not None:
        fetch_limit = max(limit * 3, limit + 50)

    if fetch_limit:
        query = query.limit(fetch_limit)

    res = query.execute()
    raw = res.data or []

    out: list[dict] = []
    for row in raw:
        wid = weddic_id_from_slug(row.get("slug"))
        if wid is None:
            continue
        out.append(
            {
                "id": row["id"],
                "name": row.get("name") or "",
                "slug": row.get("slug"),
                "weddic_id": wid,
            }
        )
        if limit is not None and len(out) >= limit:
            break

    return out


# ── 메인 ────────────────────────────────────────────────────────
def main() -> None:
    parser = argparse.ArgumentParser(description="weddic 상세 수집 → Supabase")
    parser.add_argument(
        "--weddic-id",
        type=int,
        help="slug 이 weddic-{id} 인 홀만 (예: --weddic-id 420 → slug=weddic-420)",
    )
    parser.add_argument("--limit", type=int, help="처리할 최대 개수")
    parser.add_argument(
        "--workers",
        type=int,
        default=DEFAULT_WORKERS,
        metavar="N",
        help=f"동시에 웨딕 API를 요청하는 스레드 수 (기본 {DEFAULT_WORKERS})",
    )
    args = parser.parse_args()

    workers = max(1, args.workers)

    sb = get_supabase()
    halls = get_target_halls(sb, args.weddic_id, args.limit)
    total = len(halls)

    if not total:
        explain_empty_targets(sb)
        sys.exit(0)

    print("=" * 55)
    print(f"  weddic 상세 수집  |  대상 {total}개  |  동시 요청 {workers}개")
    print("=" * 55)

    # 1) HTTP만 병렬 (executor.map 은 입력 순서대로 결과 반환)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        fetched = list(ex.map(_fetch_row_detail, halls))

    ok = fail = 0
    for i, (row, wh) in enumerate(fetched, 1):
        hall_id = row["id"]
        weddic_id = row["weddic_id"]
        name = row["name"]
        print(
            f"[{i:03d}/{total}] {name} (slug={row.get('slug')!s}, api_id={weddic_id})",
            end="  ",
            flush=True,
        )

        if wh is None:
            print(f"⚠️  응답 없음 또는 구조 불일치 — weddic_id={weddic_id}")
            fail += 1
            continue

        if persist_hall_detail(sb, hall_id, weddic_id, wh):
            print("✓")
            ok += 1
        else:
            fail += 1

    print()
    print(f"완료 — 성공 {ok}개 / 실패 {fail}개 / 전체 {total}개")


if __name__ == "__main__":
    main()
