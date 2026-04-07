<script setup lang="ts">
const supabase = useSupabaseClient()

const songs = ref<any[]>([])
const loading = ref(true)
const saving = ref(false)
const editing = ref<any | null>(null)
const isNew = ref(false)

const uploadRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const uploadResult = ref('')

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
    title: editing.value.title.trim(),
    artist: editing.value.artist.trim(),
    genre: editing.value.genre,
    mood: editing.value.mood,
    scene: editing.value.scene,
    preview_url: editing.value.preview_url || null,
    thumbnail_url: editing.value.thumbnail_url || null,
    sort_order: editing.value.sort_order ?? 0,
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

async function remove(id: string, title: string) {
  if (!confirm(`"${title}"을 삭제하시겠습니까?`)) return
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

// ── 엑셀 다운로드 ──────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import('xlsx')
  const headers = ['title', 'artist', 'genre', 'mood', 'scene', 'preview_url', 'thumbnail_url', 'sort_order']
  const genreOpts = GENRES.join(' / ')
  const moodOpts = MOODS.join(' / ')
  const sceneOpts = SCENES.join(' / ')
  const example1 = ['A Thousand Years', 'Christina Perri', '팝', '잔잔한', '신부입장곡', '', '', 1]
  const example2 = ['Canon in D', 'Johann Pachelbel', '클래식', '웅장한', '신랑입장곡', '', '', 2]
  const note1 = [`* genre: ${genreOpts}`, '', '', '', '', '', '', '']
  const note2 = [`* mood: ${moodOpts}`, '', '', '', '', '', '', '']
  const note3 = [`* scene: ${sceneOpts}`, '', '', '', '', '', '', '']
  const ws = XLSX.utils.aoa_to_sheet([headers, example1, example2, note1, note2, note3])
  ws['!cols'] = [{ wch: 24 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 30 }, { wch: 30 }, { wch: 8 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'songs')
  XLSX.writeFile(wb, 'bw_songs_template.xlsx')
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

    const validGenres = new Set(GENRES)
    const validMoods = new Set(MOODS)
    const validScenes = new Set(SCENES)

    const inserts = rows
      .filter(r => r.title?.toString().trim() && r.artist?.toString().trim())
      .map(r => ({
        title: String(r.title).trim(),
        artist: String(r.artist).trim(),
        genre: validGenres.has(String(r.genre)) ? String(r.genre) : '팝',
        mood: validMoods.has(String(r.mood)) ? String(r.mood) : '잔잔한',
        scene: validScenes.has(String(r.scene)) ? String(r.scene) : '신부입장곡',
        preview_url: r.preview_url ? String(r.preview_url) : null,
        thumbnail_url: r.thumbnail_url ? String(r.thumbnail_url) : null,
        sort_order: r.sort_order ? Number(r.sort_order) : 0,
      }))

    if (inserts.length === 0) {
      uploadResult.value = '❌ 유효한 데이터가 없습니다 (title, artist 컬럼 필수)'
      uploading.value = false
      return
    }

    const { error } = await supabase.from('bw_songs').insert(inserts)
    if (error) throw error

    uploadResult.value = `✅ ${inserts.length}곡 추가 완료`
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
      <h1>선곡기 관리</h1>
      <p>전체 {{ songs.length }}곡</p>
    </div>

    <div class="admin-toolbar">
      <button class="admin-btn-primary" @click="openNew">+ 곡 추가</button>
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
      <div v-for="(list, scene) in grouped" :key="scene" class="song-group">
        <div class="song-group-title">{{ scene }} ({{ list.length }})</div>
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
                <td class="td-actions">
                  <button class="admin-btn-sm" @click="openEdit(song)">편집</button>
                  <button class="admin-btn-danger" @click="remove(song.id, song.title)">삭제</button>
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
          <label>제목 *</label>
          <input v-model="editing.title" class="admin-input" placeholder="곡 제목" />
        </div>
        <div class="admin-form-row">
          <label>아티스트 *</label>
          <input v-model="editing.artist" class="admin-input" placeholder="아티스트명" />
        </div>
        <div class="form-row-2">
          <div class="admin-form-row">
            <label>장르</label>
            <select v-model="editing.genre" class="admin-select">
              <option v-for="g in GENRES" :key="g">{{ g }}</option>
            </select>
          </div>
          <div class="admin-form-row">
            <label>분위기</label>
            <select v-model="editing.mood" class="admin-select">
              <option v-for="m in MOODS" :key="m">{{ m }}</option>
            </select>
          </div>
        </div>
        <div class="form-row-2">
          <div class="admin-form-row">
            <label>구분</label>
            <select v-model="editing.scene" class="admin-select">
              <option v-for="s in SCENES" :key="s">{{ s }}</option>
            </select>
          </div>
          <div class="admin-form-row">
            <label>순서</label>
            <input v-model.number="editing.sort_order" type="number" class="admin-input" />
          </div>
        </div>
        <div class="admin-form-row">
          <label>미리듣기 URL (선택)</label>
          <input v-model="editing.preview_url" class="admin-input" placeholder="https://..." />
        </div>
        <div class="admin-form-row">
          <label>썸네일 URL (선택)</label>
          <input v-model="editing.thumbnail_url" class="admin-input" placeholder="https://..." />
        </div>
        <div class="admin-modal-actions">
          <button class="admin-btn-primary" :disabled="saving || !editing.title.trim() || !editing.artist.trim()" @click="save">
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

.song-group { margin-bottom: 20px; }
.song-group-title { font-size: 13px; font-weight: 700; color: #555; margin-bottom: 8px; padding-left: 2px; }

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.td-title { font-weight: 600; }
.td-actions { white-space: nowrap; }
.genre-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; background: #f0eaff; color: #7c4dff; font-weight: 600; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 460px; max-width: 100%; max-height: 90vh; overflow-y: auto; }
.admin-modal-title { font-size: 16px; font-weight: 700; color: #1a1a2e; margin-bottom: 18px; }
.admin-form-row { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
.admin-form-row label { font-size: 11px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.3px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; width: 100%; box-sizing: border-box; }
.admin-select { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; background: #fff; cursor: pointer; width: 100%; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
</style>
