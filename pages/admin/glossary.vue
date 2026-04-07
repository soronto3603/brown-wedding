<script setup lang="ts">
const supabase = useSupabaseClient()

const items = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const editing = ref<any | null>(null)
const isNew = ref(false)

const uploadRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadResult = ref('')

const CATS = ['준비단계', '예식장', '스드메', '예물예단', '음식', '비용']

async function fetchAll() {
  loading.value = true
  const { data } = await supabase.from('bw_glossary').select('*').order('category').order('sort_order')
  items.value = data ?? []
  loading.value = false
}
onMounted(fetchAll)

function openNew() {
  isNew.value = true
  editing.value = { term: '', description: '', category: '준비단계', sort_order: 0 }
}

function openEdit(item: any) {
  isNew.value = false
  editing.value = { ...item }
}

function closeEdit() { editing.value = null }

async function save() {
  if (!editing.value) return
  saving.value = true

  const payload = {
    term: editing.value.term.trim(),
    description: editing.value.description.trim(),
    category: editing.value.category,
    sort_order: editing.value.sort_order ?? 0,
  }

  if (isNew.value) {
    const { data, error } = await supabase.from('bw_glossary').insert(payload).select().single()
    if (!error && data) items.value = [...items.value, data]
  } else {
    const { id } = editing.value
    const { error } = await supabase.from('bw_glossary').update(payload).eq('id', id)
    if (!error) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...payload, id }
    }
  }
  saving.value = false
  closeEdit()
}

async function remove(id: string, term: string) {
  if (!confirm(`"${term}" 용어를 삭제하시겠습니까?`)) return
  const { error } = await supabase.from('bw_glossary').delete().eq('id', id)
  if (!error) items.value = items.value.filter(i => i.id !== id)
}

const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const item of items.value) {
    if (!map[item.category]) map[item.category] = []
    map[item.category].push(item)
  }
  return map
})

// ── 엑셀 다운로드 ──────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const headers = ['term', 'category', 'description', 'sort_order']
  const cats = CATS.join(' / ')
  const example1 = ['스드메', '스드메', '스튜디오 + 드레스 + 메이크업의 줄임말. 웨딩 사진, 드레스, 헤어메이크업 패키지.', 1]
  const example2 = ['보증인원', '예식장', '웨딩홀에서 계약 시 최소 보장해야 하는 하객 인원 수.', 2]
  const note = [`* category는 다음 중 하나: ${cats}`, '', '', '']
  const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2, note])
  ws['!cols'] = [{ wch: 16 }, { wch: 12 }, { wch: 50 }, { wch: 10 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'glossary')
  XLSX.writeFile(wb, 'bw_glossary_template.xlsx')
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

    const validCats = new Set(CATS)
    const inserts = rows
      .filter(r => r.term?.toString().trim() && r.description?.toString().trim())
      .map(r => ({
        term: String(r.term).trim(),
        category: validCats.has(String(r.category)) ? String(r.category) : '준비단계',
        description: String(r.description).trim(),
        sort_order: r.sort_order ? Number(r.sort_order) : 0,
      }))

    if (inserts.length === 0) {
      uploadResult.value = '❌ 유효한 데이터가 없습니다 (term, description 컬럼 필수)'
      uploading.value = false
      return
    }

    const { error } = await supabase.from('bw_glossary').insert(inserts)
    if (error) throw error

    uploadResult.value = `✅ ${inserts.length}개 용어 추가 완료`
    fetchAll()
  } catch (err: any) {
    uploadResult.value = `❌ 오류: ${err.message ?? err}`
  } finally {
    uploading.value = false
    if (uploadRef.value) uploadRef.value.value = ''
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>용어사전 관리</h1>
      <p>전체 {{ items.length }}개</p>
    </div>

    <div class="admin-toolbar">
      <button class="admin-btn-primary" @click="openNew">+ 새 용어 추가</button>
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

    <template v-else>
      <div v-for="(list, cat) in grouped" :key="cat" class="glossary-group">
        <div class="glossary-group-title">{{ cat }} ({{ list.length }})</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>용어</th><th>설명</th><th>순서</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="item in list" :key="item.id">
                <td class="td-term">{{ item.term }}</td>
                <td class="td-desc">{{ item.description.slice(0, 80) }}{{ item.description.length > 80 ? '…' : '' }}</td>
                <td>{{ item.sort_order }}</td>
                <td class="td-actions">
                  <button class="admin-btn-sm" @click="openEdit(item)">편집</button>
                  <button class="admin-btn-danger" @click="remove(item.id, item.term)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 편집/추가 모달 -->
    <div v-if="editing" class="admin-modal-backdrop" @click.self="closeEdit">
      <div class="admin-modal">
        <div class="admin-modal-title">{{ isNew ? '용어 추가' : '용어 편집' }}</div>
        <div class="admin-form-row">
          <label>용어 *</label>
          <input v-model="editing.term" class="admin-input" placeholder="용어명" />
        </div>
        <div class="admin-form-row">
          <label>카테고리</label>
          <select v-model="editing.category" class="admin-select">
            <option v-for="c in CATS" :key="c">{{ c }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>설명 *</label>
          <textarea v-model="editing.description" class="admin-textarea" rows="4" placeholder="용어 설명" />
        </div>
        <div class="admin-form-row">
          <label>순서</label>
          <input v-model.number="editing.sort_order" type="number" class="admin-input" style="width:80px" />
        </div>
        <div class="admin-modal-actions">
          <button class="admin-btn-primary" :disabled="saving || !editing.term.trim() || !editing.description.trim()" @click="save">
            {{ saving ? '저장 중...' : '저장' }}
          </button>
          <button class="admin-btn-ghost" @click="closeEdit">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 1000px; }
.admin-page-header { margin-bottom: 16px; }
.admin-page-header h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.admin-page-header p { font-size: 13px; color: #888; margin: 0; }
.admin-loading { padding: 40px; text-align: center; color: #888; }

.admin-toolbar { display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; align-items: center; }
.admin-btn-primary { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
.admin-btn-primary:disabled { opacity: 0.5; cursor: default; }
.admin-btn-outline { padding: 7px 14px; background: #fff; color: #444; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
.admin-btn-outline:hover { background: #f5f5f5; }
.upload-label { display: inline-flex; align-items: center; cursor: pointer; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; margin-left: 4px; }

.upload-result { padding: 8px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 10px; }
.upload-result.ok { background: #e8f5e9; color: #2e7d32; }
.upload-result.err { background: #fce4ec; color: #c62828; }

.glossary-group { margin-bottom: 20px; }
.glossary-group-title { font-size: 13px; font-weight: 700; color: #555; margin-bottom: 8px; padding-left: 2px; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.td-term { font-weight: 600; white-space: nowrap; }
.td-desc { color: #555; max-width: 400px; }
.td-actions { white-space: nowrap; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto; }
.admin-modal-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.admin-form-row label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.admin-textarea { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; width: 100%; box-sizing: border-box; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
</style>
