<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const settings = ref<any[]>([])
const loading = ref(true)
const savingKey = ref<string | null>(null)
const edits = ref<Record<string, string>>({})

async function fetchSettings() {
  loading.value = true
  const { data } = await supabase.from('bw_settings').select('*').order('key')
  settings.value = data ?? []
  for (const s of (data ?? [])) edits.value[s.key] = s.value
  loading.value = false
}
onMounted(fetchSettings)

async function save(key: string) {
  savingKey.value = key
  const { error } = await supabase.from('bw_settings').update({
    value: edits.value[key],
    updated_by: user.value?.id,
    updated_at: new Date().toISOString(),
  }).eq('key', key)

  if (!error) {
    const idx = settings.value.findIndex(s => s.key === key)
    if (idx !== -1) settings.value[idx] = { ...settings.value[idx], value: edits.value[key] }
  }
  savingKey.value = null
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>설정</h1>
      <p>서비스 전역 설정 값</p>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <div v-else class="settings-list">
      <div v-for="s in settings" :key="s.key" class="setting-item">
        <div class="setting-key">{{ s.key }}</div>
        <div v-if="s.description" class="setting-desc">{{ s.description }}</div>
        <div class="setting-row">
          <input v-model="edits[s.key]" class="admin-input flex1" />
          <button
            class="admin-btn"
            :disabled="savingKey === s.key || edits[s.key] === s.value"
            @click="save(s.key)"
          >
            {{ savingKey === s.key ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 680px; }
.admin-page-header { margin-bottom: 24px; }
.admin-page-header h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.admin-page-header p { font-size: 13px; color: #888; margin: 0; }
.admin-loading { padding: 40px; text-align: center; color: #888; }

.settings-list { display: flex; flex-direction: column; gap: 14px; }
.setting-item { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.setting-key { font-size: 13px; font-weight: 700; color: #1a1a2e; margin-bottom: 2px; font-family: monospace; }
.setting-desc { font-size: 12px; color: #888; margin-bottom: 10px; }
.setting-row { display: flex; gap: 8px; align-items: center; }

.admin-input { padding: 7px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; }
.admin-btn { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; white-space: nowrap; }
.admin-btn:disabled { opacity: 0.4; cursor: default; }
.flex1 { flex: 1; }
</style>
