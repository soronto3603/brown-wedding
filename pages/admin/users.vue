<script setup lang="ts">
const supabase = useSupabaseClient()

const users = ref<any[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 30
const actingId = ref<string | null>(null)
const editing = ref<any | null>(null)
const saving = ref(false)

async function fetchUsers() {
  loading.value = true
  const { data, count } = await supabase
    .from('bw_profiles')
    .select('id, nickname, role, is_blocked, blocked_at, blocked_reason, admin_memo, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE - 1)
  users.value = data ?? []
  total.value = count ?? 0
  loading.value = false
}

watch(page, fetchUsers)
onMounted(fetchUsers)

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

async function toggleBlock(user: any) {
  const block = !user.is_blocked
  const msg = block
    ? prompt('차단 사유를 입력하세요 (선택)')
    : null
  if (block && msg === null) return // 취소

  actingId.value = user.id
  const { error } = await supabase.from('bw_profiles').update({
    is_blocked: block,
    blocked_at: block ? new Date().toISOString() : null,
    blocked_reason: block ? (msg || null) : null,
  }).eq('id', user.id)

  if (!error) {
    const idx = users.value.findIndex(u => u.id === user.id)
    if (idx !== -1) {
      users.value[idx] = {
        ...users.value[idx],
        is_blocked: block,
        blocked_at: block ? new Date().toISOString() : null,
        blocked_reason: block ? (msg || null) : null,
      }
    }
  }
  actingId.value = null
}

function openMemo(user: any) {
  editing.value = { id: user.id, nickname: user.nickname, admin_memo: user.admin_memo ?? '' }
}

async function saveMemo() {
  if (!editing.value) return
  saving.value = true
  const { error } = await supabase.from('bw_profiles').update({ admin_memo: editing.value.admin_memo || null }).eq('id', editing.value.id)
  if (!error) {
    const idx = users.value.findIndex(u => u.id === editing.value!.id)
    if (idx !== -1) users.value[idx] = { ...users.value[idx], admin_memo: editing.value.admin_memo }
  }
  saving.value = false
  editing.value = null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '오늘'
  return `${days}일 전`
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>유저 관리</h1>
      <p>전체 {{ total.toLocaleString() }}명</p>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>닉네임</th>
            <th>역할</th>
            <th>상태</th>
            <th>가입일</th>
            <th>차단 사유</th>
            <th>메모</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id" :class="{ blocked: u.is_blocked }">
            <td class="td-nick">{{ u.nickname }}</td>
            <td>
              <span :class="['role-badge', u.role]">{{ u.role }}</span>
            </td>
            <td>
              <span v-if="u.is_blocked" class="blocked-badge">차단됨</span>
              <span v-else class="normal-badge">정상</span>
            </td>
            <td>{{ timeAgo(u.created_at) }}</td>
            <td class="td-reason">{{ u.blocked_reason ?? '-' }}</td>
            <td class="td-memo">{{ u.admin_memo ? u.admin_memo.slice(0, 30) : '-' }}</td>
            <td class="td-actions">
              <button
                :class="u.is_blocked ? 'admin-btn-sm' : 'admin-btn-danger'"
                :disabled="actingId === u.id"
                @click="toggleBlock(u)"
              >{{ u.is_blocked ? '차단해제' : '차단' }}</button>
              <button class="admin-btn-sm" style="margin-left:4px" @click="openMemo(u)">메모</button>
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

    <!-- 메모 편집 모달 -->
    <div v-if="editing" class="admin-modal-backdrop" @click.self="editing = null">
      <div class="admin-modal">
        <div class="admin-modal-title">{{ editing.nickname }} — 관리자 메모</div>
        <textarea v-model="editing.admin_memo" class="admin-textarea" style="width:100%;box-sizing:border-box" rows="5" placeholder="내부용 메모 (유저에게 표시되지 않음)" />
        <div class="admin-modal-actions">
          <button class="admin-btn" :disabled="saving" @click="saveMemo">{{ saving ? '저장 중...' : '저장' }}</button>
          <button class="admin-btn-ghost" @click="editing = null">취소</button>
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

.admin-table-wrap { overflow-x: auto; }
.admin-table { width: 100%; border-collapse: collapse; font-size: 13px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-table th { background: #f8f8f9; color: #666; font-weight: 600; padding: 10px 12px; text-align: left; border-bottom: 1px solid #eee; white-space: nowrap; }
.admin-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; color: #333; }
.admin-table tr:last-child td { border-bottom: none; }
.admin-table tr.blocked td { color: #bbb; }
.td-nick { font-weight: 600; white-space: nowrap; }
.td-reason, .td-memo { max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #777; font-size: 12px; }
.td-actions { white-space: nowrap; }

.role-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; }
.role-badge.admin { background: #fde8ed; color: #F2728A; }
.role-badge.user { background: #f0f0f0; color: #888; }
.blocked-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #fee; color: #e05b5b; }
.normal-badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 600; background: #e8f5e9; color: #52b788; }

.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-sm:disabled { opacity: 0.4; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; font-weight: 600; }
.admin-btn-danger:disabled { opacity: 0.4; }

.admin-pagination { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; font-size: 13px; color: #555; }

.admin-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.admin-modal { background: #fff; border-radius: 12px; padding: 24px; width: 400px; max-width: 90vw; }
.admin-modal-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; }
.admin-textarea { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; }
.admin-btn { padding: 7px 16px; background: #1a1a2e; color: #fff; border: none; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-btn:disabled { opacity: 0.5; }
.admin-btn-ghost { padding: 7px 16px; background: transparent; color: #666; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; font-family: inherit; cursor: pointer; }
.admin-modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
</style>
