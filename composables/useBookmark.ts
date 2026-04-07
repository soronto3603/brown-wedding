export function useBookmark() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const bookmarkedIds = ref<Set<string>>(new Set())
  const myHallIds = ref<Set<string>>(new Set())
  const loading = ref(false)

  async function fetchBookmarks() {
    if (!user.value) return
    loading.value = true

    const { data } = await supabase
      .from('bw_bookmarks')
      .select('hall_id, type')
      .eq('user_id', user.value.id)

    bookmarkedIds.value = new Set(
      (data ?? []).filter((b: any) => b.type === 'wishlist').map((b: any) => b.hall_id),
    )
    myHallIds.value = new Set(
      (data ?? []).filter((b: any) => b.type === 'my_hall').map((b: any) => b.hall_id),
    )
    loading.value = false
  }

  async function toggleBookmark(hallId: string, type: 'wishlist' | 'my_hall' = 'wishlist') {
    if (!user.value) return false

    const targetSet = type === 'wishlist' ? bookmarkedIds : myHallIds
    const isBookmarked = targetSet.value.has(hallId)

    // Optimistic update
    if (isBookmarked) {
      targetSet.value = new Set([...targetSet.value].filter((id) => id !== hallId))
    } else {
      targetSet.value = new Set([...targetSet.value, hallId])
    }

    if (isBookmarked) {
      const { error } = await supabase
        .from('bw_bookmarks')
        .delete()
        .eq('user_id', user.value.id)
        .eq('hall_id', hallId)
        .eq('type', type)

      if (error) {
        // Revert
        targetSet.value = new Set([...targetSet.value, hallId])
        return false
      }
    } else {
      const { error } = await supabase
        .from('bw_bookmarks')
        .insert({ user_id: user.value.id, hall_id: hallId, type })

      if (error) {
        // Revert
        targetSet.value = new Set([...targetSet.value].filter((id) => id !== hallId))
        return false
      }
    }

    return true
  }

  watch(user, (u) => {
    if (u) fetchBookmarks()
    else {
      bookmarkedIds.value = new Set()
      myHallIds.value = new Set()
    }
  }, { immediate: true })

  return { bookmarkedIds, myHallIds, loading, toggleBookmark, fetchBookmarks }
}
