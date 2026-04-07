export interface BwSong {
  id: string
  title: string
  artist: string
  genre: string
  mood: string
  scene: string
  preview_url: string | null
  thumbnail_url: string | null
  sort_order: number
}

const SCENES = ['신랑입장곡', '신부입장곡', '축가', '피로연'] as const
const MOODS = ['전체', '잔잔한', '설레는', '웅장한', '인기'] as const
const GENRES = ['전체', '클래식', 'K-발라드', '팝', 'K-POP'] as const

export function useMusic() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const songs = ref<BwSong[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const favoriteIds = ref<Set<string>>(new Set())

  async function fetchSongs() {
    if (loaded.value) return
    loading.value = true

    const { data } = await supabase
      .from('bw_songs')
      .select('*')
      .order('sort_order')

    if (data) {
      songs.value = data as BwSong[]
      loaded.value = true
    }

    if (user.value) {
      const { data: favs } = await supabase
        .from('bw_song_favorites')
        .select('song_id')
        .eq('user_id', user.value.id)

      favoriteIds.value = new Set((favs ?? []).map((f: any) => f.song_id))
    }

    loading.value = false
  }

  function filterSongs(scene: string, mood: string, genre: string) {
    return songs.value.filter((s) => {
      if (s.scene !== scene) return false
      if (mood !== '전체' && s.mood !== mood) return false
      if (genre !== '전체' && s.genre !== genre) return false
      return true
    })
  }

  async function toggleFavorite(songId: string) {
    if (!user.value) return

    const isFav = favoriteIds.value.has(songId)

    // Optimistic
    if (isFav) {
      favoriteIds.value = new Set([...favoriteIds.value].filter((id) => id !== songId))
    } else {
      favoriteIds.value = new Set([...favoriteIds.value, songId])
    }

    if (isFav) {
      await supabase.from('bw_song_favorites').delete()
        .eq('user_id', user.value.id).eq('song_id', songId)
    } else {
      await supabase.from('bw_song_favorites')
        .insert({ user_id: user.value.id, song_id: songId })
    }
  }

  return {
    songs, loading, favoriteIds,
    fetchSongs, filterSongs, toggleFavorite,
    SCENES, MOODS, GENRES,
  }
}
