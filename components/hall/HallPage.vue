<script setup lang="ts">
import type { Hall } from '~/data/wedding'
import { HALLS } from '~/data/wedding'
import type { BwHallRow } from '~/utils/bwHallMapper'
import { bwRowToHall } from '~/utils/bwHallMapper'

const { PRIMARY, TEXT, MUTED, BORDER } = useThemeColors()
const config = useRuntimeConfig()
const supabase = useSupabaseClient()

const hallTypeF = ref('전체')
const foodF = ref('전체')
const guestF = ref('전체')
const q = ref('')
const selected = ref<Hall | null>(null)

const HALL_TYPE_OPTIONS = ['전체', '웨딩홀', '호텔', '컨벤션', '교회', '대학', '채플', '한옥', '전통', '복합', '야외']
const FOOD_OPTIONS = ['전체', '5만원 이하', '5-7만원', '7-10만원', '10만원 이상']
const GUEST_OPTIONS = ['전체', '20-50명', '51-100명', '101-200명', '201-300명', '300명 이상']

/**
 * `undefined`: Supabase로 아직 대체하지 않음 → 데모 `HALLS` 사용.
 * 배열: Supabase 뷰포트 결과(빈 배열 = 이 구역에 홀 없음).
 * 첫 fetch가 0건이면 `[]`로 덮지 않음(데모가 잠깐 보였다 사라지는 현상 방지).
 */
const mapHalls = ref<Hall[] | undefined>(undefined)
/** 한 번이라도 뷰포트에서 홀을 받은 뒤에는, 빈 구역도 `[]`로 반영 */
const remoteHallsLoadedOnce = ref(false)

let debounceBounds: ReturnType<typeof setTimeout> | null = null


const baseHalls = computed(() =>
  mapHalls.value !== undefined ? mapHalls.value : HALLS,
)

const filtered = computed(() => {
  const qq = q.value.trim().toLowerCase()
  return baseHalls.value.filter((h) => {
    // 홀 유형 필터
    if (hallTypeF.value !== '전체') {
      const types = h.hallTypes ?? h.tags ?? []
      if (!types.some((t: string) => t.includes(hallTypeF.value) || hallTypeF.value.includes(t))) return false
    }
    // 식대 필터 (foodMin/foodMax 단위: 만원)
    if (foodF.value !== '전체') {
      const fMin = h.foodMin ?? 0
      const fMax = h.foodMax ?? fMin
      if (foodF.value === '5만원 이하' && fMax > 5) return false
      if (foodF.value === '5-7만원' && (fMax < 5 || fMin > 7)) return false
      if (foodF.value === '7-10만원' && (fMax < 7 || fMin > 10)) return false
      if (foodF.value === '10만원 이상' && fMin < 10) return false
    }
    // 보증인원 필터
    if (guestF.value !== '전체') {
      const cap = h.minPpl ?? h.maxPpl ?? 0
      const capMax = h.maxPpl ?? cap
      if (guestF.value === '20-50명' && capMax > 50) return false
      if (guestF.value === '51-100명' && (capMax < 51 || cap > 100)) return false
      if (guestF.value === '101-200명' && (capMax < 101 || cap > 200)) return false
      if (guestF.value === '201-300명' && (capMax < 201 || cap > 300)) return false
      if (guestF.value === '300명 이상' && capMax < 300) return false
    }
    // 검색어
    if (qq) {
      const name = h.name.toLowerCase()
      const loc = h.location.toLowerCase()
      if (!name.includes(qq) && !loc.includes(qq)) return false
    }
    return true
  })
})

watch(filtered, (list) => {
  if (selected.value && !list.some((h) => h.id === selected.value!.id)) {
    selected.value = null
  }
})

function onMapSelect(h: Hall) {
  selected.value = h
}

function supabaseReady(): boolean {
  const u = String(
    (config.public as { supabase?: { url?: string } }).supabase?.url ??
      config.public.supabaseUrl ??
      '',
  ).trim()
  return Boolean(u)
}

const BW_HALL_SELECT =
  'id, name, region_city, region_district, address, phone, lat, lng, hall_type, food_type, capacity_min, capacity_max, food_price_min, food_price_max, tags, mood, thumb_url' as const

async function loadHallsInBounds(b: {
  south: number
  west: number
  north: number
  east: number
}) {
  if (!import.meta.client || !supabaseReady()) return

  try {
    const { data, error } = await supabase
      .from('bw_halls')
      .select(BW_HALL_SELECT)
      .eq('status', 'active')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .gte('lat', b.south)
      .lte('lat', b.north)
      .gte('lng', b.west)
      .lte('lng', b.east)
      .limit(800)

    if (error) throw error

    const rows = (data ?? []) as BwHallRow[]
    const mapped = rows
      .map((row) => bwRowToHall(row))
      .filter((x): x is Hall => x != null)

    if (mapped.length > 0) {
      mapHalls.value = mapped
      remoteHallsLoadedOnce.value = true
    } else if (remoteHallsLoadedOnce.value) {
      mapHalls.value = []
    }
    /* else: 첫 응답이 0건 → mapHalls 유지(undefined), 데모 HALLS 계속 */
  } catch (e) {
    console.error('[HallPage] bw_halls viewport fetch failed:', e)
  }
}

function onMapBounds(b: {
  south: number
  west: number
  north: number
  east: number
}) {
  if (debounceBounds) clearTimeout(debounceBounds)
  debounceBounds = setTimeout(() => {
    loadHallsInBounds(b)
  }, 400)
}

onUnmounted(() => {
  if (debounceBounds) clearTimeout(debounceBounds)
})
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }"
  >
    <!-- 상단: 검색 + 필터 한 줄 -->
    <div class="top-bar">
      <!-- 검색 -->
      <div class="search-box">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5" />
          <path d="M9.5 9.5L12.5 12.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <input v-model="q" class="search-input" placeholder="웨딩홀 이름, 지역 검색..." />
      </div>
      <!-- 필터 구분선 -->
      <div class="filter-divider" />
      <!-- 필터 칩 -->
      <div class="filter-chips">
        <HallFilterChip v-model="hallTypeF" label="홀 유형" :options="HALL_TYPE_OPTIONS" />
        <HallFilterChip v-model="foodF" label="식대" :options="FOOD_OPTIONS" />
        <HallFilterChip v-model="guestF" label="보증인원" :options="GUEST_OPTIONS" />
      </div>
    </div>

    <div
      class="hall-main-row"
      :style="{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }"
    >
      <div v-if="selected" class="hall-aside-panel">
        <HallDetail :hall="selected" @back="selected = null" />
      </div>

      <HallMapView
        :halls="filtered"
        :selected-id="selected?.id ?? null"
        @select="onMapSelect"
        @bounds-change="onMapBounds"
      />
    </div>
  </div>
</template>

<style scoped>
/* 검색 + 필터 한 줄 바 */
.top-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 8px 12px;
  border-bottom: 1px solid v-bind('BORDER');
  background: #fff;
  position: relative;
  z-index: 10001;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
  padding: 0 10px;
}
.search-icon { flex-shrink: 0; }
.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 13px;
  font-family: inherit;
  color: v-bind('TEXT');
  background: transparent;
  padding: 8px 0;
}
.search-input::placeholder { color: #bbb; }

.filter-divider {
  width: 1px;
  height: 20px;
  background: v-bind('BORDER');
  flex-shrink: 0;
  margin: 0 4px;
}

.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }

.hall-main-row {
  position: relative;
}

/* 패널: flex 아이템으로 지도를 밀어냄 — 지도 컨테이너가 패널 뒤에 깔리지 않음 */
.hall-aside-panel {
  width: 390px;
  max-width: min(390px, 50%);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid v-bind('BORDER');
  background: #fff;
  overflow: hidden;
}
</style>
