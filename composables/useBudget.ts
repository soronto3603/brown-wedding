export interface BwBudgetPlan {
  id: string
  couple_id: string
  total: number
  wedding_date: string | null
  created_at: string
  updated_at: string
}

export interface BwBudgetItem {
  id: string
  plan_id: string
  category: string
  name: string
  memo: string | null
  amount: number
  actual: number | null
  status: 'todo' | 'in_progress' | 'done' | 'cancelled'
  sort_order: number
  created_at: string
  updated_at: string
}

const BUDGET_CATEGORIES = [
  '웨딩홀', '스드메', '허니문', '예물예단', '청첩장', '답례품', '기타',
] as const

export function useBudget() {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const plan = ref<BwBudgetPlan | null>(null)
  const items = ref<BwBudgetItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const spent = computed(() =>
    items.value
      .filter((i) => i.status === 'done')
      .reduce((sum, i) => sum + (i.actual ?? i.amount), 0),
  )

  const pct = computed(() => {
    if (!plan.value || plan.value.total === 0) return 0
    return Math.round((spent.value / plan.value.total) * 100)
  })

  const remaining = computed(() => (plan.value?.total ?? 0) - spent.value)

  async function ensureCoupleAndPlan(): Promise<string | null> {
    if (!user.value) return null

    // 기존 plan 확인
    if (plan.value) return plan.value.id

    // couple 확인 또는 생성
    let { data: profile } = await supabase
      .from('bw_profiles')
      .select('couple_id')
      .eq('id', user.value.id)
      .single()

    let coupleId = (profile as any)?.couple_id

    if (!coupleId) {
      const { data: couple, error: cErr } = await supabase
        .from('bw_couples')
        .insert({ user_a: user.value.id })
        .select('id')
        .single()

      if (cErr) { error.value = cErr.message; return null }
      coupleId = (couple as any).id

      await supabase
        .from('bw_profiles')
        .update({ couple_id: coupleId })
        .eq('id', user.value.id)
    }

    // plan 생성
    const { data: newPlan, error: pErr } = await supabase
      .from('bw_budget_plans')
      .insert({ couple_id: coupleId, total: 3000 })
      .select()
      .single()

    if (pErr) { error.value = pErr.message; return null }
    plan.value = newPlan as BwBudgetPlan
    return plan.value.id
  }

  async function fetchBudget() {
    if (!user.value) return
    loading.value = true
    error.value = null

    const { data, error: err } = await supabase
      .from('bw_budget_plans')
      .select('*, bw_budget_items(*)')
      .order('sort_order', { referencedTable: 'bw_budget_items' })
      .limit(1)
      .maybeSingle()

    if (err) {
      error.value = err.message
      loading.value = false
      return
    }

    if (data) {
      const { bw_budget_items: rawItems, ...planData } = data as any
      plan.value = planData as BwBudgetPlan
      items.value = (rawItems ?? []) as BwBudgetItem[]
    } else {
      plan.value = null
      items.value = []
    }
    loading.value = false
  }

  async function updateTotal(total: number) {
    const planId = await ensureCoupleAndPlan()
    if (!planId) return false

    const { error: err } = await supabase
      .from('bw_budget_plans')
      .update({ total })
      .eq('id', planId)

    if (err) { error.value = err.message; return false }
    if (plan.value) plan.value.total = total
    return true
  }

  async function addItem(item: Pick<BwBudgetItem, 'category' | 'name' | 'amount'>) {
    const planId = await ensureCoupleAndPlan()
    if (!planId) return null

    const { data, error: err } = await supabase
      .from('bw_budget_items')
      .insert({
        plan_id: planId,
        category: item.category,
        name: item.name,
        amount: item.amount,
        sort_order: items.value.length,
      })
      .select()
      .single()

    if (err) { error.value = err.message; return null }
    const newItem = data as BwBudgetItem
    items.value = [...items.value, newItem]
    return newItem
  }

  async function updateItem(id: string, updates: Partial<Pick<BwBudgetItem, 'name' | 'amount' | 'actual' | 'status' | 'memo' | 'category'>>) {
    const { error: err } = await supabase
      .from('bw_budget_items')
      .update(updates)
      .eq('id', id)

    if (err) { error.value = err.message; return false }
    items.value = items.value.map((i) => (i.id === id ? { ...i, ...updates } : i))
    return true
  }

  async function deleteItem(id: string) {
    const { error: err } = await supabase
      .from('bw_budget_items')
      .delete()
      .eq('id', id)

    if (err) { error.value = err.message; return false }
    items.value = items.value.filter((i) => i.id !== id)
    return true
  }

  async function toggleStatus(id: string) {
    const item = items.value.find((i) => i.id === id)
    if (!item) return false
    const next = item.status === 'done' ? 'todo' : 'done'
    return updateItem(id, { status: next })
  }

  watch(user, (u) => {
    if (u) fetchBudget()
    else { plan.value = null; items.value = [] }
  }, { immediate: true })

  return {
    plan, items, loading, error,
    spent, pct, remaining,
    fetchBudget, updateTotal, addItem, updateItem, deleteItem, toggleStatus,
    BUDGET_CATEGORIES,
  }
}
