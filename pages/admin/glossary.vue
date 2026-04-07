<script setup lang="ts">
const supabase = useSupabaseClient()

const items = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const editing = ref<any | null>(null)
const isNew = ref(false)

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
  editing.value = { term: '', description: '', category: '준비단계', related_terms: [], sort_order: 0 }
}

function openEdit(item: any) {
  isNew.value = false
  editing.value = { ...item, related_terms: item.related_terms ?? [] }
}

function closeEdit() { editing.value = null }

async function save() {
  if (!editing.value) return
  saving.value = true

  if (isNew.value) {
    const { data, error } = await supabase.from('bw_glossary').insert({
      term: editing.value.term,
      description: editing.value.description,
      category: editing.value.category,
      sort_order: editing.value.sort_order,
    }).select().single()
    if (!error && data) items.value = [...items.value, data]
  } else {
    const { id, ...rest } = editing.value
    const { error } = await supabase.from('bw_glossary').update({
      term: rest.term,
      description: rest.description,
      category: rest.category,
      sort_order: rest.sort_order,
    }).eq('id', id)
    if (!error) {
      const idx = items.value.findIndex(i => i.id === id)
      if (idx !== -1) items.value[idx] = { ...items.value[idx], ...rest, id }
    }
  }

  saving.value = false
  closeEdit()
}

async function remove(id: string) {
  if (!confirm('삭제하시겠습니까?')) return
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
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>용어사전 관리</h1>
      <p>전체 {{ items.length }}개</p>
    </div>

    <div class="admin-toolbar">
      <button class="admin-btn" @click="openNew">+ 새 용어 추가</button>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <template v-else>
      <div v-for="(list, cat) in grouped" :key="cat" class="glossary-group">
        <div class="glossary-group-title">{{ cat }}</div>
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
                <td>
                  <button class="admin-btn-sm" @click="openEdit(item)">편집</button>
                  <button class="admin-btn-danger" style="margin-left:4px" @click="remove(item.id)">삭제</button>
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
          <label>용어</label>
          <input v-model="editing.term" class="admin-input flex1" placeholder="용어명" />
        </div>
        <div class="admin-form-row">
          <label>카테고리</label>
          <select v-model="editing.category" class="admin-select flex1">
            <option v-for="c in CATS" :key="c">{{ c }}</option>
          </select>
        </div>
        <div class="admin-form-row align-start">
          <label style="padding-top:4px">설명</label>
          <textarea v-model="editing.description" class="admin-textarea flex1" rows="4" placeholder="용어 설명" />
        </div>
        <div class="admin-form-row">
          <label>순서</label>
          <input v-model.number="editing.sort_order" type="number" class="admin-input" style="width:80px" />
        </div>
        <div class="admin-modal-actions">
          <button class="admin-btn" :disabled="saving" @click="save">{{ saving ? '저장 중...' : '저장' }}</button>
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

.admin-toolbar { margin-bottom: 16px; }
.admin-btn { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn:disabled { opacity: 0.5; cursor: default; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }

.glossary-group { margin-bottom: 20px; }
.glossary-group-title { font-size: 13px; font-weight: 700; color: #555; margin-bottom: 8px; padding-left: 2px; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.td-term { font-weight: 600; white-space: nowrap; }
.td-desc { color: #555; max-width: 400px; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 440px; max-width: 90vw; }
.admin-modal-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.admin-form-row.align-start { align-items: flex-start; }
.admin-form-row label { width: 70px; font-size: 13px; color: #555; flex-shrink: 0; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.admin-textarea { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; }
.flex1 { flex: 1; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
</style>
