<script setup lang="ts">
const supabase = useSupabaseClient()

const posts = ref<any[]>([])
const loading = ref(true)
const total = ref(0)
const page = ref(1)
const PAGE_SIZE = 30
const deletingId = ref<string | null>(null)

async function fetchPosts() {
  loading.value = true
  const { data, count } = await supabase
    .from('bw_posts')
    .select('id, body, like_count, comment_count, is_deleted, created_at, author:bw_profiles!bw_posts_author_id_fkey(nickname)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE - 1)

  posts.value = data ?? []
  total.value = count ?? 0
  loading.value = false
}

watch(page, fetchPosts)
onMounted(fetchPosts)

const totalPages = computed(() => Math.ceil(total.value / PAGE_SIZE))

async function softDelete(id: string) {
  if (!confirm('이 게시글을 삭제하시겠습니까?')) return
  deletingId.value = id
  const { error } = await supabase.from('bw_posts').update({ is_deleted: true }).eq('id', id)
  if (!error) {
    const idx = posts.value.findIndex(p => p.id === id)
    if (idx !== -1) posts.value[idx] = { ...posts.value[idx], is_deleted: true }
  }
  deletingId.value = null
}

async function restore(id: string) {
  deletingId.value = id
  const { error } = await supabase.from('bw_posts').update({ is_deleted: false }).eq('id', id)
  if (!error) {
    const idx = posts.value.findIndex(p => p.id === id)
    if (idx !== -1) posts.value[idx] = { ...posts.value[idx], is_deleted: false }
  }
  deletingId.value = null
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>게시글 관리</h1>
      <p>전체 {{ total.toLocaleString() }}개</p>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>작성자</th>
            <th>내용</th>
            <th>좋아요</th>
            <th>댓글</th>
            <th>작성일</th>
            <th>상태</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in posts" :key="p.id" :class="{ deleted: p.is_deleted }">
            <td class="td-nick">{{ p.author?.nickname ?? '익명' }}</td>
            <td class="td-body">{{ p.body.slice(0, 60) }}{{ p.body.length > 60 ? '…' : '' }}</td>
            <td>♥ {{ p.like_count }}</td>
            <td>💬 {{ p.comment_count }}</td>
            <td>{{ timeAgo(p.created_at) }}</td>
            <td>
              <span v-if="p.is_deleted" class="deleted-badge">삭제됨</span>
              <span v-else class="active-badge">정상</span>
            </td>
            <td>
              <button
                v-if="!p.is_deleted"
                class="admin-btn-danger"
                :disabled="deletingId === p.id"
                @click="softDelete(p.id)"
              >삭제</button>
              <button
                v-else
                class="admin-btn-sm"
                :disabled="deletingId === p.id"
                @click="restore(p.id)"
              >복구</button>
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
.admin-table tr.deleted td { color: #bbb; }

.td-nick { font-weight: 600; white-space: nowrap; }
.td-body { max-width: 320px; }

.deleted-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; background: #fee; color: #e05b5b; font-weight: 600; }
.active-badge { padding: 3px 8px; border-radius: 99px; font-size: 11px; background: #e8f5e9; color: #52b788; font-weight: 600; }

.admin-btn-sm { padding: 4px 10px; background: #f0f0f0; color: #444; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; }
.admin-btn-sm:disabled { opacity: 0.4; cursor: default; }
.admin-btn-danger { padding: 4px 10px; background: #fee; color: #e05b5b; border: none; border-radius: 5px; font-size: 12px; cursor: pointer; font-weight: 600; }
.admin-btn-danger:disabled { opacity: 0.4; cursor: default; }

.admin-pagination { display: flex; align-items: center; gap: 10px; justify-content: center; margin-top: 16px; font-size: 13px; color: #555; }
</style>
