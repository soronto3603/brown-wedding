<script setup lang="ts">
const { PRIMARY, PRIMARY_LT, GOLD, TEXT, MUTED, BORDER } = useThemeColors()
const user = useSupabaseUser()
const { openAuthModal } = useAuthModal()

const {
  plan, items, loading, spent, pct, remaining,
  updateTotal, addItem, toggleStatus, deleteItem,
  BUDGET_CATEGORIES,
} = useBudget()

const editingTotal = ref(false)
const totalInput = ref(0)
const showAddForm = ref(false)
const newCategory = ref('웨딩홀')
const newName = ref('')
const newAmount = ref(0)

function requireLogin(): boolean {
  if (user.value) return true
  openAuthModal()
  return false
}

function startEditTotal() {
  if (!requireLogin()) return
  totalInput.value = plan.value?.total ?? 3000
  editingTotal.value = true
}

async function saveTotal() {
  await updateTotal(totalInput.value)
  editingTotal.value = false
}

async function submitAdd() {
  if (!newName.value.trim() || newAmount.value <= 0) return
  await addItem({ category: newCategory.value, name: newName.value.trim(), amount: newAmount.value })
  newName.value = ''
  newAmount.value = 0
  showAddForm.value = false
}

const CATEGORY_ICONS: Record<string, string> = {
  '웨딩홀': '🏛', '스드메': '📸', '허니문': '✈️', '예물예단': '💍',
  '청첩장': '📨', '답례품': '🎁', '기타': '📦',
}
</script>

<template>
  <div class="page-wrap">
    <div class="page-inner">
      <!-- 로딩 -->
      <div v-if="loading && !plan" :style="{ textAlign: 'center', padding: '60px 0', color: MUTED }">
        불러오는 중...
      </div>

      <template v-else>
        <!-- 예산 요약 카드 -->
        <div class="card" :style="{ padding: '18px', marginBottom: '14px' }">
          <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '14px' }">
            <div :style="{ textAlign: 'left' }">
              <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">총 예산</div>
              <template v-if="!editingTotal">
                <div
                  :style="{ fontSize: '18px', fontWeight: 700, color: TEXT, cursor: 'pointer' }"
                  @click="startEditTotal"
                >
                  {{ (plan?.total ?? 0).toLocaleString() }}만원
                </div>
              </template>
              <template v-else>
                <div :style="{ display: 'flex', gap: '4px', alignItems: 'center' }">
                  <input
                    v-model.number="totalInput"
                    type="number"
                    :style="{
                      width: '80px', fontSize: '16px', fontWeight: 700,
                      border: `1px solid ${BORDER}`, borderRadius: '6px',
                      padding: '2px 6px', outline: 'none', color: TEXT,
                      fontFamily: 'inherit',
                    }"
                    @keydown.enter="saveTotal"
                  />
                  <button class="btn-primary" :style="{ padding: '4px 10px', fontSize: '11px' }" @click="saveTotal">확인</button>
                </div>
              </template>
            </div>
            <div :style="{ textAlign: 'center' }">
              <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">지출 완료</div>
              <div :style="{ fontSize: '18px', fontWeight: 700, color: PRIMARY }">
                {{ spent.toLocaleString() }}만원
              </div>
            </div>
            <div :style="{ textAlign: 'right' }">
              <div :style="{ fontSize: '11px', color: MUTED, marginBottom: '3px' }">잔여 예산</div>
              <div :style="{ fontSize: '18px', fontWeight: 700, color: GOLD }">
                {{ remaining.toLocaleString() }}만원
              </div>
            </div>
          </div>
          <div :style="{ height: '6px', background: '#F0F0F0', borderRadius: '3px', overflow: 'hidden' }">
            <div :style="{ height: '100%', width: `${Math.min(pct, 100)}%`, background: PRIMARY, borderRadius: '3px', transition: 'width 0.3s ease' }" />
          </div>
          <div :style="{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }">
            <span :style="{ fontSize: '11px', color: MUTED }">{{ pct }}% 사용</span>
          </div>
        </div>

        <!-- 항목 추가 버튼 -->
        <div v-if="!showAddForm" :style="{ marginBottom: '14px' }">
          <button
            class="btn-primary"
            :style="{ width: '100%', padding: '10px', borderRadius: '12px' }"
            @click="requireLogin() && (showAddForm = true)"
          >
            + 항목 추가
          </button>
        </div>

        <!-- 추가 폼 -->
        <div v-if="showAddForm" class="card" :style="{ padding: '14px', marginBottom: '14px' }">
          <div :style="{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }">
            <select
              v-model="newCategory"
              :style="{
                fontFamily: 'inherit', fontSize: '13px', padding: '6px 10px',
                border: `1px solid ${BORDER}`, borderRadius: '8px',
                outline: 'none', color: TEXT, background: '#fff',
              }"
            >
              <option v-for="c in BUDGET_CATEGORIES" :key="c">{{ c }}</option>
            </select>
            <input
              v-model="newName"
              placeholder="항목명"
              :style="{
                flex: 1, minWidth: '120px', fontFamily: 'inherit', fontSize: '13px',
                padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: '8px',
                outline: 'none', color: TEXT,
              }"
            />
            <input
              v-model.number="newAmount"
              type="number"
              placeholder="금액(만원)"
              :style="{
                width: '90px', fontFamily: 'inherit', fontSize: '13px',
                padding: '6px 10px', border: `1px solid ${BORDER}`, borderRadius: '8px',
                outline: 'none', color: TEXT,
              }"
            />
          </div>
          <div :style="{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }">
            <button class="btn-primary" @click="submitAdd">추가</button>
            <button
              :style="{
                fontFamily: 'inherit', fontSize: '13px', padding: '7px 16px',
                background: 'transparent', border: `1px solid ${BORDER}`,
                borderRadius: '99px', color: MUTED, cursor: 'pointer',
              }"
              @click="showAddForm = false"
            >
              취소
            </button>
          </div>
        </div>

        <!-- 항목 리스트 -->
        <div v-if="items.length > 0" class="card" :style="{ overflow: 'hidden' }">
          <div
            v-for="(item, i) in items"
            :key="item.id"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '13px 14px',
              borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none',
            }"
          >
            <div
              :style="{
                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                background: item.status === 'done' ? PRIMARY_LT : '#F5F5F5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', cursor: 'pointer',
              }"
              @click="toggleStatus(item.id)"
            >
              {{ CATEGORY_ICONS[item.category] ?? '📦' }}
            </div>
            <div :style="{ flex: 1, cursor: 'pointer' }" @click="toggleStatus(item.id)">
              <div
                :style="{
                  fontSize: '14px', fontWeight: 500,
                  color: item.status === 'done' ? '#AAAAAA' : TEXT,
                  textDecoration: item.status === 'done' ? 'line-through' : 'none',
                }"
              >
                {{ item.name }}
              </div>
              <div :style="{ fontSize: '11px', color: MUTED }">{{ item.category }}</div>
            </div>
            <div :style="{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }">
              <div>
                <div :style="{ fontSize: '14px', fontWeight: 600, color: TEXT, marginBottom: '2px' }">
                  {{ item.amount.toLocaleString() }}만원
                </div>
                <span :class="['badge', item.status === 'done' ? 'badge-success' : 'badge-primary']">
                  {{ item.status === 'done' ? '완료' : '준비중' }}
                </span>
              </div>
              <span
                :style="{ fontSize: '16px', color: MUTED, cursor: 'pointer', padding: '4px' }"
                @click="deleteItem(item.id)"
              >
                ×
              </span>
            </div>
          </div>
        </div>

        <div v-else-if="!loading" :style="{ textAlign: 'center', padding: '40px 0', color: MUTED, fontSize: '14px' }">
          아직 등록된 예산 항목이 없어요.<br/>위의 "항목 추가" 버튼으로 시작해보세요!
        </div>
      </template>
    </div>
  </div>
</template>
