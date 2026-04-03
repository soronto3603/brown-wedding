import type { Hall, HallMarkerKind } from '~/data/wedding'
import { getHallTypeBadge } from '~/data/hallTypeConfig'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** DB `hall_type`·태그 문자열에서 마커 종류 결정 (우선순위 고정) — `bwHallMapper` 등에서 사용 */
export function resolveMarkerKind(
  hallTypes: string[] | null | undefined,
  tags: string[] | null | undefined,
): HallMarkerKind {
  const types = new Set(
    (hallTypes ?? []).map((t) => String(t).trim()).filter(Boolean),
  )
  const tagSet = new Set((tags ?? []).map((t) => String(t).trim()))

  if (tagSet.has('한옥') || types.has('한옥') || types.has('한옥 웨딩홀'))
    return 'hanok'
  if (types.has('채플') || tagSet.has('채플') || types.has('채플 웨딩홀'))
    return 'chapel'
  if (types.has('호텔') || tagSet.has('호텔') || types.has('호텔 웨딩홀'))
    return 'hotel'
  if (types.has('야외') || tagSet.has('야외') || types.has('야외 웨딩홀'))
    return 'outdoor'
  if (types.has('컨벤션') || tagSet.has('컨벤션') || types.has('컨벤션 웨딩홀'))
    return 'convention'
  if (types.has('하우스')) return 'wedding_hall'
  return 'wedding_hall'
}

/** 지도 pill 왼쪽 칩 — `hall_type` 배열 기준 색상 (`data/hallTypeConfig`) */
export function getHallMarkerBadge(h: Hall) {
  return getHallTypeBadge(h.hallTypes ?? null)
}

/**
 * 네이버 지도 HTML 마커용 pill DOM. anchor는 좌표에 대응하는 지점(아래쪽 중앙).
 */
export function createHallMarkerPillElement(
  h: Hall,
  opts: { selected: boolean; primary: string },
): { el: HTMLElement; anchor: { x: number; y: number } } {
  const badge = getHallMarkerBadge(h)
  const name = escapeHtml(h.name)
  const ring = opts.selected
    ? `0 0 0 2px ${opts.primary}, 0 2px 8px rgba(0,0,0,0.22)`
    : '0 2px 6px rgba(0,0,0,0.2)'

  const wrap = document.createElement('div')
  wrap.style.cssText = [
    'display:flex',
    'align-items:center',
    'background:#fff',
    'border-radius:20px',
    `box-shadow:${ring}`,
    'padding:3px 10px 3px 3px',
    'white-space:nowrap',
    'font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif',
    'cursor:pointer',
    'user-select:none',
  ].join(';')

  const tagBg = escapeHtml(badge.bg)
  const tagFg = escapeHtml(badge.text)
  const tagLabel = escapeHtml(badge.label)

  wrap.innerHTML = [
    `<span style="background:${tagBg};color:${tagFg};border-radius:14px;padding:3px 7px;font-size:10px;font-weight:700;margin-right:8px;display:inline-flex;align-items:center;gap:3px;line-height:1.2;">`,
    `<span>${tagLabel}</span>`,
    `</span>`,
    `<span style="font-size:12px;font-weight:600;color:#333;max-width:200px;overflow:hidden;text-overflow:ellipsis;">${name}</span>`,
  ].join('')

  const measure = document.createElement('div')
  measure.style.cssText =
    'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none'
  measure.appendChild(wrap)
  document.body.appendChild(measure)
  const w = wrap.offsetWidth
  const height = wrap.offsetHeight
  document.body.removeChild(measure)

  return {
    el: wrap,
    anchor: { x: w / 2, y: height },
  }
}

/** 줌 아웃 시 묶음 마커(숫자 버블). anchor는 아래쪽 중앙. */
export function createClusterMarkerElement(
  pointCount: number,
  abbreviated: string | number | undefined,
  opts: { primary: string },
): { el: HTMLElement; anchor: { x: number; y: number } } {
  const label =
    abbreviated != null && String(abbreviated).length > 0
      ? String(abbreviated)
      : pointCount >= 1000
        ? `${Math.round(pointCount / 100) / 10}k`
        : String(pointCount)

  const wrap = document.createElement('div')
  wrap.textContent = label
  wrap.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'min-width:40px',
    'height:40px',
    'padding:0 10px',
    'box-sizing:border-box',
    'border-radius:20px',
    `background:${opts.primary}`,
    'color:#fff',
    'font-size:13px',
    'font-weight:700',
    'box-shadow:0 2px 8px rgba(0,0,0,0.25)',
    'border:2px solid #fff',
    'cursor:pointer',
    'font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif',
    'user-select:none',
  ].join(';')

  const measure = document.createElement('div')
  measure.style.cssText =
    'position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none'
  measure.appendChild(wrap)
  document.body.appendChild(measure)
  const w = wrap.offsetWidth
  const height = wrap.offsetHeight
  document.body.removeChild(measure)

  return {
    el: wrap,
    anchor: { x: w / 2, y: height },
  }
}
