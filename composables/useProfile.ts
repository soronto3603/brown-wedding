export interface BwProfile {
  id: string
  nickname: string
  avatar_url: string | null
  couple_id: string | null
  role: string
  created_at: string
  updated_at: string
  couple?: { id: string; wedding_date: string | null } | null
}

export function useProfile() {
  const supabase = useSupabaseClient()
  const session = useSupabaseSession()

  const profile = ref<BwProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const weddingDate = computed(() => profile.value?.couple?.wedding_date ?? null)

  const dDay = computed(() => {
    if (!weddingDate.value) return null
    const diff = new Date(weddingDate.value).getTime() - Date.now()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  })

  const dDayLabel = computed(() => {
    if (dDay.value == null) return null
    if (dDay.value === 0) return 'D-Day'
    if (dDay.value > 0) return `D-${dDay.value}`
    return `D+${Math.abs(dDay.value)}`
  })

  async function fetchProfile() {
    if (!session.value?.user) return
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('bw_profiles')
      .select('*, couple:bw_couples!fk_bw_profiles_couple(id, wedding_date)')
      .eq('id', session.value.user.id)
      .single()

    if (err) {
      error.value = err.message
    } else {
      profile.value = data as BwProfile
    }
    loading.value = false
  }

  async function updateProfile(updates: Partial<Pick<BwProfile, 'nickname' | 'avatar_url'>>) {
    if (!session.value?.user) return false
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('bw_profiles')
      .update(updates)
      .eq('id', session.value.user.id)
      .select('*, couple:bw_couples!fk_bw_profiles_couple(id, wedding_date)')
      .single()

    if (err) {
      error.value = err.message
      loading.value = false
      return false
    }
    profile.value = data as BwProfile
    loading.value = false
    return true
  }

  async function setWeddingDate(date: string | null) {
    if (!session.value?.user) return false

    let coupleId = profile.value?.couple_id

    // couple이 없으면 생성
    if (!coupleId) {
      const { data: couple, error: cErr } = await supabase
        .from('bw_couples')
        .insert({ user_a: session.value.user.id, wedding_date: date })
        .select('id')
        .single()

      if (cErr) { error.value = cErr.message; return false }
      coupleId = (couple as any).id

      await supabase
        .from('bw_profiles')
        .update({ couple_id: coupleId })
        .eq('id', session.value.user.id)
    } else {
      const { error: uErr } = await supabase
        .from('bw_couples')
        .update({ wedding_date: date })
        .eq('id', coupleId)

      if (uErr) { error.value = uErr.message; return false }
    }

    await fetchProfile()
    return true
  }

  async function logout() {
    await supabase.auth.signOut()
    profile.value = null
  }

  watch(session, (s) => {
    if (s?.user) fetchProfile()
    else profile.value = null
  }, { immediate: true })

  return {
    profile, loading, error,
    weddingDate, dDay, dDayLabel,
    fetchProfile, updateProfile, setWeddingDate, logout,
  }
}
