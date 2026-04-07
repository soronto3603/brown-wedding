export interface BwPost {
  id: string
  author_id: string
  body: string
  hall_id: string | null
  like_count: number
  comment_count: number
  created_at: string
  // joined
  author?: { nickname: string; avatar_url: string | null }
  hall?: { name: string } | null
}

export interface BwComment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  body: string
  created_at: string
  author?: { nickname: string; avatar_url: string | null }
}

export function useLounge() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const posts = ref<BwPost[]>([])
  const loading = ref(false)
  const loadingMore = ref(false)
  const hasMore = ref(true)
  const likedPostIds = ref<Set<string>>(new Set())

  const PAGE_SIZE = 20

  async function fetchPosts() {
    loading.value = true
    hasMore.value = true

    const { data, error } = await supabase
      .from('bw_posts')
      .select(`
        *,
        author:bw_profiles!bw_posts_author_id_fkey(nickname, avatar_url),
        hall:bw_halls!bw_posts_hall_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .limit(PAGE_SIZE)

    if (!error && data) {
      posts.value = data as BwPost[]
      hasMore.value = data.length >= PAGE_SIZE
    }

    // 내 좋아요 목록
    if (user.value) {
      const { data: likes } = await supabase
        .from('bw_likes')
        .select('post_id')
        .eq('user_id', user.value.id)
        .not('post_id', 'is', null)

      likedPostIds.value = new Set((likes ?? []).map((l: any) => l.post_id))
    }

    loading.value = false
  }

  async function loadMore() {
    if (loadingMore.value || !hasMore.value || posts.value.length === 0) return
    loadingMore.value = true

    const lastPost = posts.value[posts.value.length - 1]

    const { data } = await supabase
      .from('bw_posts')
      .select(`
        *,
        author:bw_profiles!bw_posts_author_id_fkey(nickname, avatar_url),
        hall:bw_halls!bw_posts_hall_id_fkey(name)
      `)
      .order('created_at', { ascending: false })
      .lt('created_at', lastPost.created_at)
      .limit(PAGE_SIZE)

    if (data) {
      posts.value = [...posts.value, ...(data as BwPost[])]
      hasMore.value = data.length >= PAGE_SIZE
    }
    loadingMore.value = false
  }

  async function createPost(body: string, hallId?: string) {
    if (!user.value || !body.trim()) return null

    const insert: any = { author_id: user.value.id, body: body.trim() }
    if (hallId) insert.hall_id = hallId

    const { data, error } = await supabase
      .from('bw_posts')
      .insert(insert)
      .select(`
        *,
        author:bw_profiles!bw_posts_author_id_fkey(nickname, avatar_url),
        hall:bw_halls!bw_posts_hall_id_fkey(name)
      `)
      .single()

    if (error) return null
    const post = data as BwPost
    posts.value = [post, ...posts.value]
    return post
  }

  async function deletePost(id: string) {
    const { error } = await supabase
      .from('bw_posts')
      .update({ is_deleted: true })
      .eq('id', id)

    if (!error) {
      posts.value = posts.value.filter((p) => p.id !== id)
    }
  }

  async function toggleLike(postId: string) {
    if (!user.value) return

    const isLiked = likedPostIds.value.has(postId)

    // Optimistic update
    if (isLiked) {
      likedPostIds.value = new Set([...likedPostIds.value].filter((id) => id !== postId))
      posts.value = posts.value.map((p) =>
        p.id === postId ? { ...p, like_count: Math.max(0, p.like_count - 1) } : p,
      )
    } else {
      likedPostIds.value = new Set([...likedPostIds.value, postId])
      posts.value = posts.value.map((p) =>
        p.id === postId ? { ...p, like_count: p.like_count + 1 } : p,
      )
    }

    if (isLiked) {
      await supabase
        .from('bw_likes')
        .delete()
        .eq('user_id', user.value.id)
        .eq('post_id', postId)
    } else {
      await supabase
        .from('bw_likes')
        .insert({ user_id: user.value.id, post_id: postId })
    }
  }

  // 댓글
  async function fetchComments(postId: string): Promise<BwComment[]> {
    const { data } = await supabase
      .from('bw_comments')
      .select(`
        *,
        author:bw_profiles!bw_comments_author_id_fkey(nickname, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at')

    return (data ?? []) as BwComment[]
  }

  async function createComment(postId: string, body: string, parentId?: string) {
    if (!user.value || !body.trim()) return null

    const insert: any = {
      post_id: postId,
      author_id: user.value.id,
      body: body.trim(),
    }
    if (parentId) insert.parent_id = parentId

    const { data, error } = await supabase
      .from('bw_comments')
      .insert(insert)
      .select(`*, author:bw_profiles!bw_comments_author_id_fkey(nickname, avatar_url)`)
      .single()

    if (error) return null

    // comment_count 업데이트 (트리거가 처리하지만 UI도 즉시 반영)
    posts.value = posts.value.map((p) =>
      p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p,
    )

    return data as BwComment
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '방금'
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}일 전`
    return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
  }

  return {
    posts, loading, loadingMore, hasMore, likedPostIds,
    fetchPosts, loadMore, createPost, deletePost,
    toggleLike, fetchComments, createComment,
    timeAgo,
  }
}
