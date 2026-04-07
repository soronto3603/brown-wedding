<script setup lang="ts">
const { PRIMARY, PRIMARY_LT, MUTED, TEXT } = useThemeColors()

defineProps<{
  icon: string
  label: string
  active: boolean
}>()

defineEmits<{
  click: []
}>()

const ICON_PATHS: Record<string, string> = {
  hall: 'M3 21V8l9-6 9 6v13H3z M9 21v-6h6v6',
  lounge: 'M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  budget: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  dict: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}
</script>

<template>
  <button
    :class="['side-btn', { active }]"
    @click="$emit('click')"
  >
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      :stroke="active ? PRIMARY : MUTED"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path :d="ICON_PATHS[icon] ?? ICON_PATHS.hall" />
    </svg>
    <span class="side-btn-label" :style="{ color: active ? TEXT : MUTED }">
      {{ label }}
    </span>
  </button>
</template>

<style scoped>
.side-btn {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 0;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: background 0.15s ease;
}

.side-btn::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: transparent;
  transition: background 0.15s ease;
}

.side-btn.active::before {
  background: v-bind(PRIMARY);
}

.side-btn.active {
  background: v-bind(PRIMARY_LT);
}

.side-btn:hover:not(.active) {
  background: #f5f5f5;
}

.side-btn-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
  letter-spacing: -0.02em;
}
</style>
