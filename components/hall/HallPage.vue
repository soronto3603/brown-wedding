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
const showDropdown = ref(false)
const selected = ref<Hall | null>(null)
const searchBoxRef = ref<HTMLElement | null>(null)

const HALL_TYPE_OPTIONS = ['전체', '웨딩홀', '호텔', '컨벤션', '교회', '대학', '채플', '한옥', '전통', '복합', '야외']
const FOOD_OPTIONS = ['전체', '5만원 이하', '5-7만원', '7-10만원', '10만원 이상']
const GUEST_OPTIONS = ['전체', '20-50명', '51-100명', '101-200명', '201-300명', '300명 이상']

/**
 * `undefined`: Supabase로 아직 대체하지 않음 → 데모 `HALLS` 사용.
 * 배열: Supabase 뷰포트 결과(빈 배열 = 이 구역에 홀 없음).
 */
const mapHalls = ref<Hall[] | undefined>(undefined)
const remoteHallsLoadedOnce = ref(false)
let debounceBounds: ReturnType<typeof setTimeout> | null = null

const baseHalls = computed(() =>
  mapHalls.value !== undefined ? mapHalls.value : HALLS,
)

/** 지도에 표시되는 홀 — 텍스트 검색 제외, 칩 필터만 적용 */
const filtered = computed(() => {
  return baseHalls.value.filter((h) => {
    if (hallTypeF.value !== '전체') {
      const types = h.hallTypes ?? h.tags ?? []
      if (!types.some((t: string) => t.includes(hallTypeF.value) || hallTypeF.value.includes(t))) return false
    }
    if (foodF.value !== '전체') {
      const fMin = h.foodMin ?? 0
      const fMax = h.foodMax ?? fMin
      if (foodF.value === '5만원 이하' && fMax > 5) return false
      if (foodF.value === '5-7만원' && (fMax < 5 || fMin > 7)) return false
      if (foodF.value === '7-10만원' && (fMax < 7 || fMin > 10)) return false
      if (foodF.value === '10만원 이상' && fMin < 10) return false
    }
    if (guestF.value !== '전체') {
      const cap = h.minPpl ?? h.maxPpl ?? 0
      const capMax = h.maxPpl ?? cap
      if (guestF.value === '20-50명' && capMax > 50) return false
      if (guestF.value === '51-100명' && (capMax < 51 || cap > 100)) return false
      if (guestF.value === '101-200명' && (capMax < 101 || cap > 200)) return false
      if (guestF.value === '201-300명' && (capMax < 201 || cap > 300)) return false
      if (guestF.value === '300명 이상' && capMax < 300) return false
    }
    return true
  })
})

/** 검색 드롭다운 결과 — 전체 baseHalls에서 텍스트 매칭 */
const searchResults = computed(() => {
  const qq = q.value.trim().toLowerCase()
  if (!qq) return []
  return baseHalls.value
    .filter((h) => {
      const name = h.name.toLowerCase()
      const loc = h.location.toLowerCase()
      return name.includes(qq) || loc.includes(qq)
    })
    .slice(0, 12)
})

watch(q, (val) => {
  showDropdown.value = val.trim().length > 0
})

function selectHall(h: Hall) {
  selected.value = h
  q.value = ''
  showDropdown.value = false
}

function onMapSelect(h: Hall) {
  selected.value = h
}

function clearSearch() {
  q.value = ''
  showDropdown.value = false
}

function onOutsideSearchClick(e: MouseEvent) {
  if (searchBoxRef.value && !searchBoxRef.value.contains(e.target as Node)) {
    showDropdown.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', onOutsideSearchClick))
onUnmounted(() => {
  document.removeEventListener('mousedown', onOutsideSearchClick)
  if (debounceBounds) clearTimeout(debounceBounds)
})

function hallKindLabel(h: Hall): string {
  const types = h.hallTypes ?? h.tags ?? []
  return types[0] ?? h.markerKind ?? ''
}
function foodLabel(h: Hall): string {
  const min = h.foodMin ?? 0
  const max = h.foodMax ?? min
  if (!min && !max) return ''
  if (min === max) return `식대 ${min}만원`
  return `식대 ${min}~${max}만원`
}
function guestLabel(h: Hall): string {
  const min = h.minPpl ?? 0
  const max = h.maxPpl ?? min
  if (!min && !max) return ''
  if (min === max) return `보증 ${min}명`
  return `보증 ${min}~${max}명`
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
  south: number; west: number; north: number; east: number
}) {
  if (!import.meta.client || !supabaseReady()) return
  try {
    const { data, error } = await supabase
      .from('bw_halls')
      .select(BW_HALL_SELECT)
      .eq('status', 'active')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .gte('lat', b.south).lte('lat', b.north)
      .gte('lng', b.west).lte('lng', b.east)
      .limit(800)
    if (error) throw error
    const rows = (data ?? []) as BwHallRow[]
    const mapped = rows.map((row) => bwRowToHall(row)).filter((x): x is Hall => x != null)
    if (mapped.length > 0) { mapHalls.value = mapped; remoteHallsLoadedOnce.value = true }
    else if (remoteHallsLoadedOnce.value) { mapHalls.value = [] }
  } catch (e) {
    console.error('[HallPage] bw_halls viewport fetch failed:', e)
  }
}

function onMapBounds(b: { south: number; west: number; north: number; east: number }) {
  if (debounceBounds) clearTimeout(debounceBounds)
  debounceBounds = setTimeout(() => loadHallsInBounds(b), 400)
}
</script>

<template>
  <div class="hall-page">
    <!-- 상단: 검색 + 필터 한 줄 -->
    <div class="top-bar">
      <!-- 검색 박스 (드롭다운 포함) -->
      <div ref="searchBoxRef" class="search-wrap">
        <div class="search-box">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#aaa" stroke-width="1.5" />
            <path d="M9.5 9.5L12.5 12.5" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input
            v-model="q"
            class="search-input"
            placeholder="웨딩홀 이름, 지역 검색..."
            @focus="showDropdown = q.trim().length > 0"
          />
          <button v-if="q" class="search-clear" @click="clearSearch">
            <svg width="12" height="12" viewBox="0 0 12 12">
              <path d="M1 1l10 10M11 1L1 11" stroke="#aaa" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- 검색 결과 드롭다운 -->
        <Teleport to="body">
          <Transition name="search-drop">
            <div
              v-if="showDropdown && searchResults.length > 0"
              class="search-dropdown"
              :style="searchBoxRef ? {
                top: (searchBoxRef.getBoundingClientRect().bottom + 4) + 'px',
                left: searchBoxRef.getBoundingClientRect().left + 'px',
                width: searchBoxRef.getBoundingClientRect().width + 'px',
              } : {}"
            >
              <div
                v-for="h in searchResults"
                :key="h.id"
                class="search-item"
                @click="selectHall(h)"
              >
                <div class="search-item-top">
                  <span class="search-item-name">{{ h.name }}</span>
                  <span v-if="hallKindLabel(h)" class="search-item-kind">{{ hallKindLabel(h) }}</span>
                </div>
                <div class="search-item-loc">{{ h.location }}</div>
                <div v-if="foodLabel(h) || guestLabel(h)" class="search-item-tags">
                  <span v-if="foodLabel(h)" class="search-tag">{{ foodLabel(h) }}</span>
                  <span v-if="guestLabel(h)" class="search-tag">{{ guestLabel(h) }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
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

    <div class="hall-main-row">
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
.hall-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* 검색 + 필터 한 줄 바 */
.top-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid v-bind('BORDER');
  background: #fff;
  position: relative;
  z-index: 10001;
  gap: 0;
}

/* 검색 영역 */
.search-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
}
.search-box {
  display: flex;
  align-items: center;
  gap: 6px;
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
.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 검색 드롭다운 (Teleport → body) */
.search-dropdown {
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.13);
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
}
.search-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.1s;
}
.search-item:last-child { border-bottom: none; }
.search-item:hover { background: #fafafa; }
.search-item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}
.search-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #111;
}
.search-item-kind {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 99px;
  background: v-bind('PRIMARY');
  color: #fff;
}
.search-item-loc {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}
.search-item-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.search-tag {
  font-size: 11px;
  color: #666;
  background: #f4f4f4;
  padding: 2px 8px;
  border-radius: 99px;
}

/* 구분선 */
.filter-divider {
  width: 1px;
  height: 20px;
  background: v-bind('BORDER');
  flex-shrink: 0;
  margin: 0 6px;
}

/* 필터 칩 */
.filter-chips {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.filter-chips::-webkit-scrollbar { display: none; }

/* 지도 영역 */
.hall-main-row {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
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

/* 드롭다운 트랜지션 */
.search-drop-enter-active, .search-drop-leave-active { transition: opacity 0.15s, transform 0.15s; }
.search-drop-enter-from, .search-drop-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
