import type { Hall, HallMarkerKind } from '~/data/wedding'
import { resolveMarkerKind } from '~/utils/hallMapMarker'

export type BwHallRow = {
  id: string
  name: string
  region_city: string | null
  region_district: string | null
  address: string | null
  phone: string | null
  lat: string | number | null
  lng: string | number | null
  hall_type: string[] | null
  food_type: string[] | null
  capacity_min: number | null
  capacity_max: number | null
  food_price_min: number | null
  food_price_max: number | null
  tags: string[] | null
  mood: string | null
  thumb_url: string | null
}

function num(v: string | number | null | undefined): number | null {
  if (v == null || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}

/** 서울 근처 bbox → 목업 지도 % 좌표 (네이버 미연동 시) */
export function latLngToMockPin(lat: number, lng: number): { pinX: string; pinY: string } {
  const latMin = 37.42
  const latMax = 37.7
  const lngMin = 126.75
  const lngMax = 127.2
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 80 + 10
  const y = ((latMax - lat) / (latMax - latMin)) * 64 + 18
  const cx = Math.min(92, Math.max(8, x))
  const cy = Math.min(82, Math.max(18, y))
  return { pinX: `${Math.round(cx * 10) / 10}%`, pinY: `${Math.round(cy * 10) / 10}%` }
}

function iconForKind(kind: HallMarkerKind): string {
  switch (kind) {
    case 'hotel':
      return '🏨'
    case 'outdoor':
      return '🌳'
    case 'hanok':
      return '🏠'
    case 'chapel':
      return '⛪'
    case 'convention':
      return '🏢'
    default:
      return '🏢'
  }
}

export function bwRowToHall(row: BwHallRow): Hall | null {
  const lat = num(row.lat)
  const lng = num(row.lng)
  if (lat == null || lng == null) return null

  const hallTypes = row.hall_type ?? []
  const tags = row.tags ?? []
  const markerKind = resolveMarkerKind(hallTypes, tags)

  const fMinWon = num(row.food_price_min)
  const fMaxWon = num(row.food_price_max)
  let foodMin = fMinWon != null ? Math.max(1, Math.round(fMinWon / 10000)) : 5
  let foodMax = fMaxWon != null ? Math.max(foodMin, Math.round(fMaxWon / 10000)) : 9
  if (foodMax < foodMin) foodMax = foodMin

  const capMin = row.capacity_min ?? 100
  const capMax = Math.max(capMin, row.capacity_max ?? 200)

  const location =
    [row.region_city, row.region_district].filter(Boolean).join(' ') ||
    row.address ||
    ''

  const midFood = Math.round(((foodMin + foodMax) / 2) * 10) / 10

  const pins = latLngToMockPin(lat, lng)

  return {
    id: row.id,
    name: row.name,
    location,
    phone: row.phone ?? '문의',
    mood: row.mood ?? '모던',
    foodMin,
    foodMax,
    minPpl: capMin,
    maxPpl: capMax,
    icon: iconForKind(markerKind),
    tags: tags.length ? tags : ['웨딩홀'],
    hallName: row.name,
    hallDesc:
      tags.length > 0
        ? tags.join(' · ')
        : '상세 홀 정보는 방문 상담 시 안내됩니다.',
    hallNote: '',
    food: row.food_type?.[0] ?? '상담 후 결정',
    foodDesc: '식사 구성·시식은 예약 후 상담 시 안내',
    avgFood: `${midFood}만원`,
    avgDiff: 0,
    lat,
    lng,
    pinX: pins.pinX,
    pinY: pins.pinY,
    markerKind,
    hallTypes,
  }
}
