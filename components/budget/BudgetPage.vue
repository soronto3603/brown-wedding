<script setup lang="ts">
import type { BwBudgetItem } from '~/composables/useBudget'

const { PRIMARY, PRIMARY_LT, GOLD, TEXT, MUTED, BORDER } = useThemeColors()
const user = useSupabaseUser()
const { openAuthModal } = useAuthModal()

const {
  plan, items, loading, spent, pct, remaining,
  groupedByCategory, categoryTotals, payerTotals, payMethodTotals,
  updateTotal, addItem, updateItem, deleteItem,
  BUDGET_CATEGORIES,
} = useBudget()

const editingTotal = ref(false)
const totalInput = ref(0)
const expandedCats = ref<Record<string, boolean>>({})

// 카테고리별 인라인 추가 폼
const addingCat = ref<string | null>(null)
const newName = ref('')
const newAmount = ref<number | null>(null)
const newDeposit = ref<number | null>(null)
const newBalance = ref<number | null>(null)
const newPayMethod = ref('카드')
const newPayer = ref('')

// 인라인 수정
const editingId = ref<string | null>(null)
const editData = ref<Partial<BwBudgetItem>>({})

// 바텀시트 (전역 store)
const sheet = useBottomSheet()
const isMobile = ref(false)
function checkMobile() { isMobile.value = import.meta.client && window.innerWidth <= 768 }
onMounted(() => { checkMobile(); window.addEventListener('resize', checkMobile) })
onUnmounted(() => { if (import.meta.client) window.removeEventListener('resize', checkMobile) })

const PAY_METHODS = ['카드', '현금', '이체'] as const
const PAYERS = ['', '신랑', '신부', '공동'] as const
const PAYER_LABELS: Record<string, string> = { '': '미정', '신랑': '신랑', '신부': '신부', '공동': '공동' }

const STATUS_LABELS: Record<string, string> = {
  todo: '진행전', in_progress: '진행중', done: '완료', cancelled: '취소',
}
const STATUS_COLORS: Record<string, string> = {
  todo: '#999', in_progress: '#3b82f6', done: '#22c55e', cancelled: '#ef4444',
}
const CATEGORY_ICONS: Record<string, string> = {
  '웨딩홀': '🏛', '스드메': '📸', '허니문': '✈️', '예물예단': '💍',
  '청첩장': '📨', '답례품': '🎁', '기타': '📦',
}

function requireLogin(): boolean {
  if (user.value) return true
  openAuthModal()
  return false
}

function toggleCat(cat: string) { expandedCats.value[cat] = !expandedCats.value[cat] }
function fmt(n: number) { return n.toLocaleString() }
function printReport() { window.print() }

// 총 예산 수정
function startEditTotal() {
  if (!requireLogin()) return
  totalInput.value = plan.value?.total ?? 3000
  editingTotal.value = true
}
async function saveTotal() { await updateTotal(totalInput.value); editingTotal.value = false }

// 카테고리 내 추가
function startAddInCat(cat: string) {
  if (!requireLogin()) return
  addingCat.value = cat
  newName.value = ''
  newAmount.value = null
  newDeposit.value = null
  newBalance.value = null
  newPayMethod.value = '카드'
  newPayer.value = ''
  if (isMobile.value) sheet.open('budget-add', { category: cat })
}
function cancelAdd() { addingCat.value = null; sheet.close() }
async function submitInlineAdd() {
  if (!newName.value.trim() || !newAmount.value || newAmount.value <= 0 || !addingCat.value) return
  await addItem({
    category: addingCat.value,
    name: newName.value.trim(),
    amount: newAmount.value,
    deposit: newDeposit.value ?? 0,
    balance: newBalance.value ?? 0,
    pay_method: newPayMethod.value,
    payer: newPayer.value,
  })
  addingCat.value = null
  sheet.close()
}

// 인라인 수정
function startEdit(item: BwBudgetItem) {
  if (!requireLogin()) return
  editingId.value = item.id
  editData.value = {
    name: item.name,
    amount: item.amount,
    deposit: item.deposit,
    balance: item.balance,
    pay_method: item.pay_method,
    payer: item.payer,
    status: item.status,
  }
  if (isMobile.value) sheet.open('budget-edit', { itemId: item.id })
}
function cancelEdit() { editingId.value = null; sheet.close() }
async function saveEdit() {
  if (!editingId.value || !editData.value.name?.trim()) return
  await updateItem(editingId.value, editData.value as any)
  editingId.value = null
  sheet.close()
}
async function confirmDelete(id: string) {
  if (!requireLogin()) return
  await deleteItem(id)
  if (editingId.value === id) editingId.value = null
}
async function cycleStatus(id: string) {
  const item = items.value.find((i) => i.id === id)
  if (!item) return
  const order: Array<'todo' | 'in_progress' | 'done'> = ['todo', 'in_progress', 'done']
  const idx = order.indexOf(item.status as any)
  const next = order[(idx + 1) % order.length]
  await updateItem(id, { status: next })
}

onMounted(() => { for (const cat of BUDGET_CATEGORIES) expandedCats.value[cat] = true })
</script>

<template>
  <div class="budget-layout">
    <div class="budget-editor">
      <div v-if="loading && !plan" :style="{ textAlign: 'center', padding: '60px 0', color: MUTED }">
        불러오는 중...
      </div>

      <template v-else>
        <!-- 요약 카드 -->
        <div class="card budget-summary">
          <div class="summary-grid">
            <div>
              <div class="summary-label">총 예산</div>
              <template v-if="!editingTotal">
                <div class="summary-value" @click="startEditTotal">
                  {{ fmt(plan?.total ?? 0) }}<span class="summary-unit">만원</span>
                </div>
              </template>
              <template v-else>
                <div :style="{ display: 'flex', gap: '4px', alignItems: 'center' }">
                  <input v-model.number="totalInput" type="number" class="total-input" @keydown.enter="saveTotal" />
                  <button class="btn-primary" :style="{ padding: '4px 10px', fontSize: '11px' }" @click="saveTotal">확인</button>
                </div>
              </template>
            </div>
            <div :style="{ textAlign: 'center' }">
              <div class="summary-label">지출 완료</div>
              <div class="summary-value" :style="{ color: PRIMARY }">{{ fmt(spent) }}<span class="summary-unit">만원</span></div>
            </div>
            <div :style="{ textAlign: 'right' }">
              <div class="summary-label">잔여 예산</div>
              <div class="summary-value" :style="{ color: GOLD }">{{ fmt(remaining) }}<span class="summary-unit">만원</span></div>
            </div>
          </div>
          <div class="progress-bg"><div class="progress-fill" :style="{ width: `${Math.min(pct, 100)}%` }" /></div>
          <div :style="{ fontSize: '11px', color: MUTED, marginTop: '6px' }">{{ pct }}% 사용</div>
        </div>

        <!-- 통계 -->
        <div v-if="items.length > 0" class="stat-row">
          <div class="card stat-card">
            <div class="stat-title">결제자별</div>
            <div v-for="(amt, key) in payerTotals" :key="key" class="stat-line">
              <span>{{ key || '미정' }}</span>
              <span class="stat-amount">{{ fmt(amt) }}만원</span>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-title">결제방식별</div>
            <div v-for="(amt, key) in payMethodTotals" :key="key" class="stat-line">
              <span>{{ key }}</span>
              <span class="stat-amount">{{ fmt(amt) }}만원</span>
            </div>
          </div>
        </div>

        <!-- ======== 모든 카테고리 항상 표시 ======== -->
        <div class="cat-list">
          <div v-for="cat in BUDGET_CATEGORIES" :key="cat" class="card cat-card">
            <!-- 헤더: 아이콘 + 이름 + 소계 + 추가버튼 + 접기 -->
            <div class="cat-header">
              <span class="cat-icon">{{ CATEGORY_ICONS[cat] }}</span>
              <span class="cat-name" @click="toggleCat(cat)">{{ cat }}</span>
              <span v-if="categoryTotals[cat]" class="cat-total">{{ fmt(categoryTotals[cat]) }}만원</span>
              <button class="cat-add-btn" title="항목 추가" @click.stop="startAddInCat(cat)">+</button>
              <svg
                class="cat-chevron" :class="{ open: expandedCats[cat] }"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                @click="toggleCat(cat)"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            <div v-if="expandedCats[cat]" class="cat-body">
              <!-- 인라인 추가 폼 -->
              <div v-if="addingCat === cat" class="inline-add">
                <div class="inline-add-row">
                  <input v-model="newName" placeholder="항목명" class="ia-input ia-name" @keydown.enter="submitInlineAdd" />
                  <input v-model.number="newAmount" type="number" placeholder="금액" class="ia-input ia-num" />
                  <input v-model.number="newDeposit" type="number" placeholder="계약금" class="ia-input ia-num" />
                </div>
                <div class="inline-add-row">
                  <select v-model="newPayMethod" class="ia-select">
                    <option v-for="m in PAY_METHODS" :key="m">{{ m }}</option>
                  </select>
                  <select v-model="newPayer" class="ia-select">
                    <option v-for="p in PAYERS" :key="p" :value="p">{{ PAYER_LABELS[p] }}</option>
                  </select>
                  <button class="ia-btn-ok" @click="submitInlineAdd">추가</button>
                  <button class="ia-btn-cancel" @click="cancelAdd">취소</button>
                </div>
              </div>

              <!-- 항목 없음 -->
              <div v-if="!groupedByCategory[cat]?.length && addingCat !== cat" class="cat-empty">
                아직 항목이 없어요
              </div>

              <!-- 항목 리스트 -->
              <template v-for="item in groupedByCategory[cat]" :key="item.id">
                <!-- 수정 모드 -->
                <div v-if="editingId === item.id" class="item-edit">
                  <div class="item-edit-row">
                    <input v-model="editData.name" class="ia-input ia-name" />
                    <input v-model.number="editData.amount" type="number" class="ia-input ia-num" />
                    <input v-model.number="editData.deposit" type="number" placeholder="계약금" class="ia-input ia-num" />
                  </div>
                  <div class="item-edit-row">
                    <select v-model="editData.pay_method" class="ia-select">
                      <option v-for="m in PAY_METHODS" :key="m">{{ m }}</option>
                    </select>
                    <select v-model="editData.payer" class="ia-select">
                      <option v-for="p in PAYERS" :key="p" :value="p">{{ PAYER_LABELS[p] }}</option>
                    </select>
                    <select v-model="editData.status" class="ia-select">
                      <option value="todo">진행전</option>
                      <option value="in_progress">진행중</option>
                      <option value="done">완료</option>
                    </select>
                    <button class="ia-btn-ok" @click="saveEdit">저장</button>
                    <button class="ia-btn-cancel" @click="cancelEdit">취소</button>
                  </div>
                </div>

                <!-- 보기 모드 -->
                <div v-else class="item-row" :class="{ done: item.status === 'done' }">
                  <span class="col-name" @click="startEdit(item)">{{ item.name }}</span>
                  <span class="col-amount">{{ fmt(item.amount) }}</span>
                  <span class="col-deposit">{{ item.deposit ? fmt(item.deposit) : '-' }}</span>
                  <span class="col-method">{{ item.pay_method || '카드' }}</span>
                  <span
                    class="col-status"
                    :style="{ color: STATUS_COLORS[item.status] }"
                    @click="cycleStatus(item.id)"
                  >{{ STATUS_LABELS[item.status] }}</span>
                  <span class="col-payer">{{ item.payer || '-' }}</span>
                  <span class="col-actions">
                    <button class="act-btn" title="수정" @click="startEdit(item)">✏️</button>
                    <button class="act-btn act-del" title="삭제" @click="confirmDelete(item.id)">×</button>
                  </span>
                </div>
              </template>

              <!-- 소계 -->
              <div v-if="groupedByCategory[cat]?.length" class="item-row subtotal-row">
                <span class="col-name">소계</span>
                <span class="col-amount">{{ fmt(categoryTotals[cat]) }}만원</span>
                <span class="col-deposit" /><span class="col-method" /><span class="col-status" /><span class="col-payer" /><span class="col-actions" />
              </div>
            </div>
          </div>
        </div>

        <!-- PDF (PC 전용) -->
        <div v-if="items.length > 0" class="pdf-section">
          <button class="btn-primary print-btn desktop-only" @click="printReport">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF 다운로드
          </button>
          <p class="mobile-only pdf-hint">📄 PDF 리포트는 PC에서 다운로드할 수 있어요</p>
        </div>
      </template>
    </div>

    <!-- 우측: 실시간 리포트 -->
    <div class="budget-preview">
      <div v-if="items.length === 0" class="preview-placeholder">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.3">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <p>예산 항목을 추가하면<br/>리포트가 실시간으로 표시돼요</p>
      </div>
      <div v-else class="preview-card">
        <BudgetReportView :plan="plan" :items="items" :grouped="groupedByCategory" :category-totals="categoryTotals" :payer-totals="payerTotals" :pay-method-totals="payMethodTotals" :spent="spent" :remaining="remaining" :pct="pct" />
      </div>
    </div>

    <!-- 인쇄 전용 -->
    <div v-if="items.length > 0" class="print-only">
      <BudgetReportView :plan="plan" :items="items" :grouped="groupedByCategory" :category-totals="categoryTotals" :payer-totals="payerTotals" :pay-method-totals="payMethodTotals" :spent="spent" :remaining="remaining" :pct="pct" />
    </div>

    <!-- 바텀시트 (BottomSheet 범용 컴포넌트 사용) -->
    <LayoutBottomSheet>
      <template #default="{ id, close: sheetClose }">
        <!-- 추가 -->
        <template v-if="id === 'budget-add'">
          <div class="sheet-title">{{ CATEGORY_ICONS[addingCat!] }} {{ addingCat }} 항목 추가</div>
          <div class="sheet-form">
            <label class="sf-label">항목명</label>
            <input v-model="newName" placeholder="예: 대관료" class="sf-input" />
            <div class="sf-row">
              <div class="sf-field"><label class="sf-label">금액 (만원)</label><input v-model.number="newAmount" type="number" placeholder="0" class="sf-input" /></div>
              <div class="sf-field"><label class="sf-label">계약금</label><input v-model.number="newDeposit" type="number" placeholder="0" class="sf-input" /></div>
            </div>
            <div class="sf-row">
              <div class="sf-field"><label class="sf-label">결제 방식</label><select v-model="newPayMethod" class="sf-input"><option v-for="m in PAY_METHODS" :key="m">{{ m }}</option></select></div>
              <div class="sf-field"><label class="sf-label">결제자</label><select v-model="newPayer" class="sf-input"><option v-for="p in PAYERS" :key="p" :value="p">{{ PAYER_LABELS[p] }}</option></select></div>
            </div>
            <div class="sf-actions">
              <button class="sf-btn-ok" @click="submitInlineAdd">추가하기</button>
              <button class="sf-btn-cancel" @click="cancelAdd">취소</button>
            </div>
          </div>
        </template>

        <!-- 수정 -->
        <template v-else-if="id === 'budget-edit'">
          <div class="sheet-title">항목 수정</div>
          <div class="sheet-form">
            <label class="sf-label">항목명</label>
            <input v-model="editData.name" class="sf-input" />
            <div class="sf-row">
              <div class="sf-field"><label class="sf-label">금액 (만원)</label><input v-model.number="editData.amount" type="number" class="sf-input" /></div>
              <div class="sf-field"><label class="sf-label">계약금</label><input v-model.number="editData.deposit" type="number" class="sf-input" /></div>
            </div>
            <div class="sf-row">
              <div class="sf-field"><label class="sf-label">결제 방식</label><select v-model="editData.pay_method" class="sf-input"><option v-for="m in PAY_METHODS" :key="m">{{ m }}</option></select></div>
              <div class="sf-field"><label class="sf-label">결제자</label><select v-model="editData.payer" class="sf-input"><option v-for="p in PAYERS" :key="p" :value="p">{{ PAYER_LABELS[p] }}</option></select></div>
            </div>
            <div class="sf-actions">
              <button class="sf-btn-ok" @click="saveEdit">저장하기</button>
              <button class="sf-btn-del" @click="editingId && confirmDelete(editingId)">삭제</button>
              <button class="sf-btn-cancel" @click="cancelEdit">취소</button>
            </div>
          </div>
        </template>
      </template>
    </LayoutBottomSheet>
  </div>
</template>

<style scoped>
/* ── 레이아웃 ── */
.budget-layout {
  display: flex; flex: 1; min-height: 0; overflow-y: auto;
  justify-content: center; align-items: flex-start;
  gap: 16px; padding: 20px 16px; background: var(--w-bg-section);
}
.budget-editor { width: 100%; max-width: 480px; display: flex; flex-direction: column; }
.budget-preview { display: none; }

@media (min-width: 1024px) {
  .budget-layout { gap: 20px; padding: 24px 20px; }
  .budget-editor { max-width: 460px; }
  .budget-preview {
    display: block; width: 460px; max-width: 460px; flex-shrink: 0;
    position: sticky; top: 24px; max-height: calc(100vh - 48px); overflow-y: auto;
  }
}
@media (min-width: 1400px) {
  .budget-editor { max-width: 500px; }
  .budget-preview { width: 500px; max-width: 500px; }
  .budget-layout { gap: 28px; }
}

.preview-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; color: var(--w-muted); font-size: 13px; text-align: center; line-height: 1.6;
  padding: 60px 20px; background: #fff; border: 1px solid var(--w-border); border-radius: var(--w-card-radius);
}
.preview-card { background: #fff; border: 1px solid var(--w-border); border-radius: var(--w-card-radius); box-shadow: var(--w-card-shadow); overflow: hidden; }
.print-only { display: none; }
.pdf-section { margin-top: 20px; margin-bottom: 24px; }
.print-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 11px 16px; border-radius: 12px; font-size: 13px; }
.desktop-only { display: flex; }
.mobile-only { display: none; }
.pdf-hint { font-size: 12px; color: var(--w-muted); text-align: center; padding: 12px 0; }

/* ── 요약 ── */
.budget-summary { padding: 18px; margin-bottom: 14px; }
.summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 14px; }
.summary-label { font-size: 11px; color: var(--w-muted); margin-bottom: 3px; }
.summary-value { font-size: 18px; font-weight: 700; cursor: pointer; }
.summary-unit { font-size: 13px; font-weight: 500; margin-left: 1px; }
.total-input { width: 80px; font-size: 16px; font-weight: 700; border: 1px solid var(--w-border); border-radius: 6px; padding: 2px 6px; outline: none; font-family: inherit; }
.progress-bg { height: 6px; background: #f0f0f0; border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--w-primary); border-radius: 3px; transition: width 0.3s ease; }

/* ── 통계 ── */
.stat-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
.stat-card { padding: 14px; }
.stat-title { font-size: 12px; font-weight: 600; color: var(--w-text); margin-bottom: 8px; }
.stat-line { display: flex; justify-content: space-between; font-size: 13px; padding: 3px 0; color: var(--w-text-secondary); white-space: nowrap; }
.stat-amount { font-weight: 600; color: var(--w-text); white-space: nowrap; }

/* ── 카테고리 ── */
.cat-list { display: flex; flex-direction: column; gap: 10px; }
.cat-card { overflow: hidden; }
.cat-header { display: flex; align-items: center; gap: 8px; padding: 12px 14px; white-space: nowrap; }
.cat-icon { font-size: 16px; flex-shrink: 0; }
.cat-name { font-size: 14px; font-weight: 600; flex: 1; cursor: pointer; }
.cat-name:hover { color: var(--w-primary); }
.cat-total { font-size: 13px; font-weight: 700; color: var(--w-primary); white-space: nowrap; }
.cat-add-btn {
  width: 26px; height: 26px; border-radius: 6px; border: 1px solid var(--w-border);
  background: #fff; color: var(--w-primary); font-size: 16px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.cat-add-btn:hover { background: var(--w-primary-lt); border-color: var(--w-primary); }
.cat-chevron { color: var(--w-muted); transition: transform 0.2s; flex-shrink: 0; cursor: pointer; }
.cat-chevron.open { transform: rotate(180deg); }
.cat-body { border-top: 1px solid var(--w-border); }
.cat-empty { padding: 20px; text-align: center; font-size: 13px; color: var(--w-muted); }

/* ── 인라인 추가/수정 폼 ── */
.inline-add, .item-edit { padding: 10px 14px; background: #fafaf8; border-bottom: 1px solid var(--w-border); }
.inline-add-row, .item-edit-row { display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
.inline-add-row:last-child, .item-edit-row:last-child { margin-bottom: 0; }
.ia-input, .ia-select {
  font-family: inherit; font-size: 12px; padding: 6px 8px;
  border: 1px solid var(--w-border); border-radius: 6px;
  outline: none; color: var(--w-text); background: #fff;
}
.ia-name { flex: 2; min-width: 80px; }
.ia-num { width: 70px; flex-shrink: 0; }
.ia-select { min-width: 60px; }
.ia-btn-ok {
  font-family: inherit; font-size: 12px; font-weight: 600; padding: 6px 14px;
  background: var(--w-primary); color: #fff; border: none; border-radius: 6px; cursor: pointer;
}
.ia-btn-ok:hover { background: var(--w-primary-mid); }
.ia-btn-cancel {
  font-family: inherit; font-size: 12px; padding: 6px 10px;
  background: transparent; color: var(--w-muted); border: 1px solid var(--w-border);
  border-radius: 6px; cursor: pointer;
}

/* ── 항목 행 ── */
.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.7fr 0.7fr 0.7fr 50px;
  align-items: center; padding: 9px 14px; font-size: 13px;
  border-bottom: 1px solid #f5f5f5; gap: 4px;
  white-space: nowrap;
}
.item-row:last-child { border-bottom: none; }
.item-row.done .col-name { text-decoration: line-through; color: #bbb; }
.subtotal-row { background: var(--w-primary-lt); font-weight: 600; font-size: 12px; }

.col-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.col-name:hover { color: var(--w-primary); }
.col-amount { text-align: right; font-weight: 500; }
.col-deposit { text-align: right; color: var(--w-muted); font-size: 12px; }
.col-method { text-align: center; font-size: 12px; color: var(--w-text-secondary); }
.col-status {
  text-align: center; font-size: 11px; font-weight: 600;
  cursor: pointer; padding: 3px 8px; border-radius: 6px;
  transition: background 0.15s;
}
.col-status:hover { background: #f0f0f0; }
.col-payer { text-align: center; font-size: 12px; color: var(--w-text-secondary); }
.col-actions { display: flex; gap: 2px; justify-content: center; }
.act-btn {
  border: none; background: transparent; cursor: pointer; font-size: 13px;
  padding: 2px 4px; border-radius: 4px; opacity: 0.4; transition: opacity 0.15s;
}
.item-row:hover .act-btn { opacity: 1; }
.act-del { color: var(--w-primary); font-size: 16px; font-weight: 700; }
.act-del:hover { background: var(--w-primary-lt); }

/* ── 모바일 ── */
@media (max-width: 768px) {
  .budget-layout {
    display: block;
    overflow-y: auto;
    padding: 12px;
    padding-bottom: 24px;
  }
  .budget-editor { max-width: 100%; display: block; }
  .stat-row { grid-template-columns: 1fr; gap: 8px; }

  /* 테이블: 모바일에서는 항목/금액/상태/액션만 */
  .item-row {
    grid-template-columns: 1fr auto auto 36px;
    font-size: 12px; padding: 8px 12px;
    gap: 8px;
  }
  .col-deposit, .col-method, .col-payer { display: none; }
  .subtotal-row .col-deposit, .subtotal-row .col-method, .subtotal-row .col-payer { display: none; }
  .subtotal-row .col-actions { display: none; }

  /* 인라인 폼 */
  .inline-add-row, .item-edit-row { gap: 4px; }
  .ia-input, .ia-select { font-size: 12px; padding: 6px 6px; }
  .ia-num { width: 60px; }

  /* PDF: 모바일에서 버튼 숨기고 안내만 */
  .desktop-only { display: none !important; }
  .mobile-only { display: block; }

  /* 모바일에서 인라인 폼 숨김 — 바텀시트 사용 */
  .inline-add, .item-edit { display: none; }

  /* 카테고리 헤더 */
  .cat-header { padding: 10px 12px; }
  .cat-name { font-size: 13px; }

  /* 요약 카드 */
  .budget-summary { padding: 14px; margin-bottom: 10px; }
  .summary-value { font-size: 16px; }

  /* 모바일: 액션 버튼 항상 보이기 */
  .act-btn { opacity: 0.7; }
}

/* ── 바텀시트 폼 (BottomSheet slot 내부) ── */
.sheet-title { font-size: 16px; font-weight: 700; color: var(--w-text); margin-bottom: 16px; }
.sheet-form { display: flex; flex-direction: column; gap: 12px; }
.sf-label { font-size: 12px; font-weight: 500; color: var(--w-text-secondary); margin-bottom: 4px; display: block; }
.sf-input {
  width: 100%; font-family: inherit; font-size: 15px; padding: 10px 12px;
  border: 1px solid var(--w-border); border-radius: 10px;
  outline: none; color: var(--w-text); background: #fafafa;
  -webkit-appearance: none;
}
.sf-input:focus { border-color: var(--w-primary); background: #fff; }
.sf-row { display: flex; gap: 10px; }
.sf-field { flex: 1; display: flex; flex-direction: column; }
.sf-actions { display: flex; gap: 8px; margin-top: 4px; }
.sf-btn-ok {
  flex: 1; font-family: inherit; font-size: 15px; font-weight: 700;
  padding: 12px; background: var(--w-primary); color: #fff;
  border: none; border-radius: 12px; cursor: pointer;
}
.sf-btn-ok:active { background: var(--w-primary-mid); }
.sf-btn-del {
  font-family: inherit; font-size: 14px; font-weight: 600;
  padding: 12px 16px; background: #fff; color: #ef4444;
  border: 1px solid #fecaca; border-radius: 12px; cursor: pointer;
}
.sf-btn-cancel {
  font-family: inherit; font-size: 14px; padding: 12px 16px;
  background: transparent; color: var(--w-muted);
  border: 1px solid var(--w-border); border-radius: 12px; cursor: pointer;
}
</style>
