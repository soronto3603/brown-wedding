<script setup lang="ts">
import type { BwBudgetItem, BwBudgetPlan } from '~/composables/useBudget'

defineProps<{
  plan: BwBudgetPlan | null
  items: BwBudgetItem[]
  grouped: Record<string, BwBudgetItem[]>
  categoryTotals: Record<string, number>
  payerTotals: Record<string, number>
  payMethodTotals: Record<string, number>
  spent: number
  remaining: number
  pct: number
}>()

const CATEGORY_ORDER = ['웨딩홀', '스드메', '허니문', '예물예단', '청첩장', '답례품', '기타']
const STATUS_KR: Record<string, string> = {
  todo: '진행전', in_progress: '진행중', done: '완료', cancelled: '취소',
}
const STATUS_CLS: Record<string, string> = {
  todo: 'st-todo', in_progress: 'st-prog', done: 'st-done', cancelled: 'st-cancel',
}
const dateStr = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

function fmt(n: number) { return n.toLocaleString() }
</script>

<template>
  <div class="rpt">
    <!-- 헤더 -->
    <header class="rpt-header">
      <h1 class="rpt-title">결혼 예산표</h1>
      <p class="rpt-date">{{ dateStr }}</p>
    </header>

    <!-- 요약 -->
    <div class="rpt-summary">
      <div class="rpt-sum-item">
        <span class="rpt-sum-label">총 예산</span>
        <span class="rpt-sum-value">{{ fmt(plan?.total ?? 0) }}<small>만원</small></span>
      </div>
      <div class="rpt-sum-item">
        <span class="rpt-sum-label">지출 완료</span>
        <span class="rpt-sum-value rpt-spent">{{ fmt(spent) }}<small>만원</small></span>
      </div>
      <div class="rpt-sum-item">
        <span class="rpt-sum-label">잔여 예산</span>
        <span class="rpt-sum-value rpt-remain">{{ fmt(remaining) }}<small>만원</small></span>
      </div>
      <div class="rpt-sum-item">
        <span class="rpt-sum-label">사용률</span>
        <span class="rpt-sum-value">{{ pct }}<small>%</small></span>
      </div>
    </div>

    <!-- 프로그레스 -->
    <div class="rpt-progress">
      <div class="rpt-progress-fill" :style="{ width: `${Math.min(pct, 100)}%` }" />
    </div>

    <!-- 카테고리별 테이블 -->
    <section
      v-for="cat in CATEGORY_ORDER.filter(c => (grouped[c]?.length ?? 0) > 0)"
      :key="cat"
      class="rpt-cat"
    >
      <div class="rpt-cat-head">
        <span>{{ cat }}</span>
        <span class="rpt-cat-total">{{ fmt(categoryTotals[cat]) }}만원</span>
      </div>
      <table class="rpt-table">
        <thead>
          <tr>
            <th>항목</th>
            <th class="r">금액</th>
            <th class="r">계약금</th>
            <th class="r">잔금</th>
            <th class="c">결제</th>
            <th class="c">상태</th>
            <th class="c">결제자</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in grouped[cat]" :key="item.id">
            <td>{{ item.name }}</td>
            <td class="r">{{ fmt(item.amount) }}</td>
            <td class="r">{{ item.deposit ? fmt(item.deposit) : '-' }}</td>
            <td class="r">{{ item.balance ? fmt(item.balance) : '-' }}</td>
            <td class="c">{{ item.pay_method || '카드' }}</td>
            <td class="c"><span :class="STATUS_CLS[item.status]">{{ STATUS_KR[item.status] }}</span></td>
            <td class="c">{{ item.payer || '-' }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td class="sub-label">소계</td>
            <td class="r sub-val">{{ fmt(categoryTotals[cat]) }}만원</td>
            <td colspan="5" />
          </tr>
        </tfoot>
      </table>
    </section>

    <!-- 통계 -->
    <div class="rpt-stats">
      <div class="rpt-stat-box">
        <div class="rpt-stat-title">결제자별 합계</div>
        <div v-for="(amt, key) in payerTotals" :key="key" class="rpt-stat-row">
          <span>{{ key || '미정' }}</span>
          <span class="rpt-stat-val">{{ fmt(amt) }}만원</span>
        </div>
      </div>
      <div class="rpt-stat-box">
        <div class="rpt-stat-title">결제방식별 합계</div>
        <div v-for="(amt, key) in payMethodTotals" :key="key" class="rpt-stat-row">
          <span>{{ key }}</span>
          <span class="rpt-stat-val">{{ fmt(amt) }}만원</span>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <footer class="rpt-footer">
      딸깍웨딩 예산 리포트  |  {{ dateStr }}
    </footer>
  </div>
</template>

<style scoped>
.rpt {
  max-width: 794px;
  margin: 0 auto;
  padding: 24px 22px;
  background: #fff;
  font-family: 'Pretendard', -apple-system, sans-serif;
  color: #1a1a1a;
  line-height: 1.5;
  font-size: 12px;
}

.rpt-header { text-align: center; margin-bottom: 22px; }
.rpt-title { font-size: 22px; font-weight: 800; color: #2a1520; margin: 0 0 4px; }
.rpt-date { font-size: 11px; color: #999; margin: 0; }

/* 요약 */
.rpt-summary {
  display: grid; grid-template-columns: repeat(4, 1fr);
  background: #fafaf8; border: 1px solid #eee; border-radius: 10px;
  padding: 14px 16px; margin-bottom: 8px;
}
.rpt-sum-item { text-align: center; }
.rpt-sum-label { display: block; font-size: 10px; color: #999; margin-bottom: 3px; }
.rpt-sum-value { font-size: 17px; font-weight: 700; }
.rpt-sum-value small { font-size: 11px; font-weight: 500; margin-left: 1px; }
.rpt-spent { color: #f2728a; }
.rpt-remain { color: #c4a059; }

.rpt-progress { height: 5px; background: #f0f0f0; border-radius: 3px; overflow: hidden; margin-bottom: 22px; }
.rpt-progress-fill { height: 100%; background: #f2728a; border-radius: 3px; }

/* 카테고리 */
.rpt-cat { margin-bottom: 16px; break-inside: avoid; }
.rpt-cat-head {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; font-weight: 700; color: #333;
  border-bottom: 2px solid #f2728a; padding-bottom: 5px;
}
.rpt-cat-total { color: #f2728a; }

/* 테이블 */
.rpt-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.rpt-table th {
  background: #fff0f3; color: #c9325a; font-weight: 600;
  padding: 6px 8px; text-align: left; font-size: 10px;
  border-bottom: 1px solid #eee;
}
.rpt-table td { padding: 5px 8px; border-bottom: 1px solid #f5f5f5; }
.rpt-table .r { text-align: right; }
.rpt-table .c { text-align: center; }
.rpt-table tfoot td { font-weight: 700; background: #fff0f3; border-bottom: none; }
.sub-label { color: #c9325a; }
.sub-val { color: #c9325a; }

.st-done { color: #22c55e; font-weight: 600; }
.st-prog { color: #3b82f6; font-weight: 600; }
.st-todo { color: #999; }
.st-cancel { color: #ef4444; }

/* 통계 */
.rpt-stats {
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  margin-top: 18px; padding-top: 16px; border-top: 1px solid #eee;
}
.rpt-stat-title { font-size: 11px; font-weight: 700; color: #333; margin-bottom: 6px; }
.rpt-stat-row { display: flex; justify-content: space-between; font-size: 11px; color: #666; padding: 2px 0; }
.rpt-stat-val { font-weight: 600; color: #1a1a1a; }

/* 푸터 */
.rpt-footer {
  text-align: center; font-size: 9px; color: #bbb;
  margin-top: 24px; padding-top: 12px; border-top: 1px solid #eee;
}
</style>
