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
  deposit: number
  balance: number
  pay_method: string
  payer: string
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
  const session = useSupabaseSession()

  /** 현재 로그인된 사용자 ID를 안전하게 가져옴 */
  function uid(): string | null {
    return user.value?.id ?? session.value?.user?.id ?? null
  }

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

  /** 카테고리별 그룹 */
  const groupedByCategory = computed(() => {
    const groups: Record<string, BwBudgetItem[]> = {}
    for (const cat of BUDGET_CATEGORIES) groups[cat] = []
    for (const item of items.value) {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    }
    return groups
  })

  /** 카테고리별 소계 */
  const categoryTotals = computed(() => {
    const totals: Record<string, number> = {}
    for (const [cat, list] of Object.entries(groupedByCategory.value)) {
      totals[cat] = list.reduce((s, i) => s + i.amount, 0)
    }
    return totals
  })

  /** 결제자별 합계 (신랑/신부/공동) */
  const payerTotals = computed(() => {
    const t: Record<string, number> = { '신랑': 0, '신부': 0, '공동': 0, '': 0 }
    for (const item of items.value) {
      const key = item.payer || ''
      t[key] = (t[key] ?? 0) + item.amount
    }
    return t
  })

  /** 결제 방식별 합계 (카드/현금/이체) */
  const payMethodTotals = computed(() => {
    const t: Record<string, number> = { '카드': 0, '현금': 0, '이체': 0 }
    for (const item of items.value) {
      const key = item.pay_method || '카드'
      t[key] = (t[key] ?? 0) + item.amount
    }
    return t
  })

  async function ensureCoupleAndPlan(): Promise<string | null> {
    const userId = uid()
    if (!userId) return null

    if (plan.value) return plan.value.id

    // profile에서 couple_id 조회
    const { data: profile } = await supabase
      .from('bw_profiles')
      .select('couple_id')
      .eq('id', userId)
      .maybeSingle()

    let coupleId = (profile as any)?.couple_id

    if (!coupleId) {
      // 기존 couple 확인
      const { data: existing } = await supabase
        .from('bw_couples')
        .select('id')
        .or(`user_a.eq.${userId},user_b.eq.${userId}`)
        .maybeSingle()

      if (existing) {
        coupleId = existing.id
      } else {
        const { data: couple, error: cErr } = await supabase
          .from('bw_couples')
          .insert({ user_a: userId })
          .select('id')
          .single()
        if (cErr) { error.value = cErr.message; return null }
        coupleId = (couple as any).id
      }

      await supabase.from('bw_profiles').update({ couple_id: coupleId }).eq('id', userId)
    }

    // 기존 plan 확인
    const { data: existingPlan } = await supabase
      .from('bw_budget_plans')
      .select('*')
      .eq('couple_id', coupleId)
      .maybeSingle()

    if (existingPlan) {
      plan.value = existingPlan as BwBudgetPlan
      return plan.value.id
    }

    // plan 생성
    const { data: newPlan, error: pErr } = await supabase
      .from('bw_budget_plans')
      .insert({ couple_id: coupleId, total: 3000 })
      .select()
      .single()

    if (pErr) { error.value = pErr.message; return null }
    plan.value = newPlan as BwBudgetPlan

    // 첫 생성 시 샘플 데이터 삽입
    await seedSampleItems(plan.value.id)
    await fetchBudget()

    return plan.value.id
  }

  async function seedSampleItems(planId: string) {
    const samples = [
      { category: '웨딩홀', name: '대관료', amount: 500, deposit: 100, balance: 400, pay_method: '카드', payer: '공동', status: 'done' },
      { category: '웨딩홀', name: '식대 (300명)', amount: 800, deposit: 200, balance: 600, pay_method: '카드', payer: '공동', status: 'in_progress' },
      { category: '웨딩홀', name: '본식 스냅', amount: 150, deposit: 50, balance: 100, pay_method: '카드', payer: '신부', status: 'todo' },
      { category: '스드메', name: '스튜디오 촬영', amount: 300, deposit: 150, balance: 150, pay_method: '카드', payer: '신부', status: 'done' },
      { category: '스드메', name: '드레스', amount: 200, deposit: 100, balance: 100, pay_method: '현금', payer: '신부', status: 'done' },
      { category: '스드메', name: '신랑 예복', amount: 80, deposit: 40, balance: 40, pay_method: '카드', payer: '신랑', status: 'in_progress' },
      { category: '스드메', name: '메이크업', amount: 60, deposit: 30, balance: 30, pay_method: '현금', payer: '신부', status: 'todo' },
      { category: '허니문', name: '항공권', amount: 400, deposit: 400, balance: 0, pay_method: '카드', payer: '신랑', status: 'done' },
      { category: '허니문', name: '숙소', amount: 300, deposit: 0, balance: 300, pay_method: '카드', payer: '신랑', status: 'todo' },
      { category: '예물예단', name: '반지', amount: 200, deposit: 200, balance: 0, pay_method: '현금', payer: '공동', status: 'done' },
      { category: '기타', name: '청첩장', amount: 30, deposit: 30, balance: 0, pay_method: '이체', payer: '공동', status: 'done' },
      { category: '기타', name: '답례품', amount: 50, deposit: 0, balance: 50, pay_method: '카드', payer: '공동', status: 'todo' },
    ]
    await supabase.from('bw_budget_items').insert(
      samples.map((s, i) => ({ plan_id: planId, ...s, sort_order: i })),
    )
  }

  async function fetchBudget() {
    if (!uid()) return
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
      loading.value = false
    } else {
      // plan이 없으면 자동 생성 (시드 데이터 포함)
      loading.value = false
      await ensureCoupleAndPlan()
    }
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

  async function addItem(item: Pick<BwBudgetItem, 'category' | 'name' | 'amount'> & Partial<Pick<BwBudgetItem, 'deposit' | 'balance' | 'pay_method' | 'payer' | 'memo'>>) {
    const planId = await ensureCoupleAndPlan()
    if (!planId) return null

    const { data, error: err } = await supabase
      .from('bw_budget_items')
      .insert({
        plan_id: planId,
        category: item.category,
        name: item.name,
        amount: item.amount,
        deposit: item.deposit ?? 0,
        balance: item.balance ?? 0,
        pay_method: item.pay_method ?? '카드',
        payer: item.payer ?? '',
        memo: item.memo ?? null,
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

  watch([user, session], () => {
    if (uid()) fetchBudget()
    else { plan.value = null; items.value = [] }
  }, { immediate: true })

  return {
    plan, items, loading, error,
    spent, pct, remaining,
    groupedByCategory, categoryTotals, payerTotals, payMethodTotals,
    fetchBudget, updateTotal, addItem, updateItem, deleteItem, toggleStatus,
    BUDGET_CATEGORIES,
  }
}
