<script setup lang="ts">
const supabase = useSupabaseClient()

const banners = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const editing = ref<any | null>(null)
const isNew = ref(false)
const stats = ref<Record<string, number>>({})

const POSITIONS = ['hall_top', 'hall_bottom', 'lounge_top', 'lounge_bottom']
const POSITION_LABELS: Record<string, string> = {
  hall_top: '홀지도 상단',
  hall_bottom: '홀지도 하단',
  lounge_top: '대기실 상단',
  lounge_bottom: '대기실 하단',
}

async function fetchAll() {
  loading.value = true
  const [{ data: bData }, { data: cData }] = await Promise.all([
    supabase.from('bw_banners').select('*').order('sort_order'),
    supabase.from('bw_banner_clicks').select('banner_id'),
  ])
  banners.value = bData ?? []
  const clickMap: Record<string, number> = {}
  for (const c of (cData ?? [])) {
    clickMap[c.banner_id] = (clickMap[c.banner_id] ?? 0) + 1
  }
  stats.value = clickMap
  loading.value = false
}
onMounted(fetchAll)

const user = useSupabaseUser()

function openNew() {
  isNew.value = true
  editing.value = {
    title: '', image_url: '', link_url: '',
    position: 'hall_top', is_active: false,
    starts_at: '', ends_at: '', sort_order: 0,
  }
}

function openEdit(b: any) {
  isNew.value = false
  editing.value = {
    ...b,
    starts_at: b.starts_at ? b.starts_at.slice(0, 10) : '',
    ends_at: b.ends_at ? b.ends_at.slice(0, 10) : '',
  }
}

function closeEdit() { editing.value = null }

async function save() {
  if (!editing.value) return
  saving.value = true

  const payload: any = {
    title: editing.value.title,
    image_url: editing.value.image_url,
    link_url: editing.value.link_url || null,
    position: editing.value.position,
    is_active: editing.value.is_active,
    sort_order: editing.value.sort_order,
    starts_at: editing.value.starts_at || null,
    ends_at: editing.value.ends_at || null,
    updated_at: new Date().toISOString(),
  }

  if (isNew.value) {
    payload.created_by = user.value?.id
    const { data, error } = await supabase.from('bw_banners').insert(payload).select().single()
    if (!error && data) banners.value = [...banners.value, data]
  } else {
    const { id } = editing.value
    const { error } = await supabase.from('bw_banners').update(payload).eq('id', id)
    if (!error) {
      const idx = banners.value.findIndex(b => b.id === id)
      if (idx !== -1) banners.value[idx] = { ...banners.value[idx], ...payload, id }
    }
  }

  saving.value = false
  closeEdit()
}

async function remove(id: string) {
  if (!confirm('배너를 삭제하시겠습니까?')) return
  const { error } = await supabase.from('bw_banners').delete().eq('id', id)
  if (!error) banners.value = banners.value.filter(b => b.id !== id)
}

async function toggleActive(banner: any) {
  const { error } = await supabase.from('bw_banners').update({ is_active: !banner.is_active }).eq('id', banner.id)
  if (!error) {
    const idx = banners.value.findIndex(b => b.id === banner.id)
    if (idx !== -1) banners.value[idx] = { ...banners.value[idx], is_active: !banner.is_active }
  }
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>배너/광고 관리</h1>
      <p>전체 {{ banners.length }}개</p>
    </div>

    <div class="admin-toolbar">
      <button class="admin-btn" @click="openNew">+ 배너 추가</button>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>위치</th>
            <th>노출 기간</th>
            <th>클릭수</th>
            <th>상태</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in banners" :key="b.id">
            <td class="td-title">
              <div>{{ b.title }}</div>
              <div v-if="b.link_url" class="td-url">{{ b.link_url }}</div>
            </td>
            <td><span class="pos-badge">{{ POSITION_LABELS[b.position] ?? b.position }}</span></td>
            <td class="td-period">
              {{ b.starts_at ? b.starts_at.slice(0,10) : '∞' }} ~ {{ b.ends_at ? b.ends_at.slice(0,10) : '∞' }}
            </td>
            <td><span class="click-count">{{ stats[b.id] ?? 0 }}</span></td>
            <td>
              <button :class="['toggle-btn', b.is_active ? 'active' : 'inactive']" @click="toggleActive(b)">
                {{ b.is_active ? '노출 중' : '숨김' }}
              </button>
            </td>
            <td>
              <button class="admin-btn-sm" @click="openEdit(b)">편집</button>
              <button class="admin-btn-danger" style="margin-left:4px" @click="remove(b.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="banners.length === 0 && !loading" class="admin-empty-state">
      등록된 배너가 없습니다. 배너를 추가해보세요.
    </div>

    <!-- 편집/추가 모달 -->
    <div v-if="editing" class="admin-modal-backdrop" @click.self="closeEdit">
      <div class="admin-modal">
        <div class="admin-modal-title">{{ isNew ? '배너 추가' : '배너 편집' }}</div>
        <div class="admin-form-row">
          <label>제목</label>
          <input v-model="editing.title" class="admin-input flex1" placeholder="배너 제목" />
        </div>
        <div class="admin-form-row">
          <label>이미지 URL</label>
          <input v-model="editing.image_url" class="admin-input flex1" placeholder="https://..." />
        </div>
        <div class="admin-form-row">
          <label>링크 URL</label>
          <input v-model="editing.link_url" class="admin-input flex1" placeholder="https://... (선택)" />
        </div>
        <div class="admin-form-row">
          <label>위치</label>
          <select v-model="editing.position" class="admin-select flex1">
            <option v-for="p in POSITIONS" :key="p" :value="p">{{ POSITION_LABELS[p] }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>시작일</label>
          <input v-model="editing.starts_at" type="date" class="admin-input flex1" />
        </div>
        <div class="admin-form-row">
          <label>종료일</label>
          <input v-model="editing.ends_at" type="date" class="admin-input flex1" />
        </div>
        <div class="admin-form-row">
          <label>순서</label>
          <input v-model.number="editing.sort_order" type="number" class="admin-input" style="width:80px" />
        </div>
        <div class="admin-form-row">
          <label>노출</label>
          <label class="admin-toggle">
            <input v-model="editing.is_active" type="checkbox" />
            <span>{{ editing.is_active ? '노출 중' : '숨김' }}</span>
          </label>
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
.admin-empty-state { text-align: center; padding: 40px; color: #aaa; font-size: 14px; }

.admin-toolbar { margin-bottom: 16px; }
.admin-btn { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn:disabled { opacity: 0.5; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; vertical-align: middle; }
.admin-table tr:last-child td { border-bottom: none; }
.td-title { font-weight: 600; }
.td-url { font-size: 11px; color: #aaa; margin-top: 2px; }
.td-period { font-size: 12px; color: #777; white-space: nowrap; }
.click-count { font-weight: 700; color: #F2728A; }

.pos-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; background: #eef2ff; color: #5b6dd3; font-weight: 600; }
.toggle-btn { padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 600; border: none; cursor: pointer; }
.toggle-btn.active { background: #e8f5e9; color: #52b788; }
.toggle-btn.inactive { background: #f0f0f0; color: #aaa; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto; }
.admin-modal-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.admin-form-row label { width: 80px; font-size: 13px; color: #555; flex-shrink: 0; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.admin-toggle { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #333; cursor: pointer; }
.flex1 { flex: 1; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
</style>
