<script setup lang="ts">
const supabase = useSupabaseClient()

const halls = ref<any[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 30

const searchQ = ref('')
const statusF = ref('전체')

const editing = ref<any | null>(null)
const saving = ref(false)

async function fetchHalls() {
  loading.value = true
  let q = supabase
    .from('bw_halls')
    .select('id, name, region_city, region_district, status, is_verified, capacity_min, capacity_max, food_price_min, food_price_max, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE - 1)

  if (statusF.value !== '전체') q = q.eq('status', statusF.value)
  if (searchQ.value.trim()) q = q.ilike('name', `%${searchQ.value.trim()}%`)

  const { data, count, error } = await q
  if (!error) {
    halls.value = data ?? []
    total.value = count ?? 0
  }
  loading.value = false
}

watch([page, statusF], fetchHalls)
onMounted(fetchHalls)

function search() { page.value = 1; fetchHalls() }

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

function openEdit(hall: any) { editing.value = { ...hall } }
function closeEdit() { editing.value = null }

async function saveEdit() {
  if (!editing.value) return
  saving.value = true
  const { id, ...rest } = editing.value
  const { error } = await supabase.from('bw_halls').update({
    status: rest.status,
    is_verified: rest.is_verified,
  }).eq('id', id)
  if (!error) {
    const idx = halls.value.findIndex(h => h.id === id)
    if (idx !== -1) halls.value[idx] = { ...halls.value[idx], status: rest.status, is_verified: rest.is_verified }
    closeEdit()
  }
  saving.value = false
}

const STATUS_OPTIONS = ['pending', 'active', 'inactive']
const STATUS_LABELS: Record<string, string> = { pending: '대기', active: '활성', inactive: '비활성' }
const STATUS_COLORS: Record<string, string> = { pending: '#f0a500', active: '#52b788', inactive: '#aaa' }
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>홀 관리</h1>
      <p>전체 {{ total.toLocaleString() }}개</p>
    </div>

    <!-- 검색 / 필터 -->
    <div class="admin-toolbar">
      <input v-model="searchQ" placeholder="홀 이름 검색..." class="admin-input" @keydown.enter="search" />
      <button class="admin-btn" @click="search">검색</button>
      <select v-model="statusF" class="admin-select" @change="() => { page = 1; fetchHalls() }">
        <option>전체</option>
        <option value="pending">대기</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>이름</th>
            <th>지역</th>
            <th>인원(보증)</th>
            <th>식대</th>
            <th>상태</th>
            <th>인증</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="h in halls" :key="h.id">
            <td class="td-name">{{ h.name }}</td>
            <td>{{ h.region_city }} {{ h.region_district }}</td>
            <td>{{ h.capacity_min ?? '-' }}~{{ h.capacity_max ?? '-' }}명</td>
            <td>{{ h.food_price_min ? `${h.food_price_min}~${h.food_price_max}만` : '-' }}</td>
            <td>
              <span class="status-badge" :style="{ background: STATUS_COLORS[h.status] + '22', color: STATUS_COLORS[h.status] }">
                {{ STATUS_LABELS[h.status] ?? h.status }}
              </span>
            </td>
            <td>
              <span v-if="h.is_verified" class="verified-badge">✓ 인증</span>
              <span v-else class="unverified-badge">미인증</span>
            </td>
            <td><button class="admin-btn-sm" @click="openEdit(h)">편집</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="totalPages > 1" class="admin-pagination">
      <button :disabled="page <= 1" class="admin-btn-sm" @click="page--">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" class="admin-btn-sm" @click="page++">다음</button>
    </div>

    <!-- 편집 모달 -->
    <div v-if="editing" class="admin-modal-backdrop" @click.self="closeEdit">
      <div class="admin-modal">
        <div class="admin-modal-title">홀 편집 — {{ editing.name }}</div>
        <div class="admin-form-row">
          <label>상태</label>
          <select v-model="editing.status" class="admin-select">
            <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_LABELS[s] }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>인증 여부</label>
          <label class="admin-toggle">
            <input v-model="editing.is_verified" type="checkbox" />
            <span>{{ editing.is_verified ? '인증됨' : '미인증' }}</span>
          </label>
        </div>
        <div class="admin-modal-actions">
          <button class="admin-btn" :disabled="saving" @click="saveEdit">{{ saving ? '저장 중...' : '저장' }}</button>
          <button class="admin-btn-ghost" @click="closeEdit">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 1100px; }
.admin-page-header { margin-bottom: 16px; }
.admin-page-header h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.admin-page-header p { font-size: 13px; color: #888; margin: 0; }
.admin-loading { padding: 40px; text-align: center; color: #888; }

.admin-toolbar { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; min-width: 200px; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.admin-btn { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn:disabled { opacity: 0.5; cursor: default; }
.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-sm:disabled { opacity: 0.4; cursor: default; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.td-name { font-weight: 600; }

.status-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.verified-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #e8f5e9; color: #52b788; }
.unverified-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; color: #aaa; }

.admin-pagination { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; font-size: 13px; color: #555; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 380px; max-width: 90vw; }
.admin-modal-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.admin-form-row label { width: 80px; font-size: 13px; color: #555; flex-shrink: 0; }
.admin-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #333; cursor: pointer; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
</style>
