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
const isNew = ref(false)
const saving = ref(false)

const uploadRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadResult = ref('')

const STATUS_OPTIONS = ['pending', 'active', 'inactive']
const STATUS_LABELS: Record<string, string> = { pending: '대기', active: '활성', inactive: '비활성' }
const STATUS_COLORS: Record<string, string> = { pending: '#f0a500', active: '#52b788', inactive: '#aaa' }
const MOODS = ['럭셔리', '모던', '클래식', '내추럴', '로맨틱']
const HALL_TYPES = ['웨딩홀', '컨벤션', '호텔', '채플', '야외', '한옥', '기타']

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

function openNew() {
  isNew.value = true
  editing.value = {
    name: '', region_city: '', region_district: '', address: '',
    phone: '', capacity_min: null, capacity_max: null,
    food_price_min: null, food_price_max: null,
    mood: '모던', hall_type: [], status: 'active', is_verified: false,
    lat: null, lng: null,
  }
}

function openEdit(hall: any) {
  isNew.value = false
  editing.value = { ...hall, hall_type: hall.hall_type ?? [] }
}

function closeEdit() { editing.value = null }

async function save() {
  if (!editing.value || !editing.value.name.trim()) return
  saving.value = true

  const payload: any = {
    name: editing.value.name.trim(),
    region_city: editing.value.region_city || null,
    region_district: editing.value.region_district || null,
    address: editing.value.address || null,
    phone: editing.value.phone || null,
    capacity_min: editing.value.capacity_min || null,
    capacity_max: editing.value.capacity_max || null,
    food_price_min: editing.value.food_price_min || null,
    food_price_max: editing.value.food_price_max || null,
    mood: editing.value.mood || null,
    hall_type: editing.value.hall_type?.length ? editing.value.hall_type : null,
    status: editing.value.status,
    is_verified: editing.value.is_verified,
    lat: editing.value.lat || null,
    lng: editing.value.lng || null,
    updated_at: new Date().toISOString(),
  }

  if (isNew.value) {
    const { data, error } = await supabase.from('bw_halls').insert(payload).select('id, name, region_city, region_district, status, is_verified, capacity_min, capacity_max, food_price_min, food_price_max, created_at').single()
    if (!error && data) {
      halls.value = [data, ...halls.value]
      total.value++
    }
  } else {
    const { id } = editing.value
    const { error } = await supabase.from('bw_halls').update(payload).eq('id', id)
    if (!error) {
      const idx = halls.value.findIndex(h => h.id === id)
      if (idx !== -1) halls.value[idx] = { ...halls.value[idx], ...payload, id }
    }
  }

  saving.value = false
  closeEdit()
}

async function softDelete(id: string, name: string) {
  if (!confirm(`"${name}"을 비활성화하시겠습니까?\n(status=inactive 처리되며 지도에서 숨겨집니다)`)) return
  const { error } = await supabase.from('bw_halls').update({ status: 'inactive' }).eq('id', id)
  if (!error) {
    const idx = halls.value.findIndex(h => h.id === id)
    if (idx !== -1) halls.value[idx] = { ...halls.value[idx], status: 'inactive' }
  }
}

// ── 엑셀 다운로드 ──────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const headers = ['name', 'region_city', 'region_district', 'address', 'phone',
    'capacity_min', 'capacity_max', 'food_price_min(만원)', 'food_price_max(만원)',
    'mood', 'hall_type(쉼표구분)', 'lat', 'lng']
  const example = ['예시웨딩홀', '서울', '강남구', '서울 강남구 테헤란로 1',
    '02-0000-0000', 150, 300, 8, 12, '모던', '웨딩홀,컨벤션', 37.5, 127.0]
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  ws['!cols'] = headers.map(() => ({ wch: 18 }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'halls')
  XLSX.writeFile(wb, 'bw_halls_template.xlsx')
}

async function handleUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  uploadResult.value = ''

  try {
    const XLSX = await import('xlsx')
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws)

    const inserts = rows
      .filter(r => r.name?.toString().trim())
      .map(r => ({
        name: String(r.name).trim(),
        region_city: r.region_city ? String(r.region_city) : null,
        region_district: r.region_district ? String(r.region_district) : null,
        address: r.address ? String(r.address) : null,
        phone: r.phone ? String(r.phone) : null,
        capacity_min: r.capacity_min ? Number(r.capacity_min) : null,
        capacity_max: r.capacity_max ? Number(r.capacity_max) : null,
        food_price_min: r['food_price_min(만원)'] ? Number(r['food_price_min(만원)']) * 1000 : (r.food_price_min ? Number(r.food_price_min) * 1000 : null),
        food_price_max: r['food_price_max(만원)'] ? Number(r['food_price_max(만원)']) * 1000 : (r.food_price_max ? Number(r.food_price_max) * 1000 : null),
        mood: r.mood ? String(r.mood) : null,
        hall_type: r['hall_type(쉼표구분)'] ? String(r['hall_type(쉼표구분)']).split(',').map((s: string) => s.trim()) : null,
        lat: r.lat ? Number(r.lat) : null,
        lng: r.lng ? Number(r.lng) : null,
        status: 'pending',
      }))

    if (inserts.length === 0) {
      uploadResult.value = '❌ 유효한 데이터가 없습니다 (name 컬럼 필수)'
      uploading.value = false
      return
    }

    const { error } = await supabase.from('bw_halls').insert(inserts)
    if (error) throw error

    uploadResult.value = `✅ ${inserts.length}개 홀 추가 완료`
    page.value = 1
    fetchHalls()
  } catch (err: any) {
    uploadResult.value = `❌ 오류: ${err.message ?? err}`
  } finally {
    uploading.value = false
    if (uploadRef.value) uploadRef.value.value = ''
  }
}

function toggleHallType(type: string) {
  if (!editing.value) return
  const arr: string[] = editing.value.hall_type ?? []
  if (arr.includes(type)) {
    editing.value.hall_type = arr.filter((t: string) => t !== type)
  } else {
    editing.value.hall_type = [...arr, type]
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>홀 관리</h1>
      <p>전체 {{ total.toLocaleString() }}개</p>
    </div>

    <!-- 툴바 -->
    <div class="admin-toolbar">
      <input v-model="searchQ" placeholder="홀 이름 검색..." class="admin-input" @keydown.enter="search" />
      <button class="admin-btn" @click="search">검색</button>
      <select v-model="statusF" class="admin-select" @change="() => { page = 1; fetchHalls() }">
        <option>전체</option>
        <option value="pending">대기</option>
        <option value="active">활성</option>
        <option value="inactive">비활성</option>
      </select>
      <div class="toolbar-spacer" />
      <button class="admin-btn-primary" @click="openNew">+ 새 홀 추가</button>
      <button class="admin-btn-outline" @click="downloadTemplate">⬇ 엑셀 양식</button>
      <label class="admin-btn-outline upload-label">
        {{ uploading ? '업로드 중...' : '⬆ 엑셀 업로드' }}
        <input ref="uploadRef" type="file" accept=".xlsx,.xls" style="display:none" @change="handleUpload" />
      </label>
    </div>

    <div v-if="uploadResult" :class="['upload-result', uploadResult.startsWith('✅') ? 'ok' : 'err']">
      {{ uploadResult }}
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
          <tr v-for="h in halls" :key="h.id" :class="{ inactive: h.status === 'inactive' }">
            <td class="td-name">{{ h.name }}</td>
            <td>{{ [h.region_city, h.region_district].filter(Boolean).join(' ') || '-' }}</td>
            <td>{{ h.capacity_min ?? '-' }}~{{ h.capacity_max ?? '-' }}명</td>
            <td>{{ h.food_price_min ? `${Math.round(h.food_price_min/1000)}~${h.food_price_max ? Math.round(h.food_price_max/1000) : '?'}만` : '-' }}</td>
            <td>
              <span class="status-badge" :style="{ background: STATUS_COLORS[h.status] + '22', color: STATUS_COLORS[h.status] }">
                {{ STATUS_LABELS[h.status] ?? h.status }}
              </span>
            </td>
            <td>
              <span v-if="h.is_verified" class="verified-badge">✓ 인증</span>
              <span v-else class="unverified-badge">미인증</span>
            </td>
            <td class="td-actions">
              <button class="admin-btn-sm" @click="openEdit(h)">편집</button>
              <button class="admin-btn-danger" @click="softDelete(h.id, h.name)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="admin-pagination">
      <button :disabled="page <= 1" class="admin-btn-sm" @click="page--">이전</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" class="admin-btn-sm" @click="page++">다음</button>
    </div>

    <!-- 편집 / 추가 모달 -->
    <div v-if="editing" class="admin-modal-backdrop" @click.self="closeEdit">
      <div class="admin-modal">
        <div class="admin-modal-title">{{ isNew ? '새 홀 추가' : '홀 편집' }}</div>

        <div class="form-grid">
          <div class="admin-form-row full">
            <label>홀 이름 *</label>
            <input v-model="editing.name" class="admin-input flex1" placeholder="홀 이름 (필수)" />
          </div>
          <div class="admin-form-row">
            <label>시/도</label>
            <input v-model="editing.region_city" class="admin-input flex1" placeholder="서울" />
          </div>
          <div class="admin-form-row">
            <label>구/군</label>
            <input v-model="editing.region_district" class="admin-input flex1" placeholder="강남구" />
          </div>
          <div class="admin-form-row full">
            <label>주소</label>
            <input v-model="editing.address" class="admin-input flex1" placeholder="상세 주소" />
          </div>
          <div class="admin-form-row">
            <label>전화번호</label>
            <input v-model="editing.phone" class="admin-input flex1" placeholder="02-0000-0000" />
          </div>
          <div class="admin-form-row">
            <label>분위기</label>
            <select v-model="editing.mood" class="admin-select flex1">
              <option value="">선택</option>
              <option v-for="m in MOODS" :key="m">{{ m }}</option>
            </select>
          </div>
          <div class="admin-form-row">
            <label>보증인원(최소)</label>
            <input v-model.number="editing.capacity_min" type="number" class="admin-input flex1" placeholder="150" />
          </div>
          <div class="admin-form-row">
            <label>보증인원(최대)</label>
            <input v-model.number="editing.capacity_max" type="number" class="admin-input flex1" placeholder="300" />
          </div>
          <div class="admin-form-row">
            <label>식대 최소(만원)</label>
            <input v-model.number="editing.food_price_min" type="number" class="admin-input flex1" placeholder="8" />
          </div>
          <div class="admin-form-row">
            <label>식대 최대(만원)</label>
            <input v-model.number="editing.food_price_max" type="number" class="admin-input flex1" placeholder="12" />
          </div>
          <div class="admin-form-row">
            <label>위도(lat)</label>
            <input v-model.number="editing.lat" type="number" step="0.0001" class="admin-input flex1" placeholder="37.5" />
          </div>
          <div class="admin-form-row">
            <label>경도(lng)</label>
            <input v-model.number="editing.lng" type="number" step="0.0001" class="admin-input flex1" placeholder="127.0" />
          </div>
          <div class="admin-form-row full">
            <label>홀 유형</label>
            <div class="tag-select">
              <button
                v-for="t in HALL_TYPES"
                :key="t"
                type="button"
                :class="['tag-btn', { active: editing.hall_type?.includes(t) }]"
                @click="toggleHallType(t)"
              >{{ t }}</button>
            </div>
          </div>
          <div class="admin-form-row">
            <label>상태</label>
            <select v-model="editing.status" class="admin-select flex1">
              <option v-for="s in STATUS_OPTIONS" :key="s" :value="s">{{ STATUS_LABELS[s] }}</option>
            </select>
          </div>
          <div class="admin-form-row">
            <label>인증</label>
            <label class="admin-toggle">
              <input v-model="editing.is_verified" type="checkbox" />
              <span>{{ editing.is_verified ? '인증됨' : '미인증' }}</span>
            </label>
          </div>
        </div>

        <div class="admin-modal-actions">
          <button class="admin-btn-primary" :disabled="saving || !editing.name.trim()" @click="save">
            {{ saving ? '저장 중...' : '저장' }}
          </button>
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

.admin-toolbar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
.toolbar-spacer { flex: 1; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.admin-btn { padding: 7px 14px; background: #e8e8e8; color: #333; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn-primary { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
.admin-btn-primary:disabled { opacity: 0.5; cursor: default; }
.admin-btn-outline { padding: 7px 14px; background: #fff; color: #444; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
.admin-btn-outline:hover { background: #f5f5f5; }
.upload-label { display: inline-flex; align-items: center; cursor: pointer; }
.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; font-weight: 600; margin-left: 4px; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }

.upload-result { padding: 8px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 10px; }
.upload-result.ok { background: #e8f5e9; color: #2e7d32; }
.upload-result.err { background: #fce4ec; color: #c62828; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr.inactive td { color: #bbb; }
.td-name { font-weight: 600; }
.td-actions { white-space: nowrap; }

.status-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.verified-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #e8f5e9; color: #52b788; }
.unverified-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; color: #aaa; }

.admin-pagination { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; font-size: 13px; color: #555; }

/* 모달 */
.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 640px; max-width: 100%; max-height: 90vh; overflow-y: auto; }
.admin-modal-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.admin-form-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.admin-form-row.full { grid-column: 1 / -1; }
.admin-form-row label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }
.flex1 { flex: 1; width: 100%; box-sizing: border-box; }
.admin-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #333; cursor: pointer; padding: 7px 0; }

.tag-select { display: flex; flex-wrap: wrap; gap: 6px; padding: 4px 0; }
.tag-btn { padding: 4px 12px; border: 1px solid #ddd; border-radius: 99px; font-size: 12px; font-family: inherit; cursor: pointer; background: #fff; color: #555; transition: all 0.15s; }
.tag-btn.active { background: #1a1a2e; color: #fff; border-color: #1a1a2e; }

.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
</style>
