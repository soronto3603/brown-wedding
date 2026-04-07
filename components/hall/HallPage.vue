<script setup lang="ts">
import type { Hall } from '~/data/wedding'
import {
  HALLS,
  hallMatchesFoodRange,
  hallMatchesGuestRange,
} from '~/data/wedding'
import type { BwHallRow } from '~/utils/bwHallMapper'
import { bwRowToHall } from '~/utils/bwHallMapper'

const { PRIMARY, TEXT, MUTED, BORDER } = useThemeColors()
const config = useRuntimeConfig()
const supabase = useSupabaseClient()

const moodF = ref('전체')
const foodF = ref('전체')
const minF = ref('전체')
const q = ref('')
const selected = ref<Hall | null>(null)

/**
 * `undefined`: Supabase로 아직 대체하지 않음 → 데모 `HALLS` 사용.
 * 배열: Supabase 뷰포트 결과(빈 배열 = 이 구역에 홀 없음).
 * 첫 fetch가 0건이면 `[]`로 덮지 않음(데모가 잠깐 보였다 사라지는 현상 방지).
 */
const mapHalls = ref<Hall[] | undefined>(undefined)
/** 한 번이라도 뷰포트에서 홀을 받은 뒤에는, 빈 구역도 `[]`로 반영 */
const remoteHallsLoadedOnce = ref(false)

let debounceBounds: ReturnType<typeof setTimeout> | null = null

const selStyle = computed(() => ({
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: 500,
  padding: '6px 28px 6px 12px',
  border: `1px solid ${BORDER}`,
  borderRadius: '99px',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%239B9B9B'/%3E%3C/svg%3E\")",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
  backgroundSize: '10px 6px',
  backgroundColor: '#fff',
  appearance: 'none',
  WebkitAppearance: 'none',
  color: TEXT,
  cursor: 'pointer',
  outline: 'none',
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  flexShrink: 0,
  minWidth: '96px',
}))

const baseHalls = computed(() =>
  mapHalls.value !== undefined ? mapHalls.value : HALLS,
)

const filtered = computed(() => {
  const qq = q.value.trim().toLowerCase()
  return baseHalls.value.filter((h) => {
    if (moodF.value !== '전체' && h.mood !== moodF.value) return false
    if (!hallMatchesFoodRange(h, foodF.value)) return false
    if (!hallMatchesGuestRange(h, minF.value)) return false
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
    <!-- 상단: 1행 검색 / 2행 필터 — 좁은 패널(Simple Browser)에서 한 줄 배치 시 필터가 가로 스크롤 밖으로 밀려 안 보이는 문제 방지 -->
    <div
      :style="{
        flexShrink: 0,
        padding: '8px 12px',
        borderBottom: `1px solid ${BORDER}`,
        background: '#fff',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minHeight: '40px',
        }"
      >
        <div
          :style="{
            flex: 1,
            minWidth: 0,
            maxWidth: '480px',
            display: 'flex',
            alignItems: 'center',
            border: `1px solid ${BORDER}`,
            borderRadius: '99px',
            padding: '0 12px',
            gap: '6px',
            background: '#FAFAFA',
          }"
        >
          <span :style="{ fontSize: '13px', color: MUTED, flexShrink: 0 }">🔍</span>
          <input
            v-model="q"
            placeholder="웨딩홀 이름, 지역 검색..."
            :style="{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              background: 'transparent',
              color: TEXT,
              padding: '7px 0',
            }"
          />
        </div>
        <div
          :style="{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: PRIMARY,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
          }"
        >
          👤
        </div>
      </div>
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
        }"
      >
        <select v-model="moodF" :style="selStyle">
          <option>전체</option>
          <option>럭셔리</option>
          <option>모던</option>
          <option>클래식</option>
        </select>
        <select v-model="foodF" :style="selStyle">
          <option>전체</option>
          <option>~6만원</option>
          <option>6~9만원</option>
          <option>9만원~</option>
        </select>
        <select v-model="minF" :style="selStyle">
          <option>전체</option>
          <option>~100명</option>
          <option>100~200명</option>
          <option>200명~</option>
        </select>
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
