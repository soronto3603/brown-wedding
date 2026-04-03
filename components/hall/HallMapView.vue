<script setup lang="ts">
import type { Hall } from '~/data/wedding'
import {
  createClusterMarkerElement,
  createHallMarkerPillElement,
} from '~/utils/hallMapMarker'
import Supercluster from 'supercluster'

const props = defineProps<{
  halls: Hall[]
  selectedId: number | string | null
}>()

const emit = defineEmits<{
  select: [hall: Hall]
  boundsChange: [
    b: { south: number; west: number; north: number; east: number },
  ]
}>()

const { PRIMARY, MUTED } = useThemeColors()

const config = useRuntimeConfig()
const clientId = computed(() => String(config.public.naverMapClientId ?? '').trim())
const legacyClientId = computed(() => {
  const v = config.public.naverMapLegacyClientId as boolean | string | undefined
  return v === true || v === 'true' || v === '1'
})

const mapEl = ref<HTMLElement | null>(null)
const { load: loadNaverMapScript } = useNaverMapScript()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let map: any = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const markerRefs: any[] = []
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let idleListener: any = null

let clusterIndex: Supercluster | null = null

/** 카메라 이동·줌 (네이버 `morph` / 구버전 폴백) */
const MAP_MOVE_DURATION = 580
const MAP_MOVE_EASING = 'easeOutCubic'

function moveMapAnimated(
  lat: number,
  lng: number,
  zoom: number,
  duration = MAP_MOVE_DURATION,
) {
  const w = window as unknown as { naver?: { maps: any } }
  const naver = w.naver
  if (!map || !naver?.maps) return
  const ll = new naver.maps.LatLng(lat, lng)
  const opts = { duration, easing: MAP_MOVE_EASING }
  if (typeof map.morph === 'function') {
    map.morph(ll, zoom, opts)
  } else {
    map.panTo(ll, opts)
    map.setZoom(zoom)
  }
}

function clearMarkers() {
  markerRefs.forEach((m) => m.setMap?.(null))
  markerRefs.length = 0
}

function rebuildClusterIndex() {
  const features = props.halls.map((h) => ({
    type: 'Feature' as const,
    properties: { hallId: h.id },
    geometry: {
      type: 'Point' as const,
      coordinates: [h.lng, h.lat] as [number, number],
    },
  }))

  clusterIndex = new Supercluster({
    /** 픽셀 반경 — 줌아웃 시 더 잘 묶임 */
    radius: 76,
    /** 이 줌 이상에서는 개별 마커 위주 (supercluster 기본 16) */
    maxZoom: 16,
    minPoints: 2,
    minZoom: 0,
    extent: 512,
  })
  clusterIndex.load(features)
}

function emitBounds() {
  const w = window as unknown as { naver?: { maps: any } }
  const naver = w.naver
  if (!map || !naver?.maps) return
  const bounds = map.getBounds()
  if (!bounds) return
  const sw = bounds.getSW ? bounds.getSW() : bounds.getMin()
  const ne = bounds.getNE ? bounds.getNE() : bounds.getMax()
  emit('boundsChange', {
    south: sw.lat(),
    west: sw.lng(),
    north: ne.lat(),
    east: ne.lng(),
  })
}

function syncNaverMarkers() {
  const w = window as unknown as { naver?: { maps: any } }
  const naver = w.naver
  if (!map || !naver?.maps || !clusterIndex) return

  clearMarkers()
  const { LatLng, Marker, Event, Point } = naver.maps

  const zoom = map.getZoom()
  const z = Math.max(0, Math.min(24, Math.floor(zoom)))
  const bounds = map.getBounds()
  if (!bounds) return
  const sw = bounds.getSW ? bounds.getSW() : bounds.getMin()
  const ne = bounds.getNE ? bounds.getNE() : bounds.getMax()
  const bbox: [number, number, number, number] = [
    sw.lng(),
    sw.lat(),
    ne.lng(),
    ne.lat(),
  ]

  const clusters = clusterIndex.getClusters(bbox, z)

  for (const f of clusters) {
    const coords = f.geometry as { coordinates: [number, number] }
    const [lng, lat] = coords.coordinates
    const pos = new LatLng(lat, lng)
    const p = f.properties as {
      cluster?: boolean
      cluster_id?: number
      point_count?: number
      point_count_abbreviated?: string | number
      hallId?: string | number
    }

    if (p.cluster && p.cluster_id != null) {
      const { el, anchor } = createClusterMarkerElement(
        p.point_count ?? 0,
        p.point_count_abbreviated,
        { primary: PRIMARY },
      )
      const marker = new Marker({
        position: pos,
        map,
        icon: {
          content: el,
          anchor: new Point(anchor.x, anchor.y),
        },
      })
      Event.addListener(marker, 'click', () => {
        const exp = clusterIndex!.getClusterExpansionZoom(p.cluster_id!)
        const maxZ =
          typeof map.getMaxZoom === 'function' ? map.getMaxZoom() : 21
        const targetZ = Math.min(exp, maxZ)
        const ll = pos
        if (typeof map.morph === 'function') {
          map.morph(ll, targetZ, {
            duration: 480,
            easing: MAP_MOVE_EASING,
          })
        } else {
          map.setZoom(targetZ)
          map.setCenter(ll)
        }
      })
      markerRefs.push(marker)
    } else {
      const hall = props.halls.find((h) => h.id === p.hallId)
      if (!hall) continue
      const { el, anchor } = createHallMarkerPillElement(hall, {
        selected: props.selectedId === hall.id,
        primary: PRIMARY,
      })
      const marker = new Marker({
        position: pos,
        map,
        icon: {
          content: el,
          anchor: new Point(anchor.x, anchor.y),
        },
      })
      Event.addListener(marker, 'click', () => emit('select', hall))
      markerRefs.push(marker)
    }
  }

  nextTick(() => Event.trigger(map, 'resize'))
}

function initNaverMap() {
  const w = window as unknown as { naver?: { maps: any } }
  const naver = w.naver
  if (!naver?.maps || !mapEl.value) return

  const { Map, LatLng, Event } = naver.maps

  map = new Map(mapEl.value, {
    center: new LatLng(37.55, 127.0),
    zoom: 11,
    zoomControl: false,
  })

  idleListener = Event.addListener(map, 'idle', () => {
    emitBounds()
    syncNaverMarkers()
  })

  rebuildClusterIndex()
  syncNaverMarkers()
  nextTick(() => {
    Event.trigger(map, 'resize')
    emitBounds()
  })
}

watch(
  () => props.halls,
  () => {
    if (clientId.value && map) {
      rebuildClusterIndex()
      syncNaverMarkers()
    }
  },
  { deep: true },
)

watch(
  () => props.selectedId,
  (id) => {
    if (clientId.value && map) syncNaverMarkers()
    if (!clientId.value || !map || id == null) return
    const h = props.halls.find((x) => x.id === id)
    if (!h) return
    nextTick(() => {
      moveMapAnimated(h.lat, h.lng, 15)
    })
  },
)

let resizeObs: ResizeObserver | null = null

onMounted(async () => {
  if (!clientId.value) return
  try {
    await loadNaverMapScript(clientId.value, legacyClientId.value)
    await nextTick()
    initNaverMap()
    if (mapEl.value && typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => {
        const w = window as unknown as { naver?: { maps: any } }
        if (map && w.naver?.maps) w.naver.maps.Event.trigger(map, 'resize')
      })
      resizeObs.observe(mapEl.value)
    }
  } catch (e) {
    console.error('[HallMapView] Naver Map init failed:', e)
  }
})

onUnmounted(() => {
  const w = window as unknown as { naver?: { maps: any } }
  if (idleListener && w.naver?.maps?.Event) {
    w.naver.maps.Event.removeListener(idleListener)
  }
  idleListener = null
  resizeObs?.disconnect()
  resizeObs = null
  clearMarkers()
  clusterIndex = null
  map = null
})
</script>

<template>
  <div :style="{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', background: '#E8E6DF' }">
    <!-- 키 없음: 기존 목업 (핀은 퍼센트 기준) -->
    <template v-if="!clientId">
      <svg
        width="100%"
        height="100%"
        :style="{ position: 'absolute', inset: 0 }"
        preserveAspectRatio="none"
      >
        <rect width="100%" height="100%" fill="#E8E6DF" />
        <rect x="0" y="0" width="100%" height="18%" fill="#DDDAD2" />
        <rect x="0" y="82%" width="100%" height="18%" fill="#DDDAD2" />
        <rect x="5%" y="18%" width="90%" height="64%" rx="2" fill="#E2DFDA" />
        <line x1="5%" y1="45%" x2="95%" y2="45%" stroke="#D2CECC" stroke-width="6" />
        <line x1="50%" y1="18%" x2="50%" y2="82%" stroke="#D2CECC" stroke-width="4" />
        <line x1="25%" y1="18%" x2="25%" y2="82%" stroke="#CCCAC5" stroke-width="2" />
        <line x1="75%" y1="18%" x2="75%" y2="82%" stroke="#CCCAC5" stroke-width="2" />
        <line x1="5%" y1="30%" x2="95%" y2="30%" stroke="#CCCAC5" stroke-width="2" />
        <line x1="5%" y1="65%" x2="95%" y2="65%" stroke="#CCCAC5" stroke-width="2" />
        <rect x="14%" y="19%" width="9%" height="9%" rx="2" fill="#DAD7D0" />
        <rect x="30%" y="20%" width="11%" height="8%" rx="2" fill="#DAD7D0" />
        <rect x="54%" y="19%" width="9%" height="10%" rx="2" fill="#DAD7D0" />
        <rect x="70%" y="21%" width="13%" height="7%" rx="2" fill="#DAD7D0" />
        <rect x="14%" y="50%" width="8%" height="11%" rx="2" fill="#DAD7D0" />
        <rect x="27%" y="52%" width="10%" height="9%" rx="2" fill="#DAD7D0" />
        <rect x="59%" y="50%" width="11%" height="10%" rx="2" fill="#DAD7D0" />
        <rect x="74%" y="51%" width="9%" height="8%" rx="2" fill="#DAD7D0" />
        <rect x="37%" y="32%" width="11%" height="11%" rx="3" fill="#C8D8B8" opacity="0.7" />
        <text x="50%" y="96%" text-anchor="middle" font-size="11" fill="#B0ABA2">
          지도 API 연동 영역 (네이버 지도 · .env에 키 설정)
        </text>
      </svg>

      <div
        v-for="h in halls"
        :key="h.id"
        :style="{
          position: 'absolute',
          left: h.pinX,
          top: h.pinY,
          transform: 'translate(-50%, -100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          zIndex: selectedId === h.id ? 4 : 2,
        }"
        @click="emit('select', h)"
      >
        <HallMapPillLabel
          :hall="h"
          :selected="selectedId === h.id"
          :primary="PRIMARY"
        />
      </div>

      <div
        :style="{
          position: 'absolute',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: MUTED,
          textAlign: 'center',
          maxWidth: '90%',
          lineHeight: 1.5,
        }"
      >
        프로젝트 루트에 <code style="font-size: 11px">.env</code> 를 만들고
        <code style="font-size: 11px">NUXT_PUBLIC_NAVER_MAP_CLIENT_ID</code> 에 발급받은 Client ID를 넣으면 네이버 지도가 표시됩니다.
      </div>
    </template>

    <!-- 네이버 지도 -->
    <div
      v-show="clientId"
      ref="mapEl"
      :style="{ position: 'absolute', inset: 0, width: '100%', height: '100%' }"
    />
  </div>
</template>
