<script setup lang="ts">
import type { Hall } from '~/data/wedding'
import { getHallMarkerBadge } from '~/utils/hallMapMarker'

const props = defineProps<{
  hall: Hall
  selected: boolean
  primary: string
}>()

const badge = computed(() => getHallMarkerBadge(props.hall))
</script>

<template>
  <div
    class="hall-map-pill"
    :class="{ 'hall-map-pill--selected': selected }"
    :style="{
      boxShadow: selected
        ? `0 0 0 2px ${primary}, 0 2px 8px rgba(0,0,0,0.22)`
        : '0 2px 6px rgba(0,0,0,0.2)',
    }"
  >
    <span
      class="hall-map-pill__tag"
      :style="{ background: badge.bg, color: badge.text }"
    >
      <span>{{ badge.label }}</span>
    </span>
    <span class="hall-map-pill__name">{{ hall.name }}</span>
  </div>
</template>

<style scoped>
.hall-map-pill {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 20px;
  padding: 3px 10px 3px 3px;
  white-space: nowrap;
  font-family: inherit;
  cursor: pointer;
  user-select: none;
  max-width: min(240px, 90vw);
}
.hall-map-pill__tag {
  border-radius: 14px;
  padding: 3px 7px;
  font-size: 10px;
  font-weight: 700;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  line-height: 1.2;
  flex-shrink: 0;
}
.hall-map-pill__name {
  font-size: 12px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
