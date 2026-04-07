<script setup lang="ts">
const supabase = useSupabaseClient()

const stats = ref({
  halls: 0,
  activeHalls: 0,
  posts: 0,
  users: 0,
  songs: 0,
  glossary: 0,
})
const loading = ref(true)
const recentPosts = ref<any[]>([])
const recentUsers = ref<any[]>([])

onMounted(async () => {
  const [
    { count: halls },
    { count: activeHalls },
    { count: posts },
    { count: users },
    { count: songs },
    { count: glossary },
    { data: latestPosts },
    { data: latestUsers },
  ] = await Promise.all([
    supabase.from('bw_halls').select('*', { count: 'exact', head: true }),
    supabase.from('bw_halls').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('bw_posts').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('bw_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('bw_songs').select('*', { count: 'exact', head: true }),
    supabase.from('bw_glossary').select('*', { count: 'exact', head: true }),
    supabase.from('bw_posts')
      .select('id, body, created_at, author:bw_profiles!bw_posts_author_id_fkey(nickname)')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('bw_profiles')
      .select('id, nickname, role, is_blocked, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  stats.value = {
    halls: halls ?? 0,
    activeHalls: activeHalls ?? 0,
    posts: posts ?? 0,
    users: users ?? 0,
    songs: songs ?? 0,
    glossary: glossary ?? 0,
  }
  recentPosts.value = latestPosts ?? []
  recentUsers.value = latestUsers ?? []
  loading.value = false
})

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-page-header">
      <h1>대시보드</h1>
      <p>WEDDiC 서비스 현황</p>
    </div>

    <div v-if="loading" class="admin-loading">불러오는 중...</div>

    <template v-else>
      <!-- 통계 카드 -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon">🏛</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.halls.toLocaleString() }}</div>
            <div class="stat-label">전체 홀</div>
          </div>
          <div class="stat-sub">활성 {{ stats.activeHalls }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.users.toLocaleString() }}</div>
            <div class="stat-label">가입 유저</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.posts.toLocaleString() }}</div>
            <div class="stat-label">게시글</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎵</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.songs }}</div>
            <div class="stat-label">선곡 목록</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📖</div>
          <div class="stat-body">
            <div class="stat-value">{{ stats.glossary }}</div>
            <div class="stat-label">용어사전</div>
          </div>
        </div>
      </div>

      <!-- 최근 활동 -->
      <div class="admin-row">
        <div class="admin-card">
          <div class="admin-card-title">최근 게시글</div>
          <div v-if="recentPosts.length === 0" class="admin-empty">게시글 없음</div>
          <div v-for="p in recentPosts" :key="p.id" class="admin-list-row">
            <span class="admin-list-nick">{{ p.author?.nickname ?? '익명' }}</span>
            <span class="admin-list-body">{{ p.body.slice(0, 40) }}{{ p.body.length > 40 ? '…' : '' }}</span>
            <span class="admin-list-time">{{ timeAgo(p.created_at) }}</span>
          </div>
        </div>
        <div class="admin-card">
          <div class="admin-card-title">최근 가입 유저</div>
          <div v-if="recentUsers.length === 0" class="admin-empty">유저 없음</div>
          <div v-for="u in recentUsers" :key="u.id" class="admin-list-row">
            <span class="admin-list-nick">{{ u.nickname }}</span>
            <span :class="['admin-role-badge', u.role]">{{ u.role }}</span>
            <span v-if="u.is_blocked" class="admin-blocked-badge">차단</span>
            <span class="admin-list-time">{{ timeAgo(u.created_at) }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.admin-page { padding: 24px; max-width: 1100px; }
.admin-page-header { margin-bottom: 20px; }
.admin-page-header h1 { font-size: 22px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
.admin-page-header p { font-size: 13px; color: #888; margin: 0; }
.admin-loading { padding: 40px; text-align: center; color: #888; }

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  position: relative;
}
.stat-icon { font-size: 24px; flex-shrink: 0; }
.stat-body { flex: 1; }
.stat-value { font-size: 22px; font-weight: 700; color: #1a1a2e; line-height: 1.2; }
.stat-label { font-size: 12px; color: #888; }
.stat-sub { position: absolute; top: 10px; right: 12px; font-size: 11px; color: #52b788; font-weight: 600; }

.admin-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.admin-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
.admin-card-title { font-size: 13px; font-weight: 700; color: #333; margin-bottom: 12px; }
.admin-empty { font-size: 12px; color: #aaa; text-align: center; padding: 16px 0; }
.admin-list-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; }
.admin-list-row:last-child { border-bottom: none; }
.admin-list-nick { font-weight: 600; color: #333; flex-shrink: 0; }
.admin-list-body { flex: 1; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.admin-list-time { color: #aaa; flex-shrink: 0; }
.admin-role-badge { padding: 2px 7px; border-radius: 99px; font-size: 10px; font-weight: 600; }
.admin-role-badge.admin { background: #fde8ed; color: #F2728A; }
.admin-role-badge.user { background: #f0f0f0; color: #888; }
.admin-blocked-badge { padding: 2px 7px; border-radius: 99px; font-size: 10px; font-weight: 600; background: #fee; color: #e05b5b; }
</style>
