<script setup lang="ts">
const { PRIMARY, PRIMARY_LT, MUTED, BORDER } = useThemeColors()

defineProps<{
  icon: string
  label: string
  active: boolean
}>()

defineEmits<{
  click: []
}>()
</script>

<template>
  <div
    :style="{
      width: '56px',
      height: '56px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      cursor: 'pointer',
      borderRight: active ? `2px solid ${PRIMARY}` : '2px solid transparent',
      background: active ? PRIMARY_LT : 'transparent',
    }"
    @click="$emit('click')"
  >
    <span :style="{ fontSize: '18px', lineHeight: 1 }">{{ icon }}</span>
    <span
      :style="{
        fontSize: '9px',
        color: active ? PRIMARY : MUTED,
        fontWeight: 500,
        textAlign: 'center',
        lineHeight: 1.2,
      }"
    >
      {{ label }}
    </span>
  </div>
</template>
