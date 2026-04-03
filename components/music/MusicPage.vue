<script setup lang="ts">
import { MUSIC } from '~/data/wedding'
import type { MusicItem } from '~/data/wedding'

const { PRIMARY, GOLD, GOLD_LT, TEXT, MUTED, BORDER, PRIMARY_LT } = useThemeColors()

const tabIdx = ref(0)
const mood = ref('전체')
const tabs = ['신랑 입장곡', '신부 입장곡', '축가', '피로연']
const moods = ['전체', '잔잔한', '설레는', '클래식', '팝', 'K-POP']

const hovered = ref<number | null>(null)

const filtered = computed(() =>
  MUSIC.filter((m: MusicItem) => {
    if (mood.value === '전체') return true
    if (mood.value === 'K-POP' && m.type === 'kpop') return true
    if (mood.value === '팝' && m.type === 'pop') return true
    if (mood.value === '클래식' && m.type === 'classic') return true
    return m.mood === mood.value
  }),
)
</script>

<template>
  <div :style="{ background: '#FAFAFA', height: '100%', overflowY: 'auto' }">
    <div :style="{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }">
      <div :style="{ display: 'flex', borderBottom: `1px solid ${BORDER}`, marginBottom: '14px' }">
        <div
          v-for="(t, i) in tabs"
          :key="i"
          :style="{
            padding: '9px 16px',
            fontSize: '13px',
            fontWeight: tabIdx === i ? 600 : 400,
            color: tabIdx === i ? TEXT : MUTED,
            cursor: 'pointer',
            borderBottom: `2px solid ${tabIdx === i ? PRIMARY : 'transparent'}`,
          }"
          @click="tabIdx = i"
        >
          {{ t }}
        </div>
      </div>
      <div :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }">
        <button
          v-for="m in moods"
          :key="m"
          type="button"
          :style="{
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: mood === m ? 600 : 400,
            padding: '5px 14px',
            borderRadius: '99px',
            border: `1px solid ${mood === m ? PRIMARY : BORDER}`,
            background: mood === m ? PRIMARY : '#fff',
            color: mood === m ? '#fff' : MUTED,
            cursor: 'pointer',
          }"
          @click="mood = m"
        >
          {{ m }}
        </button>
      </div>
      <div
        :style="{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          overflow: 'hidden',
        }"
      >
        <div
          v-for="(item, i) in filtered"
          :key="i"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '11px 14px',
            borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
            cursor: 'pointer',
            background: hovered === i ? PRIMARY_LT : '#fff',
          }"
          @mouseenter="hovered = i"
          @mouseleave="hovered = null"
        >
          <span :style="{ fontSize: '11px', color: MUTED, width: '18px', textAlign: 'center', flexShrink: 0 }">
            {{ i + 1 }}
          </span>
          <div
            :style="{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              flexShrink: 0,
              background: '#F2F3F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
            }"
          >
            {{ item.icon }}
          </div>
          <div :style="{ flex: 1, minWidth: 0 }">
            <div :style="{ fontSize: '14px', fontWeight: 600, color: TEXT, marginBottom: '2px' }">
              {{ item.title }}
            </div>
            <div :style="{ fontSize: '12px', color: MUTED }">{{ item.artist }}</div>
          </div>
          <span
            :style="{
              fontSize: '11px',
              fontWeight: 500,
              padding: '3px 9px',
              borderRadius: '99px',
              background: GOLD_LT,
              color: GOLD,
              whiteSpace: 'nowrap',
            }"
          >
            {{ item.badge }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
