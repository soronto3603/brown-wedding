<script setup lang="ts">
import { DICT } from '~/data/wedding'

const { PRIMARY, PRIMARY_LT, GOLD, GOLD_LT, TEXT, MUTED, BORDER } = useThemeColors()

const q = ref('')
const cat = ref('전체')
const open = ref<number | null>(null)
const cats = ['전체', '준비단계', '예식장', '스드메', '예물·예단', '음식', '비용']

const filtered = computed(() =>
  DICT.filter(
    (d) =>
      (cat.value === '전체' || d.cat === cat.value) &&
      (!q.value || d.term.includes(q.value) || d.def.includes(q.value)),
  ),
)
</script>

<template>
  <div :style="{ background: '#FAFAFA', height: '100%', overflowY: 'auto' }">
    <div :style="{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }">
      <div
        :style="{
          display: 'flex',
          border: `1px solid ${BORDER}`,
          borderRadius: '99px',
          background: '#fff',
          overflow: 'hidden',
          marginBottom: '12px',
        }"
      >
        <input
          v-model="q"
          placeholder="용어를 검색하세요"
          :style="{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '10px 16px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: TEXT,
            background: 'transparent',
          }"
        />
        <button
          type="button"
          :style="{
            padding: '0 20px',
            background: PRIMARY,
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }"
        >
          검색
        </button>
      </div>
      <div :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }">
        <button
          v-for="c in cats"
          :key="c"
          type="button"
          :style="{
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: cat === c ? 600 : 400,
            padding: '5px 14px',
            borderRadius: '99px',
            border: `1px solid ${cat === c ? PRIMARY : BORDER}`,
            background: cat === c ? PRIMARY : '#fff',
            color: cat === c ? '#fff' : MUTED,
            cursor: 'pointer',
          }"
          @click="cat = c"
        >
          {{ c }}
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
          v-if="filtered.length === 0"
          :style="{ padding: '32px', textAlign: 'center', color: MUTED, fontSize: '14px' }"
        >
          검색 결과가 없어요
        </div>
        <div
          v-for="(d, i) in filtered"
          :key="i"
          :style="{
            padding: '13px 14px',
            borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
            cursor: 'pointer',
            background: open === i ? PRIMARY_LT : '#fff',
          }"
          @click="open = open === i ? null : i"
        >
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: open === i ? '6px' : '3px',
            }"
          >
            <span :style="{ fontSize: '14px', fontWeight: 600, color: TEXT }">{{ d.term }}</span>
            <span
              :style="{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '99px',
                background: GOLD_LT,
                color: GOLD,
                fontWeight: 500,
              }"
            >
              {{ d.cat }}
            </span>
          </div>
          <div
            :style="{
              fontSize: '13px',
              color: MUTED,
              lineHeight: 1.65,
              overflow: open === i ? 'visible' : 'hidden',
              textOverflow: open === i ? 'unset' : 'ellipsis',
              whiteSpace: open === i ? 'normal' : 'nowrap',
            }"
          >
            {{ d.def }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
