<script setup lang="ts">
const { PRIMARY, PRIMARY_LT, TEXT, MUTED, BORDER } = useThemeColors()
const user = useSupabaseUser()
const { openAuthModal } = useAuthModal()

const {
  posts, loading, loadingMore, hasMore, likedPostIds,
  fetchPosts, loadMore, createPost, toggleLike,
  fetchComments, createComment, timeAgo,
} = useLounge()

function requireLogin(): boolean {
  if (user.value) return true
  openAuthModal()
  return false
}

const body = ref('')
const filter = ref('최신순')
const expandedComments = ref<Record<string, boolean>>({})
const commentBodies = ref<Record<string, string>>({})
const commentLists = ref<Record<string, any[]>>({})
const loadingComments = ref<Record<string, boolean>>({})

const scrollRef = ref<HTMLElement | null>(null)

onMounted(() => fetchPosts())

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 200) {
    loadMore()
  }
}

async function submit() {
  if (!requireLogin()) return
  if (!body.value.trim()) return
  await createPost(body.value)
  body.value = ''
}

async function toggleComments(postId: string) {
  if (expandedComments.value[postId]) {
    expandedComments.value = { ...expandedComments.value, [postId]: false }
    return
  }
  expandedComments.value = { ...expandedComments.value, [postId]: true }
  loadingComments.value = { ...loadingComments.value, [postId]: true }
  const comments = await fetchComments(postId)
  commentLists.value = { ...commentLists.value, [postId]: comments }
  loadingComments.value = { ...loadingComments.value, [postId]: false }
}

async function submitComment(postId: string) {
  if (!requireLogin()) return
  const text = commentBodies.value[postId]?.trim()
  if (!text) return
  const comment = await createComment(postId, text)
  if (comment) {
    commentLists.value = {
      ...commentLists.value,
      [postId]: [...(commentLists.value[postId] ?? []), comment],
    }
    commentBodies.value = { ...commentBodies.value, [postId]: '' }
  }
}
</script>

<template>
  <div ref="scrollRef" class="page-wrap" @scroll="onScroll">
    <div class="page-inner">
      <div :style="{ display: 'flex', gap: '6px', marginBottom: '14px' }">
        <button
          v-for="f in ['최신순', '관심홀', '나의홀']"
          :key="f"
          type="button"
          :class="['pill', { active: filter === f }]"
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>

      <!-- 글쓰기 -->
      <div class="card" :style="{ padding: '14px', marginBottom: '14px' }">
        <textarea
          v-model="body"
          placeholder="웨딩홀 후기나 결혼 준비 고민을 공유해보세요 :)"
          :style="{
            width: '100%', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'inherit', fontSize: '14px', color: TEXT,
            lineHeight: 1.65, minHeight: '70px', background: 'transparent',
          }"
        />
        <div
          :style="{
            display: 'flex', justifyContent: 'flex-end',
            paddingTop: '10px', borderTop: `1px solid ${BORDER}`, marginTop: '4px',
          }"
        >
          <button type="button" class="btn-primary" @click="submit">게시</button>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-if="loading && posts.length === 0" :style="{ textAlign: 'center', padding: '40px 0', color: MUTED }">
        불러오는 중...
      </div>

      <!-- 게시글 목록 -->
      <div
        v-for="p in posts"
        :key="p.id"
        class="card"
        :style="{ padding: '14px', marginBottom: '10px' }"
      >
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }">
          <div
            :style="{
              width: '34px', height: '34px', borderRadius: '50%',
              background: PRIMARY_LT, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px', fontWeight: 700,
              color: PRIMARY, flexShrink: 0, overflow: 'hidden',
            }"
          >
            <img v-if="p.author?.avatar_url" :src="p.author.avatar_url" :style="{ width: '100%', height: '100%', objectFit: 'cover' }" />
            <span v-else>{{ (p.author?.nickname ?? '?').slice(0, 2) }}</span>
          </div>
          <div :style="{ flex: 1 }">
            <div :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">{{ p.author?.nickname ?? '익명' }}</div>
            <div :style="{ fontSize: '11px', color: MUTED }">{{ timeAgo(p.created_at) }}</div>
          </div>
          <span v-if="p.hall?.name" class="badge badge-gold" :style="{ padding: '3px 10px' }">
            {{ p.hall.name }}
          </span>
        </div>
        <p :style="{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '10px', whiteSpace: 'pre-wrap' }">
          {{ p.body }}
        </p>
        <div :style="{ display: 'flex', gap: '14px' }">
          <span
            :style="{
              fontSize: '13px',
              color: likedPostIds.has(p.id) ? '#E05B5B' : MUTED,
              cursor: 'pointer',
            }"
            @click="requireLogin() && toggleLike(p.id)"
          >
            {{ likedPostIds.has(p.id) ? '♥' : '♡' }} {{ p.like_count }}
          </span>
          <span
            :style="{ fontSize: '13px', color: MUTED, cursor: 'pointer' }"
            @click="toggleComments(p.id)"
          >
            💬 {{ p.comment_count }}
          </span>
        </div>

        <!-- 댓글 영역 -->
        <div v-if="expandedComments[p.id]" :style="{ marginTop: '12px', borderTop: `1px solid ${BORDER}`, paddingTop: '10px' }">
          <div v-if="loadingComments[p.id]" :style="{ fontSize: '12px', color: MUTED, padding: '8px 0' }">댓글 불러오는 중...</div>
          <div
            v-for="c in commentLists[p.id] ?? []"
            :key="c.id"
            :style="{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: `1px solid ${BORDER}` }"
          >
            <div
              :style="{
                width: '26px', height: '26px', borderRadius: '50%',
                background: PRIMARY_LT, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '10px', fontWeight: 700,
                color: PRIMARY, flexShrink: 0,
              }"
            >
              {{ (c.author?.nickname ?? '?').slice(0, 2) }}
            </div>
            <div :style="{ flex: 1 }">
              <div :style="{ fontSize: '12px', fontWeight: 600, color: TEXT }">
                {{ c.author?.nickname ?? '익명' }}
                <span :style="{ fontWeight: 400, color: MUTED, marginLeft: '6px' }">{{ timeAgo(c.created_at) }}</span>
              </div>
              <div :style="{ fontSize: '13px', color: '#444', lineHeight: 1.6, marginTop: '2px' }">{{ c.body }}</div>
            </div>
          </div>

          <!-- 댓글 입력 -->
          <div :style="{ display: 'flex', gap: '8px', marginTop: '8px' }">
            <input
              v-model="commentBodies[p.id]"
              placeholder="댓글을 입력하세요"
              :style="{
                flex: 1, fontFamily: 'inherit', fontSize: '13px',
                padding: '8px 12px', border: `1px solid ${BORDER}`,
                borderRadius: '8px', outline: 'none', color: TEXT,
              }"
              @keydown.enter="submitComment(p.id)"
            />
            <button class="btn-primary" :style="{ padding: '6px 14px', fontSize: '12px' }" @click="submitComment(p.id)">등록</button>
          </div>
        </div>
      </div>

      <!-- 무한스크롤 인디케이터 -->
      <div v-if="loadingMore" :style="{ textAlign: 'center', padding: '16px 0', color: MUTED, fontSize: '13px' }">
        불러오는 중...
      </div>
      <div v-else-if="posts.length > 0 && !hasMore" :style="{ textAlign: 'center', padding: '16px 0', color: MUTED, fontSize: '12px' }">
        모든 게시글을 불러왔어요
      </div>

      <div v-if="!loading && posts.length === 0" class="empty-state">
        <div class="empty-state-icon">💬</div>
        <div class="empty-state-title">아직 게시글이 없어요</div>
        <div class="empty-state-desc">웨딩홀 후기나 결혼 준비 고민을 공유해보세요!</div>
      </div>
    </div>
  </div>
</template>
