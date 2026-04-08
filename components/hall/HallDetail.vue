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
  sourceBadgeText,
} from '~/utils/hallDetail'

const { PRIMARY, TEXT, MUTED, BORDER } = useThemeColors()
const { openAuthModal } = useAuthModal()
const user = useSupabaseUser()

const props = defineProps<{ hall: Hall }>()
defineEmits<{ back: [] }>()

const { fetchHallDetail, fetchRegionAvgFoodMid } = useHallDetail()
const { bookmarkedIds, myHallIds, toggleBookmark } = useBookmark()

const detail = ref<HallDetailRow | null>(null)
const loadError = ref<string | null>(null)
const regionAvgMid = ref<number | null>(null)
const activeRoomTab = ref(0)

const isUuid = computed(() => typeof props.hall.id === 'string')

async function loadDetail() {
  if (!isUuid.value) { detail.value = null; regionAvgMid.value = null; loadError.value = null; return }
  const { hall, error } = await fetchHallDetail(props.hall.id as string)
  if (error) { loadError.value = error.message; detail.value = null; return }
  loadError.value = null
  detail.value = hall
  activeRoomTab.value = 0
  if (hall?.region_city) {
    regionAvgMid.value = await fetchRegionAvgFoodMid(hall.region_city)
  } else {
    regionAvgMid.value = null
  }
}

watch(() => props.hall.id, () => loadDetail(), { immediate: true })

const addressLine = computed(() => detail.value?.address?.trim() || props.hall.location?.trim() || '')
const foodWon = computed(() => resolveFoodWonRange(props.hall, detail.value))
const foodManwonLabel = computed(() => formatManwonRange(foodWon.value.min, foodWon.value.max))

const foodMidWon = computed(() => {
  const { min, max } = foodWon.value
  if (min == null && max == null) return null
  return ((min ?? 0) + (max ?? 0)) / 2
})

const regionAvgManwon = computed(() =>
  regionAvgMid.value ? Math.round(regionAvgMid.value / 10000 * 10) / 10 : null
)

const diffPct = computed(() => {
  if (foodMidWon.value == null || regionAvgMid.value == null || regionAvgMid.value === 0) return null
  return Math.round(((foodMidWon.value - regionAvgMid.value) / regionAvgMid.value) * 100)
})

const diffText = computed(() => {
  if (diffPct.value == null || regionAvgManwon.value == null) return null
  const region = detail.value?.region_district?.replace(/\d.*/, '').trim() || detail.value?.region_city || ''
  const dir = diffPct.value < 0 ? '저렴' : '높음'
  return `${region} 평균 ${regionAvgManwon.value}만원보다 약 ${Math.abs(diffPct.value)}% ${dir}`
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

// 태그: DB hall_type 또는 hall.tags 사용
const displayTags = computed(() => {
  const types = detail.value?.hall_type ?? props.hall.hallTypes ?? props.hall.tags ?? []
  return types.slice(0, 5)
})

// 소스 배지 헬퍼
function badge(link: string | null | undefined) {
  return sourceBadgeText(link, sources.value.length)
}

const isBookmarked = computed(() =>
  typeof props.hall.id === 'string' ? bookmarkedIds.value.has(props.hall.id) : false
)
const isMyHall = computed(() =>
  typeof props.hall.id === 'string' ? myHallIds.value.has(props.hall.id) : false
)
function onBookmarkClick() {
  if (!user.value) { openAuthModal(); return }
  if (typeof props.hall.id === 'string') toggleBookmark(props.hall.id, 'wishlist')
}
function onMyHallClick() {
  if (!user.value) { openAuthModal(); return }
  if (typeof props.hall.id === 'string') toggleBookmark(props.hall.id, 'my_hall')
}

const showEstimate = computed(() =>
  Boolean(foodManwonLabel.value) || diffPct.value != null || Boolean(guaranteeLabel.value)
)
const showRoomCard = computed(() => rooms.value.length > 0)
const showDiningCard = computed(() => dinings.value.length > 0 || Boolean(detail.value?.food_type?.[0] || props.hall.food))
const showTransport = computed(() => {
  const d = detail.value
  if (!d && !isUuid.value) return false
  return Boolean(d?.total_parking != null || d?.parking_info?.trim() || d?.transport?.trim() || d?.free_parking_min != null)
})
const showCostDetail = computed(() => costs.value.some(c => c.meal_cost_text?.trim() || c.rental_cost_text?.trim() || c.add_cost?.trim()))
const showRoomDetail = computed(() => rooms.value.some(r => r.feature?.trim() || r.mood?.trim()))
const showDiningDetail = computed(() => dinings.value.some(d => d.menu_info?.trim() || d.family_room?.trim()))
const showContractDetail = computed(() => costs.value.some(c => c.contract_info?.trim() || c.external_corp?.trim() || c.add_cost?.trim()))
</script>

<template>
  <div class="detail-wrap">
    <!-- ← 목록으로 / ♡ ★ -->
    <div class="detail-nav">
      <span class="back-btn" @click="$emit('back')">← 목록으로</span>
      <div class="action-icons">
        <button
          class="icon-btn"
          :class="{ active: isBookmarked }"
          title="관심홀"
          @click="onBookmarkClick"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 21C12 21 3 14.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 13 5.09C14.09 3.81 15.76 3 17.5 3C20.58 3 23 5.42 23 8.5C23 14.5 12 21 12 21Z" :fill="isBookmarked ? '#F2728A' : 'none'" :stroke="isBookmarked ? '#F2728A' : '#ccc'" stroke-width="1.8"/>
          </svg>
        </button>
        <button
          class="icon-btn"
          :class="{ active: isMyHall }"
          title="나의홀"
          @click="onMyHallClick"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" :fill="isMyHall ? '#C4A059' : 'none'" :stroke="isMyHall ? '#C4A059' : '#ccc'" stroke-width="1.8"/>
          </svg>
        </button>
      </div>
    </div>

    <p v-if="loadError" class="load-error">상세 정보를 불러오지 못했습니다. {{ loadError }}</p>

    <!-- 기본 정보 -->
    <div class="section info-section">
      <h1 class="hall-name">{{ detail?.name ?? hall.name }}</h1>
      <p class="hall-addr">{{ addressLine || '주소 정보 없음' }}</p>
      <div class="info-meta">
        <span v-if="(detail?.phone ?? hall.phone)" class="meta-phone">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#F2728A"/></svg>
          {{ detail?.phone ?? hall.phone }}
        </span>
        <a
          v-if="detail?.website_url?.trim()"
          :href="detail.website_url"
          target="_blank"
          rel="noopener noreferrer"
          class="meta-web"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="1.8"/><path d="M2 12h20M12 2C7 7 7 17 12 22M12 2C17 7 17 17 12 22" stroke="#888" stroke-width="1.8" fill="none"/></svg>
          홈페이지
        </a>
        <span class="meta-badge">{{ detail?.is_verified ? '업체인증' : '업체인증전' }}</span>
      </div>
      <button class="cta-btn" type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white" opacity="0.9"/></svg>
        예비부부 대기실 이동
      </button>
    </div>

    <!-- 예상 견적 -->
    <div v-if="showEstimate" class="section">
      <div class="section-header">
        <span class="section-title">≡ 예상 견적</span>
        <span v-if="badge(costs[0]?.source_link)" class="source-badge">{{ badge(costs[0]?.source_link) }}</span>
      </div>

      <div v-if="foodManwonLabel" class="estimate-card">
        <div class="estimate-left">
          <div class="estimate-sub">식대 (1인)</div>
          <div class="estimate-price">{{ foodManwonLabel }}</div>
          <div v-if="diffText" class="estimate-diff">{{ diffText }}</div>
        </div>
        <svg class="bell-curve" width="72" height="40" viewBox="0 0 72 40" aria-hidden="true">
          <path d="M4,34 C14,34 20,8 36,6 C52,4 58,34 68,34" :stroke="PRIMARY" stroke-width="2" fill="none" stroke-linecap="round"/>
          <line x1="36" y1="6" x2="36" y2="36" :stroke="PRIMARY" stroke-width="1" stroke-dasharray="2,2"/>
          <circle cx="36" cy="36" r="3" :fill="PRIMARY"/>
        </svg>
      </div>

      <div v-if="guaranteeLabel" class="guarantee-row">
        <span class="guarantee-label">보증인원</span>
        <span class="guarantee-value">{{ guaranteeLabel }}</span>
      </div>
    </div>

    <!-- 홀 컨디션 카드 -->
    <div v-if="showRoomCard" class="section">
      <div class="section-header">
        <span class="section-title">🏛 홀 컨디션</span>
        <span v-if="badge(currentRoom?.source_link)" class="source-badge">{{ badge(currentRoom?.source_link) }}</span>
      </div>

      <!-- 탭 (복수 홀) -->
      <div v-if="rooms.length > 1" class="room-tabs">
        <button
          v-for="(r, idx) in rooms"
          :key="idx"
          :class="['room-tab', { active: activeRoomTab === idx }]"
          type="button"
          @click="activeRoomTab = idx"
        >{{ r.name || `홀 ${idx + 1}` }}</button>
      </div>

      <template v-if="currentRoom">
        <!-- 홀명 + 이용시간 -->
        <div v-if="currentRoom.name" class="room-name-row">
          <span class="room-name">{{ currentRoom.name }}</span>
          <span v-if="currentRoom.interval_text" class="room-duration">{{ currentRoom.interval_text }}</span>
        </div>

        <!-- 태그 (홀 유형) -->
        <div v-if="displayTags.length" class="tag-row">
          <span v-for="t in displayTags" :key="t" class="hall-tag">{{ t }}</span>
        </div>

        <!-- 분위기 / feature 텍스트 -->
        <p v-if="currentRoom.mood?.trim()" class="room-desc">{{ currentRoom.mood }}</p>
        <p v-if="currentRoom.feature?.trim()" class="room-desc">{{ currentRoom.feature }}</p>

        <!-- 신부대기실 -->
        <p v-if="currentRoom.bride_room?.trim()" class="room-bride">{{ currentRoom.bride_room }}</p>
      </template>
    </div>

    <!-- 식사 및 평가 카드 -->
    <div v-if="showDiningCard" class="section">
      <div class="section-header">
        <span class="section-title">🍽 식사 및 평가</span>
        <span v-if="badge(dinings[0]?.source_link)" class="source-badge">{{ badge(dinings[0]?.source_link) }}</span>
      </div>

      <template v-for="(d, di) in dinings.length ? dinings : [null]" :key="di">
        <div v-if="d?.food_type?.trim() || (!d && (detail?.food_type?.[0] || hall.food))" class="dining-type">
          {{ d?.food_type?.trim() || detail?.food_type?.[0] || hall.food }}
        </div>
        <p v-if="d?.menu_info?.trim()" class="dining-menu">{{ d.menu_info }}</p>
        <div v-if="d?.family_room?.trim()" class="dining-family">혼주 식사룸: {{ d.family_room }}</div>

        <!-- 맛 평가 pros/cons -->
        <div v-if="d?.taste_pros?.trim() || d?.taste_cons?.trim()" class="taste-card">
          <div v-if="d?.taste_pros?.trim()" class="taste-row pros">
            <span class="taste-sign">+</span>
            <span>{{ d.taste_pros }}</span>
          </div>
          <div v-if="d?.taste_cons?.trim()" class="taste-row cons">
            <span class="taste-sign">−</span>
            <span>{{ d.taste_cons }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- 교통 및 주차 -->
    <div v-if="showTransport" class="section">
      <div class="section-header">
        <span class="section-title">🚗 교통 및 주차</span>
      </div>
      <div class="transport-grid">
        <div class="transport-card">
          <div class="transport-card-title">
            주차
            <template v-if="detail?.total_parking"> ({{ detail.total_parking }}대)</template>
          </div>
          <div v-if="detail?.free_parking_min != null" class="transport-card-body">
            {{ detail.free_parking_min }}분 무료 주차
          </div>
          <div v-if="detail?.parking_info?.trim()" class="transport-card-body">{{ detail.parking_info }}</div>
          <div v-if="!detail?.free_parking_min && !detail?.parking_info" class="transport-card-body muted">—</div>
        </div>
        <div class="transport-card">
          <div class="transport-card-title">대중교통</div>
          <div v-if="detail?.transport?.trim()" class="transport-card-body">{{ detail.transport }}</div>
          <div v-if="detail?.has_shuttle" class="transport-card-body">셔틀 운행</div>
          <div v-if="!detail?.transport && !detail?.has_shuttle" class="transport-card-body muted">—</div>
        </div>
      </div>
      <div v-if="detail?.atm_location?.trim()" class="transport-extra">ATM: {{ detail.atm_location }}</div>
      <div v-if="detail?.elevator_info?.trim()" class="transport-extra">엘리베이터: {{ detail.elevator_info }}</div>
    </div>

    <!-- 비용 정보 텍스트 -->
    <div v-if="showCostDetail" class="section">
      <div class="section-header">
        <span class="section-title">비용 정보 (식대·보증인원·대관료)</span>
        <span v-if="badge(costs[0]?.source_link)" class="source-badge">{{ badge(costs[0]?.source_link) }}</span>
      </div>
      <div v-for="(c, ci) in costs" :key="ci" class="cost-block">
        <div v-if="c.target_date?.trim()" class="cost-date">{{ c.target_date }}</div>
        <p v-if="c.meal_cost_text?.trim()" class="cost-text">{{ c.meal_cost_text }}</p>
        <p v-if="c.guarantee_text?.trim()" class="cost-text">{{ c.guarantee_text }}</p>
        <p v-if="c.rental_cost_text?.trim()" class="cost-text">{{ c.rental_cost_text }}</p>
      </div>
    </div>

    <!-- 홀 컨디션 상세 (구조·스타일·버진로드·층고) -->
    <div v-if="showRoomDetail" class="section">
      <div class="section-header">
        <span class="section-title">홀 컨디션 (홀 구조·스타일·버진로드·층고)</span>
        <span v-if="badge(currentRoom?.source_link)" class="source-badge">{{ badge(currentRoom?.source_link) }}</span>
      </div>
      <template v-for="(r, ri) in rooms" :key="ri">
        <p v-if="r.feature?.trim()" class="cost-text">{{ r.feature }}</p>
        <p v-if="r.mood?.trim() && r.mood !== currentRoom?.mood" class="cost-text">{{ r.mood }}</p>
      </template>
    </div>

    <!-- 식사 유형 상세 -->
    <div v-if="showDiningDetail" class="section">
      <div class="section-header">
        <span class="section-title">식사 유형 (뷔페/코스, 연회장, 맛 평가, 혼주 식사룸)</span>
        <span v-if="badge(dinings[0]?.source_link)" class="source-badge">{{ badge(dinings[0]?.source_link) }}</span>
      </div>
      <template v-for="(d, di) in dinings" :key="di">
        <p v-if="d.menu_info?.trim()" class="cost-text">{{ d.menu_info }}</p>
        <p v-if="d.family_room?.trim()" class="cost-text">혼주 식사룸: {{ d.family_room }}</p>
      </template>
    </div>

    <!-- 계약 정보 -->
    <div v-if="showContractDetail" class="section">
      <div class="section-header">
        <span class="section-title">계약 정보 (추가 비용·위약금·외부업체)</span>
      </div>
      <div v-for="(c, ci) in costs" :key="'ct-' + ci">
        <p v-if="c.add_cost?.trim()" class="cost-text">{{ c.add_cost }}</p>
        <p v-if="c.contract_info?.trim()" class="cost-text">{{ c.contract_info }}</p>
        <p v-if="c.external_corp?.trim()" class="cost-text">외부업체: {{ c.external_corp }}</p>
      </div>
    </div>

    <!-- 면책 disclaimer -->
    <div class="disclaimer-card">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="flex-shrink:0;margin-top:1px">
        <circle cx="12" cy="12" r="10" fill="#FFC107" opacity="0.8"/>
        <path d="M12 8v4M12 16h.01" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <p class="disclaimer-text">수집된 정보에 실수가 있을 수 있어요. 소중한 날인 만큼, 방문 전 상세 조건을 다시 한번 체크해 주세요.</p>
    </div>

    <p class="footer-text">
      본 정보는 예비 신랑신부님의 결혼 준비 시 편의를 돕고자 웨딩홀 공식 사이트, 포털, 온라인 후기를 기반으로 재구성되었습니다.
    </p>

    <!-- AD 배너 -->
    <div class="ad-banner">
      <div class="ad-label">AD</div>
      <div class="ad-content">
        <div class="ad-sub">전국 1등% 웨딩홀 가격비교!</div>
        <div class="ad-title">우리의 첫 시작,<br><strong>가뜬씩으 로안성!</strong></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  background: #fff;
}

/* 네비 */
.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid v-bind('BORDER');
  flex-shrink: 0;
}
.back-btn {
  font-size: 13px;
  color: v-bind('PRIMARY');
  cursor: pointer;
  font-weight: 500;
}
.action-icons { display: flex; gap: 6px; }
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
}

/* 섹션 공통 */
.section {
  padding: 16px 16px 14px;
  border-bottom: 1px solid v-bind('BORDER');
  flex-shrink: 0;
}

/* 섹션 헤더 */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: v-bind('TEXT');
}
.source-badge {
  font-size: 11px;
  color: v-bind('PRIMARY');
  font-weight: 500;
}

/* 기본 정보 */
.info-section { padding-bottom: 16px; }
.hall-name {
  font-size: 21px;
  font-weight: 700;
  color: v-bind('TEXT');
  margin: 0 0 4px;
  line-height: 1.3;
}
.hall-addr {
  font-size: 12px;
  color: v-bind('MUTED');
  margin: 0 0 10px;
}
.info-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.meta-phone {
  font-size: 12px;
  color: v-bind('PRIMARY');
  display: flex;
  align-items: center;
  gap: 4px;
}
.meta-web {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
}
.meta-badge {
  font-size: 11px;
  padding: 2px 8px;
  border: 1px solid v-bind('BORDER');
  border-radius: 4px;
  color: v-bind('MUTED');
}
.cta-btn {
  width: 100%;
  padding: 12px 0;
  background: v-bind('PRIMARY');
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  letter-spacing: -0.2px;
}

/* 예상 견적 */
.estimate-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: #F8F9FF;
  border-radius: 10px;
  padding: 14px 16px 12px;
  margin-bottom: 8px;
}
.estimate-sub { font-size: 11px; color: v-bind('MUTED'); margin-bottom: 4px; }
.estimate-price { font-size: 24px; font-weight: 700; color: v-bind('TEXT'); }
.estimate-diff { font-size: 11px; color: v-bind('MUTED'); margin-top: 3px; }
.bell-curve { flex-shrink: 0; }
.guarantee-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
}
.guarantee-label { font-size: 13px; color: v-bind('TEXT'); }
.guarantee-value { font-size: 15px; font-weight: 700; color: v-bind('PRIMARY'); }

/* 홀 컨디션 */
.room-tabs { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.room-tab {
  font-size: 11px;
  padding: 4px 12px;
  border-radius: 99px;
  border: 1px solid v-bind('BORDER');
  background: #fff;
  color: v-bind('MUTED');
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}
.room-tab.active {
  background: v-bind('PRIMARY');
  border-color: v-bind('PRIMARY');
  color: #fff;
  font-weight: 600;
}
.room-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.room-name { font-size: 15px; font-weight: 700; color: v-bind('TEXT'); }
.room-duration {
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 99px;
  background: #f0f0f0;
  color: #777;
  font-weight: 500;
}
.tag-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.hall-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 99px;
  background: #333;
  color: #fff;
  font-weight: 500;
}
.room-desc {
  font-size: 13px;
  color: #555;
  line-height: 1.7;
  margin: 0 0 6px;
}
.room-bride {
  font-size: 12px;
  color: v-bind('PRIMARY');
  line-height: 1.6;
  margin: 4px 0 0;
}

/* 식사 */
.dining-type { font-size: 15px; font-weight: 700; color: v-bind('TEXT'); margin-bottom: 6px; }
.dining-menu { font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 6px; }
.dining-family { font-size: 12px; color: v-bind('MUTED'); margin-bottom: 8px; }
.taste-card {
  background: #FAFBFF;
  border: 1px solid v-bind('BORDER');
  border-radius: 8px;
  padding: 10px 12px;
  margin-top: 6px;
}
.taste-row {
  display: flex;
  gap: 6px;
  font-size: 12px;
  line-height: 1.6;
}
.taste-row + .taste-row { margin-top: 4px; }
.taste-sign { font-weight: 700; flex-shrink: 0; }
.taste-row.pros .taste-sign { color: #2E7D32; }
.taste-row.cons .taste-sign { color: #C62828; }
.taste-row.pros { color: #2E7D32; }
.taste-row.cons { color: #C62828; }

/* 교통 */
.transport-grid { display: flex; gap: 10px; }
.transport-card {
  flex: 1 1 0;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid v-bind('BORDER');
  background: #FAFBFF;
}
.transport-card-title { font-size: 12px; font-weight: 700; color: v-bind('TEXT'); margin-bottom: 4px; }
.transport-card-body { font-size: 12px; color: #555; line-height: 1.6; margin-top: 2px; }
.transport-card-body.muted { color: v-bind('MUTED'); }
.transport-extra { font-size: 12px; color: v-bind('MUTED'); margin-top: 8px; }

/* 텍스트 섹션 공통 */
.cost-block { margin-bottom: 10px; }
.cost-date { font-size: 11px; color: v-bind('MUTED'); margin-bottom: 4px; }
.cost-text { font-size: 13px; color: #555; line-height: 1.7; margin: 0 0 4px; }

/* 면책 */
.load-error { padding: 8px 16px; font-size: 12px; color: #c00; margin: 0; }
.disclaimer-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 16px 16px 0;
  padding: 14px 14px;
  background: #FFFBF0;
  border-radius: 12px;
  border: 1px solid #FFE082;
}
.disclaimer-text {
  font-size: 12px;
  color: #666;
  line-height: 1.7;
  margin: 0;
}
.footer-text {
  font-size: 11px;
  color: #bbb;
  line-height: 1.7;
  text-align: center;
  padding: 12px 16px;
  margin: 0;
}

/* AD 배너 */
.ad-banner {
  margin: 0 16px 20px;
  border-radius: 14px;
  background: linear-gradient(135deg, #FFB6C1 0%, #FF8FAB 100%);
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.ad-label {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.85);
  background: rgba(255,255,255,0.2);
  padding: 2px 6px;
  border-radius: 4px;
  flex-shrink: 0;
  align-self: flex-start;
}
.ad-content { flex: 1; }
.ad-sub { font-size: 11px; color: rgba(255,255,255,0.9); margin-bottom: 2px; }
.ad-title { font-size: 14px; color: #fff; line-height: 1.4; }
.ad-title strong { font-weight: 800; }
</style>
