<script setup lang="ts">
import { INITIAL_BUDGET_ITEMS } from '~/data/wedding'
import type { BudgetItem } from '~/data/wedding'

const { PRIMARY, PRIMARY_LT, GOLD, TEXT, MUTED, BORDER } = useThemeColors()

const items = ref<BudgetItem[]>([...INITIAL_BUDGET_ITEMS])
const total = 3500

const spent = computed(() => items.value.filter((i) => i.done).reduce((a, b) => a + b.amount, 0))
const pct = computed(() => Math.round((spent.value / total) * 100))

function toggle(i: number) {
  items.value = items.value.map((it, j) => (j === i ? { ...it, done: !it.done } : it))
}
</script>

<template>
  <div :style="{ background: '#FAFAFA', height: '100%', overflowY: 'auto' }">
    <div :style="{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }">
      <div
        :style="{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '18px',
          marginBottom: '14px',
        }"
      >
        <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '14px' }">
          <div :style="{ textAlign: 'left' }">
            <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">총 예산</div>
            <div :style="{ fontSize: '18px', fontWeight: 700, color: TEXT }">{{ total.toLocaleString() }}만원</div>
          </div>
          <div :style="{ textAlign: 'center' }">
            <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">지출 완료</div>
            <div :style="{ fontSize: '18px', fontWeight: 700, color: '#C9716A' }">
              {{ spent.toLocaleString() }}만원
            </div>
          </div>
          <div :style="{ textAlign: 'right' }">
            <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">잔여 예산</div>
            <div :style="{ fontSize: '18px', fontWeight: 700, color: GOLD }">
              {{ (total - spent).toLocaleString() }}만원
            </div>
          </div>
        </div>
        <div :style="{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }">
          <div
            :style="{
              height: '100%',
              width: `${pct}%`,
              background: PRIMARY,
              borderRadius: '3px',
            }"
          />
        </div>
        <div :style="{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }">
          <span :style="{ fontSize: '11px', color: MUTED }">{{ pct }}% 사용</span>
          <span :style="{ fontSize: '11px', color: MUTED }">D-82</span>
        </div>
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
          v-for="(item, i) in items"
          :key="i"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '13px 14px',
            borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none',
            cursor: 'pointer',
          }"
          @click="toggle(i)"
        >
          <div
            :style="{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              flexShrink: 0,
              background: item.done ? PRIMARY_LT : '#F5F5F5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }"
          >
            {{ item.icon }}
          </div>
          <div :style="{ flex: 1 }">
            <div
              :style="{
                fontSize: '14px',
                fontWeight: 500,
                color: item.done ? '#AAAAAA' : TEXT,
                textDecoration: item.done ? 'line-through' : 'none',
              }"
            >
              {{ item.name }}
            </div>
            <div :style="{ fontSize: '11px', color: MUTED }">{{ item.sub }}</div>
          </div>
          <div :style="{ textAlign: 'right' }">
            <div :style="{ fontSize: '14px', fontWeight: 600, color: TEXT, marginBottom: '2px' }">
              {{ item.amount.toLocaleString() }}만원
            </div>
            <span
              :style="{
                fontSize: '11px',
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: '99px',
                background: item.done ? '#EDF7EE' : PRIMARY_LT,
                color: item.done ? '#3B8A47' : PRIMARY,
              }"
            >
              {{ item.done ? '완료' : '준비중' }}
            </span>
          </div>
        </div>
      </div>
      <p :style="{ fontSize: '12px', color: MUTED, textAlign: 'center', marginTop: '12px' }">
        항목 클릭으로 완료 상태 토글
      </p>
    </div>
  </div>
</template>
