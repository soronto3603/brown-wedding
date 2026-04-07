export interface BwGlossaryEntry {
  id: string
  term: string
  description: string
  category: string
  related_terms: string[]
  sort_order: number
}

export function useGlossary() {
  const supabase = useSupabaseClient()

  const entries = ref<BwGlossaryEntry[]>([])
  const loading = ref(false)
  const loaded = ref(false)

  async function fetchGlossary() {
    if (loaded.value) return
    loading.value = true

    const { data, error } = await supabase
      .from('bw_glossary')
      .select('*')
      .order('sort_order')

    if (!error && data) {
      entries.value = data as BwGlossaryEntry[]
      loaded.value = true
    }
    loading.value = false
  }

  const categories = computed(() => {
    const cats = new Set(entries.value.map((e) => e.category))
    return ['전체', ...cats]
  })

  function search(query: string, category: string) {
    return entries.value.filter((e) => {
      if (category !== '전체' && e.category !== category) return false
      if (query) {
        const q = query.toLowerCase()
        return e.term.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
      }
      return true
    })
  }

  return { entries, loading, loaded, fetchGlossary, categories, search }
}
