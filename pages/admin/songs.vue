<script setup lang="ts">
const supabase = useSupabaseClient()

const songs = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const editing = ref<any | null>(null)
const isNew = ref(false)

const GENRES = ['클래식', 'K-발라드', '팝', 'K-POP']
const MOODS = ['잔잔한', '설레는', '인기', '웅장한']
const SCENES = ['신랑입장곡', '신부입장곡', '축가', '피로연']

async function fetchAll() {
  loading.value = true
  const { data } = await supabase.from('bw_songs').select('*').order('scene').order('sort_order')
  songs.value = data ?? []
  loading.value = false
}
onMounted(fetchAll)

function openNew() {
  isNew.value = true
  editing.value = { title: '', artist: '', genre: '팝', mood: '잔잔한', scene: '신부입장곡', preview_url: '', thumbnail_url: '', sort_order: 0 }
}

function openEdit(song: any) {
  isNew.value = false
  editing.value = { ...song }
}

function closeEdit() { editing.value = null }

async function save() {
  if (!editing.value) return
  saving.value = true

  const payload = {
    title: editing.value.title,
    artist: editing.value.artist,
    genre: editing.value.genre,
    mood: editing.value.mood,
    scene: editing.value.scene,
    preview_url: editing.value.preview_url || null,
    thumbnail_url: editing.value.thumbnail_url || null,
    sort_order: editing.value.sort_order,
  }

  if (isNew.value) {
    const { data, error } = await supabase.from('bw_songs').insert(payload).select().single()
    if (!error && data) songs.value = [...songs.value, data]
  } else {
    const { id } = editing.value
    const { error } = await supabase.from('bw_songs').update(payload).eq('id', id)
    if (!error) {
      const idx = songs.value.findIndex(s => s.id === id)
      if (idx !== -1) songs.value[idx] = { ...songs.value[idx], ...payload, id }
    }
  }

  saving.value = false
  closeEdit()
}

async function remove(id: string) {
  if (!confirm('삭제하시겠습니까?')) return
  const { error } = await supabase.from('bw_songs').delete().eq('id', id)
  if (!error) songs.value = songs.value.filter(s => s.id !== id)
}

const grouped = computed(() => {
  const map: Record<string, any[]> = {}
  for (const s of songs.value) {
    if (!map[s.scene]) map[s.scene] = []
    map[s.scene].push(s)
  }
  return map
})
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>선곡기 관리</h1>
      <p>전체 {{ songs.length }}곡</p>
    </div>

    <div class="admin-toolbar">
      <button class="admin-btn" @click="openNew">+ 곡 추가</button>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <template v-else>
      <div v-for="(list, scene) in grouped" :key="scene" class="song-group">
        <div class="song-group-title">{{ scene }}</div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>제목</th><th>아티스트</th><th>장르</th><th>분위기</th><th>순서</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="song in list" :key="song.id">
                <td class="td-title">{{ song.title }}</td>
                <td>{{ song.artist }}</td>
                <td><span class="genre-badge">{{ song.genre }}</span></td>
                <td>{{ song.mood }}</td>
                <td>{{ song.sort_order }}</td>
                <td>
                  <button class="admin-btn-sm" @click="openEdit(song)">편집</button>
                  <button class="admin-btn-danger" style="margin-left:4px" @click="remove(song.id)">삭제</button>
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
        <div class="admin-modal-title">{{ isNew ? '곡 추가' : '곡 편집' }}</div>
        <div class="admin-form-row">
          <label>제목</label>
          <input v-model="editing.title" class="admin-input flex1" placeholder="곡 제목" />
        </div>
        <div class="admin-form-row">
          <label>아티스트</label>
          <input v-model="editing.artist" class="admin-input flex1" placeholder="아티스트명" />
        </div>
        <div class="admin-form-row">
          <label>장르</label>
          <select v-model="editing.genre" class="admin-select flex1">
            <option v-for="g in GENRES" :key="g">{{ g }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>분위기</label>
          <select v-model="editing.mood" class="admin-select flex1">
            <option v-for="m in MOODS" :key="m">{{ m }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>구분</label>
          <select v-model="editing.scene" class="admin-select flex1">
            <option v-for="s in SCENES" :key="s">{{ s }}</option>
          </select>
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

.song-group { margin-bottom: 20px; }
.song-group-title { font-size: 13px; font-weight: 700; color: #555; margin-bottom: 8px; padding-left: 2px; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.td-title { font-weight: 600; }
.genre-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; background: #f0eaff; color: #7c4dff; font-weight: 600; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 420px; max-width: 90vw; }
.admin-modal-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.admin-form-row label { width: 70px; font-size: 13px; color: #555; flex-shrink: 0; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; }
.flex1 { flex: 1; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; }
</style>
