<script setup lang="ts">
import type { Hall } from '~/data/wedding'
import {
  useHallDetail,
  type HallDetailRow,
  resolveFoodWonRange,
  resolveGuaranteeRange,
} from '~/composables/useHallDetail'
import {
  formatManwonRange,
  labelsFromSourceLink,
  sourceTypeLabel,
  displayUrlHost,
} from '~/utils/hallDetail'

const { PRIMARY, PRIMARY_SOFT, TEXT, MUTED, BORDER } = useThemeColors()
const { openAuthModal } = useAuthModal()
const user = useSupabaseUser()

const props = defineProps<{
  hall: Hall
}>()

defineEmits<{
  back: []
}>()

const { fetchHallDetail, fetchRegionAvgFoodMid } = useHallDetail()
const { bookmarkedIds, myHallIds, toggleBookmark } = useBookmark()

const detail = ref<HallDetailRow | null>(null)
const loadError = ref<string | null>(null)
const regionAvgMid = ref<number | null>(null)

const isUuid = computed(() => typeof props.hall.id === 'string')

const activeRoomTab = ref(0)

async function loadDetail() {
  if (!isUuid.value) {
    detail.value = null
    regionAvgMid.value = null
    loadError.value = null
    return
  }
  const { hall, error } = await fetchHallDetail(props.hall.id as string)
  if (error) {
    loadError.value = error.message
    detail.value = null
    return
  }
  loadError.value = null
  detail.value = hall
  activeRoomTab.value = 0
  if (hall?.region_city) {
    regionAvgMid.value = await fetchRegionAvgFoodMid(hall.region_city)
  } else {
    regionAvgMid.value = null
  }
}

watch(
  () => props.hall.id,
  () => {
    loadDetail()
  },
  { immediate: true },
)

const addressLine = computed(() => {
  const a = detail.value?.address?.trim()
  if (a) return a
  return props.hall.location?.trim() || ''
})

const foodWon = computed(() => resolveFoodWonRange(props.hall, detail.value))
const foodManwonLabel = computed(() =>
  formatManwonRange(foodWon.value.min, foodWon.value.max),
)

const foodMidWon = computed(() => {
  const { min, max } = foodWon.value
  if (min == null && max == null) return null
  return ((min ?? 0) + (max ?? 0)) / 2
})

const diffPct = computed(() => {
  if (foodMidWon.value == null || regionAvgMid.value == null) return null
  if (regionAvgMid.value === 0) return null
  return Math.round(
    ((foodMidWon.value - regionAvgMid.value) / regionAvgMid.value) * 100,
  )
})

const guarantee = computed(() => resolveGuaranteeRange(props.hall, detail.value))
const guaranteeLabel = computed(() => {
  const { min, max } = guarantee.value
  if (min != null && max != null) return `${min}~${max}명`
  if (min != null) return `${min}명~`
  if (max != null) return `~${max}명`
  return null
})

const rooms = computed(() => detail.value?.bw_hall_rooms ?? [])
const currentRoom = computed(() => rooms.value[activeRoomTab.value] ?? null)

const costs = computed(() => detail.value?.bw_hall_costs ?? [])
const dinings = computed(() => detail.value?.bw_hall_dinings ?? [])
const sources = computed(() => detail.value?.bw_hall_sources ?? [])

function sourceBadgeCount(link: string | null | undefined): number {
  return labelsFromSourceLink(link).length
}

const isBookmarked = computed(() =>
  typeof props.hall.id === 'string' ? bookmarkedIds.value.has(props.hall.id) : false,
)
const isMyHall = computed(() =>
  typeof props.hall.id === 'string' ? myHallIds.value.has(props.hall.id) : false,
)

function onBookmarkClick() {
  if (!user.value) {
    openAuthModal()
    return
  }
  if (typeof props.hall.id === 'string') {
    toggleBookmark(props.hall.id, 'wishlist')
  }
}

function onMyHallClick() {
  if (!user.value) {
    openAuthModal()
    return
  }
  if (typeof props.hall.id === 'string') {
    toggleBookmark(props.hall.id, 'my_hall')
  }
}

const showEstimate = computed(
  () =>
    Boolean(foodManwonLabel.value) ||
    diffPct.value != null ||
    Boolean(guaranteeLabel.value),
)

const showRoomSection = computed(() => {
  if (rooms.value.length > 0) return true
  const dc = detail.value?.detail_content?.trim()
  return Boolean(dc)
})

const showDiningSection = computed(() => {
  if (dinings.value.length > 0) return true
  const ft = detail.value?.food_type?.[0] ?? props.hall.food
  return Boolean(ft?.trim())
})

const showTransportSection = computed(() => {
  const d = detail.value
  if (!d && !isUuid.value) return false
  return Boolean(
    d?.total_parking != null ||
      d?.free_parking_min != null ||
      (d?.parking_info && d.parking_info.trim()) ||
      (d?.transport && d.transport.trim()) ||
      d?.has_shuttle === true ||
      (d?.elevator_info && d.elevator_info.trim()) ||
      (d?.atm_location && d.atm_location.trim()),
  )
})

const showCostSection = computed(() => costs.value.length > 0)

const showContractSection = computed(() =>
  costs.value.some(
    (c) =>
      (c.contract_info && c.contract_info.trim()) ||
      (c.external_corp && c.external_corp.trim()),
  ),
)

const showSourcesSection = computed(() => sources.value.length > 0)
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto',
    }"
  >
    <!-- 헤더 -->
    <div
      :style="{
        padding: '10px 16px',
        borderBottom: `1px solid ${BORDER}`,
        fontSize: '13px',
        color: PRIMARY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }"
    >
      <span :style="{ cursor: 'pointer' }" @click="$emit('back')">← 목록으로</span>
      <div :style="{ display: 'flex', gap: '12px', alignItems: 'center' }">
        <span
          :style="{ fontSize: '18px', cursor: 'pointer', color: isBookmarked ? '#E05B5B' : MUTED, transition: 'color 0.15s' }"
          title="관심홀"
          @click="onBookmarkClick"
          >{{ isBookmarked ? '♥' : '♡' }}</span
        >
        <span
          :style="{ fontSize: '18px', cursor: 'pointer', color: isMyHall ? '#C4A059' : MUTED, transition: 'color 0.15s' }"
          title="나의홀"
          @click="onMyHallClick"
          >{{ isMyHall ? '★' : '☆' }}</span
        >
      </div>
    </div>

    <p
      v-if="loadError"
      :style="{ padding: '8px 16px', fontSize: '12px', color: '#c00', margin: 0 }"
    >
      상세 정보를 불러오지 못했습니다. {{ loadError }}
    </p>

    <!-- 기본 정보 -->
    <div
      :style="{
        padding: '16px 16px 12px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '6px',
        }"
      >
        <div>
          <div :style="{ fontSize: '20px', fontWeight: 700, color: TEXT, marginBottom: '4px' }">
            {{ detail?.name ?? hall.name }}
          </div>
          <div :style="{ fontSize: '12px', color: MUTED }">
            {{ addressLine || '주소 정보 없음' }}
          </div>
        </div>
      </div>
      <div
        v-if="(detail?.phone ?? hall.phone) && (detail?.phone ?? hall.phone) !== '문의'"
        :style="{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }"
      >
        <span :style="{ fontSize: '12px', color: PRIMARY }"
          >📞 {{ detail?.phone ?? hall.phone }}</span
        >
        <a
          v-if="detail?.website_url?.trim()"
          :href="detail.website_url"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ fontSize: '12px', color: MUTED }"
          >🌐 홈페이지</a
        >
        <span
          :style="{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${BORDER}`,
            color: MUTED,
          }"
        >
          {{ detail?.is_verified ? '업체인증' : '업체인증전' }}
        </span>
      </div>
      <div v-else :style="{ marginBottom: '8px' }">
        <a
          v-if="detail?.website_url?.trim()"
          :href="detail!.website_url!"
          target="_blank"
          rel="noopener noreferrer"
          :style="{ fontSize: '12px', color: MUTED }"
          >🌐 홈페이지</a
        >
        <span
          :style="{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${BORDER}`,
            color: MUTED,
            marginLeft: '8px',
          }"
        >
          {{ detail?.is_verified ? '업체인증' : '업체인증전' }}
        </span>
      </div>
      <button
        type="button"
        :style="{
          width: '100%',
          padding: '10px 0',
          background: PRIMARY,
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }"
      >
        <span>💬</span> 예비부부 대기실 이동
      </button>
    </div>

    <!-- 예상 견적 -->
    <div
      v-if="showEstimate"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">≡ 예상 견적</span>
        <span
          v-if="costs[0]?.source_link && sourceBadgeCount(costs[0].source_link) > 0"
          :style="{ fontSize: '11px', color: PRIMARY }"
        >
          {{
            labelsFromSourceLink(costs[0].source_link)[0]
          }}
          +{{ Math.max(0, sourceBadgeCount(costs[0].source_link) - 1) }}
        </span>
      </div>

      <div
        v-if="foodManwonLabel"
        :style="{
          background: '#FAFBFF',
          borderRadius: '8px',
          padding: '12px 14px',
          marginBottom: '8px',
        }"
      >
        <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '4px' }">식대 (1인)</div>
        <div :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }">
          <div>
            <div :style="{ fontSize: '22px', fontWeight: 700, color: TEXT }">
              {{ foodManwonLabel }}
            </div>
            <div
              v-if="diffPct != null"
              :style="{ fontSize: '11px', color: MUTED, marginTop: '2px' }"
            >
              지역 평균 대비 약 {{ Math.abs(diffPct) }}%
              {{ diffPct < 0 ? '저렴' : '비쌈' }}
            </div>
          </div>
          <svg width="70" height="38" viewBox="0 0 70 38" aria-hidden="true">
            <path
              d="M5,32 C15,32 20,8 35,6 C50,4 55,32 65,32"
              :stroke="PRIMARY"
              stroke-width="2"
              fill="none"
              stroke-linecap="round"
            />
            <line
              x1="35"
              y1="6"
              x2="35"
              y2="34"
              :stroke="PRIMARY"
              stroke-width="1"
              stroke-dasharray="2,2"
            />
            <circle cx="35" cy="34" r="3" :fill="PRIMARY" />
          </svg>
        </div>
      </div>

      <div
        v-if="guaranteeLabel"
        :style="{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }"
      >
        <span :style="{ fontSize: '13px', color: TEXT }">보증인원</span>
        <span :style="{ fontSize: '14px', fontWeight: 600, color: PRIMARY }">{{
          guaranteeLabel
        }}</span>
      </div>
    </div>

    <!-- 홀 컨디션 -->
    <div
      v-if="showRoomSection"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">🏛 홀 컨디션</span>
        <span
          v-if="currentRoom?.source_link && sourceBadgeCount(currentRoom.source_link) > 0"
          :style="{ fontSize: '11px', color: PRIMARY }"
        >
          {{ labelsFromSourceLink(currentRoom.source_link)[0] }} +{{
            Math.max(0, sourceBadgeCount(currentRoom.source_link) - 1)
          }}
        </span>
      </div>

      <div
        v-if="rooms.length > 1"
        :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }"
      >
        <button
          v-for="(r, idx) in rooms"
          :key="idx"
          type="button"
          :style="{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '99px',
            border: `1px solid ${BORDER}`,
            background: activeRoomTab === idx ? PRIMARY_SOFT : '#fff',
            color: activeRoomTab === idx ? PRIMARY : MUTED,
            cursor: 'pointer',
          }"
          @click="activeRoomTab = idx"
        >
          {{ r.name || `홀 ${idx + 1}` }}
        </button>
      </div>

      <template v-if="currentRoom">
        <div
          v-if="currentRoom.name?.trim()"
          :style="{ fontSize: '15px', fontWeight: 600, color: TEXT, marginBottom: '6px' }"
        >
          {{ currentRoom.name }}
        </div>
        <div
          v-if="currentRoom.feature?.trim() || detail?.detail_content?.trim()"
          :style="{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '8px' }"
        >
          {{ currentRoom.feature?.trim() || detail?.detail_content }}
        </div>
        <div
          v-if="currentRoom.mood?.trim()"
          :style="{ fontSize: '12px', color: MUTED, marginBottom: '6px' }"
        >
          분위기: {{ currentRoom.mood }}
        </div>
        <div
          v-if="currentRoom.bride_room?.trim()"
          :style="{ fontSize: '12px', color: PRIMARY, lineHeight: 1.6, marginBottom: '8px' }"
        >
          {{ currentRoom.bride_room }}
        </div>
      </template>
      <template v-else-if="detail?.detail_content?.trim()">
        <div :style="{ fontSize: '13px', color: '#555', lineHeight: 1.7 }">
          {{ detail.detail_content }}
        </div>
      </template>

      <div
        v-if="(detail?.tags?.length ?? hall.tags?.length)"
        :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }"
      >
        <span
          v-for="t in detail?.tags ?? hall.tags"
          :key="t"
          :style="{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '99px',
            background: '#F0F2FF',
            color: PRIMARY,
            fontWeight: 500,
          }"
        >
          #{{ t }}
        </span>
      </div>
    </div>

    <!-- 식사 및 평가 -->
    <div
      v-if="showDiningSection"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">🍽️ 식사 및 평가</span>
        <span
          v-if="dinings[0]?.source_link && sourceBadgeCount(dinings[0].source_link) > 0"
          :style="{ fontSize: '11px', color: PRIMARY }"
        >
          {{ labelsFromSourceLink(dinings[0].source_link)[0] }} +{{
            Math.max(0, sourceBadgeCount(dinings[0].source_link) - 1)
          }}
        </span>
      </div>

      <div
        v-for="(d, di) in dinings.length ? dinings : [null]"
        :key="di"
        :style="{ marginBottom: dinings.length > 1 ? '14px' : '0' }"
      >
        <div
          v-if="d?.food_type?.trim() || (!d && (detail?.food_type?.[0] || hall.food))"
          :style="{ fontSize: '14px', fontWeight: 600, color: TEXT, marginBottom: '6px' }"
        >
          {{ d?.food_type?.trim() || detail?.food_type?.[0] || hall.food }}
        </div>
        <div
          v-if="d?.menu_info?.trim()"
          :style="{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '6px' }"
        >
          {{ d.menu_info }}
        </div>
        <div
          v-if="d?.family_room?.trim()"
          :style="{ fontSize: '12px', color: MUTED, marginBottom: '4px' }"
        >
          혼주 식사룸: {{ d.family_room }}
        </div>
        <div
          v-if="d?.review_score != null"
          :style="{ fontSize: '12px', color: TEXT, marginBottom: '4px' }"
        >
          별점 {{ d.review_score }}
        </div>
        <div
          v-if="d?.taste_pros?.trim() || d?.taste_cons?.trim()"
          :style="{
            fontSize: '12px',
            color: '#555',
            lineHeight: 1.6,
            padding: '8px 10px',
            background: '#FAFBFF',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`,
          }"
        >
          <template v-if="d?.taste_pros?.trim()">+ {{ d.taste_pros }}</template>
          <template v-if="d?.taste_pros?.trim() && d?.taste_cons?.trim()"><br /></template>
          <template v-if="d?.taste_cons?.trim()">− {{ d.taste_cons }}</template>
        </div>
      </div>
    </div>

    <!-- 교통 및 주차 -->
    <div
      v-if="showTransportSection"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">🚗 교통 및 주차</span>
      </div>
      <div :style="{ display: 'flex', gap: '10px', flexWrap: 'wrap' }">
        <div
          :style="{
            flex: '1 1 140px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`,
            background: '#FAFBFF',
          }"
        >
          <div :style="{ fontSize: '12px', fontWeight: 600, color: TEXT, marginBottom: '4px' }">
            주차
            <template v-if="detail?.total_parking != null"> ({{ detail.total_parking }}대)</template>
          </div>
          <div v-if="detail?.free_parking_min != null" :style="{ fontSize: '12px', color: MUTED }">
            {{ detail.free_parking_min }}분 무료
          </div>
          <div
            v-if="detail?.parking_info?.trim()"
            :style="{ fontSize: '12px', color: '#555', lineHeight: 1.6, marginTop: '4px' }"
          >
            {{ detail.parking_info }}
          </div>
        </div>
        <div
          :style="{
            flex: '1 1 140px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`,
            background: '#FAFBFF',
          }"
        >
          <div :style="{ fontSize: '12px', fontWeight: 600, color: TEXT, marginBottom: '4px' }">
            대중교통 · 기타
          </div>
          <div
            v-if="detail?.transport?.trim()"
            :style="{ fontSize: '12px', color: '#555', lineHeight: 1.6 }"
          >
            {{ detail.transport }}
          </div>
          <div v-if="detail?.has_shuttle === true" :style="{ fontSize: '12px', color: MUTED, marginTop: '4px' }">
            셔틀 운행
          </div>
          <div
            v-if="detail?.elevator_info?.trim()"
            :style="{ fontSize: '12px', color: '#555', marginTop: '4px' }"
          >
            엘리베이터: {{ detail.elevator_info }}
          </div>
          <div v-if="detail?.atm_location?.trim()" :style="{ fontSize: '12px', color: MUTED, marginTop: '4px' }">
            ATM: {{ detail.atm_location }}
          </div>
        </div>
      </div>
    </div>

    <!-- 비용 정보 -->
    <div
      v-if="showCostSection"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }"
          >비용 정보 (식대·보증·대관료)</span
        >
        <span
          v-if="costs[0]?.source_link && sourceBadgeCount(costs[0].source_link) > 0"
          :style="{ fontSize: '11px', color: PRIMARY }"
        >
          {{ labelsFromSourceLink(costs[0].source_link)[0] }} +{{
            Math.max(0, sourceBadgeCount(costs[0].source_link) - 1)
          }}
        </span>
      </div>
      <div v-for="(c, ci) in costs" :key="ci" :style="{ marginBottom: '12px' }">
        <div v-if="c.target_date?.trim()" :style="{ fontSize: '11px', color: MUTED, marginBottom: '4px' }">
          기준: {{ c.target_date }}
        </div>
        <div v-if="c.meal_cost_text?.trim()" :style="{ fontSize: '13px', color: '#555', marginBottom: '4px' }">
          식대: {{ c.meal_cost_text }}
        </div>
        <div
          v-if="c.guarantee_text?.trim()"
          :style="{ fontSize: '13px', color: '#555', marginBottom: '4px' }"
        >
          보증: {{ c.guarantee_text }}
        </div>
        <div v-if="c.rental_cost_text?.trim()" :style="{ fontSize: '13px', color: '#555', marginBottom: '4px' }">
          대관료: {{ c.rental_cost_text }}
          <template
            v-if="c.rental_cost_min != null || c.rental_cost_max != null"
          >
            ({{ formatManwonRange(c.rental_cost_min, c.rental_cost_max) }})
          </template>
        </div>
        <div v-else-if="c.rental_cost_min != null || c.rental_cost_max != null" :style="{ fontSize: '13px', color: '#555' }">
          대관료: {{ formatManwonRange(c.rental_cost_min, c.rental_cost_max) }}
        </div>
        <div v-if="c.add_cost?.trim()" :style="{ fontSize: '12px', color: MUTED, marginTop: '4px' }">
          추가 비용: {{ c.add_cost }}
        </div>
      </div>
    </div>

    <!-- 계약 정보 -->
    <div
      v-if="showContractSection"
      :style="{
        padding: '14px 16px',
        borderBottom: `1px solid ${BORDER}`,
        flexShrink: 0,
      }"
    >
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }"
      >
        <span :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">계약 정보</span>
      </div>
      <div v-for="(c, ci) in costs" :key="'ct-' + ci">
        <div
          v-if="c.contract_info?.trim()"
          :style="{ fontSize: '13px', color: '#555', lineHeight: 1.7, marginBottom: '8px' }"
        >
          {{ c.contract_info }}
        </div>
        <div v-if="c.external_corp?.trim()" :style="{ fontSize: '12px', color: MUTED }">
          외부업체: {{ c.external_corp }}
        </div>
      </div>
    </div>

    <!-- 면책 -->
    <div
      :style="{
        padding: '12px 16px',
        borderBottom: `1px solid ${BORDER}`,
        background: '#FFF8F9',
        flexShrink: 0,
      }"
    >
      <div :style="{ fontSize: '12px', color: MUTED, lineHeight: 1.6 }">
        💡 수집된 정보에 실수가 있을 수 있어요. 방문 전 상세 조건을 다시 확인해 주세요.
      </div>
    </div>

    <!-- 출처 링크 -->
    <div v-if="showSourcesSection" :style="{ padding: '14px 16px', flexShrink: 0 }">
      <div :style="{ fontSize: '13px', fontWeight: 600, color: TEXT, marginBottom: '10px' }">
        출처 링크
      </div>
      <a
        v-for="(s, si) in sources"
        :key="s.id ?? s.url + si"
        :href="s.url"
        target="_blank"
        rel="noopener noreferrer"
        :style="{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          padding: '8px 0',
          borderBottom: si < sources.length - 1 ? `1px solid ${BORDER}` : 'none',
          textDecoration: 'none',
          color: TEXT,
        }"
      >
        <span :style="{ fontSize: '11px', color: PRIMARY, flexShrink: 0, minWidth: '88px' }">{{
          sourceTypeLabel(s.source_type)
        }}</span>
        <span :style="{ fontSize: '13px', flex: 1, lineHeight: 1.4 }">{{
          s.title?.trim() || displayUrlHost(s.url)
        }}</span>
        <span :style="{ color: MUTED, flexShrink: 0 }">↗</span>
      </a>
    </div>
  </div>
</template>
