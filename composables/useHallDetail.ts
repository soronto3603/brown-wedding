import type { Hall } from '~/data/wedding'

/** Supabase nested select 결과 (스펙 README 기준) */
export type BwHallCostRow = {
  target_date: string | null
  meal_cost_min: number | null
  meal_cost_max: number | null
  meal_cost_text: string | null
  rental_cost_min: number | null
  rental_cost_max: number | null
  rental_cost_text: string | null
  guarantee_min: number | null
  guarantee_max: number | null
  guarantee_text: string | null
  add_cost: string | null
  contract_info: string | null
  external_corp: string | null
  source_link: string | null
}

export type BwHallRoomRow = {
  name: string | null
  type: string | null
  interval_text: string | null
  feature: string | null
  mood: string | null
  bride_room: string | null
  guarantee_min: number | null
  guarantee_max: number | null
  capacity: number | null
  source_link: string | null
}

export type BwHallDiningRow = {
  food_type: string | null
  menu_info: string | null
  capacity: number | null
  family_room: string | null
  review_score: number | null
  taste_pros: string | null
  taste_cons: string | null
  source_link: string | null
}

export type BwHallSourceRow = {
  id?: string
  source_type: string | null
  title: string | null
  summary: string | null
  url: string
  published_at: string | null
}

export type HallDetailRow = {
  id: string
  name: string
  address: string | null
  phone: string | null
  website_url: string | null
  is_verified: boolean
  hall_type: string[] | null
  food_type: string[] | null
  capacity_min: number | null
  capacity_max: number | null
  food_price_min: number | null
  food_price_max: number | null
  grade: string | null
  description: string | null
  detail_content: string | null
  parking_info: string | null
  total_parking: number | null
  free_parking_min: number | null
  transport: string | null
  has_shuttle: boolean | null
  elevator_info: string | null
  atm_location: string | null
  region_city: string | null
  region_district: string | null
  lat: number | string | null
  lng: number | string | null
  bw_hall_costs: BwHallCostRow[] | null
  bw_hall_rooms: BwHallRoomRow[] | null
  bw_hall_dinings: BwHallDiningRow[] | null
  bw_hall_sources: BwHallSourceRow[] | null
}

const HALL_DETAIL_SELECT = `
  id, name, address, phone, website_url, is_verified,
  hall_type, food_type, capacity_min, capacity_max,
  food_price_min, food_price_max,
  grade, description, detail_content,
  parking_info, total_parking, free_parking_min,
  transport, has_shuttle, elevator_info, atm_location,
  region_city, region_district, lat, lng,
  bw_hall_costs (
    target_date,
    meal_cost_min, meal_cost_max, meal_cost_text,
    rental_cost_min, rental_cost_max, rental_cost_text,
    guarantee_min, guarantee_max, guarantee_text,
    add_cost, contract_info, external_corp, source_link
  ),
  bw_hall_rooms (
    name, type, interval_text, feature,
    mood, bride_room, guarantee_min, guarantee_max,
    capacity, source_link
  ),
  bw_hall_dinings (
    food_type, menu_info, capacity, family_room,
    review_score, taste_pros, taste_cons, source_link
  ),
  bw_hall_sources (
    id, source_type, title, summary, url, published_at
  )
`.replace(/\s+/g, ' ')

export function useHallDetail() {
  const supabase = useSupabaseClient()

  async function fetchHallDetail(hallId: string): Promise<{
    hall: HallDetailRow | null
    error: Error | null
  }> {
    try {
      const { data, error } = await supabase
        .from('bw_halls')
        .select(HALL_DETAIL_SELECT)
        .eq('id', hallId)
        .eq('status', 'active')
        .maybeSingle()

      if (error) throw error
      if (!data) {
        return { hall: null, error: new Error('홀을 찾을 수 없거나 비공개입니다.') }
      }
      return { hall: data as HallDetailRow, error: null }
    } catch (e) {
      return {
        hall: null,
        error: e instanceof Error ? e : new Error(String(e)),
      }
    }
  }

  /** 같은 region_city 활성 홀의 식대 중간값 평균 (원) */
  async function fetchRegionAvgFoodMid(
    regionCity: string | null,
  ): Promise<number | null> {
    if (!regionCity?.trim()) return null
    try {
      const { data, error } = await supabase
        .from('bw_halls')
        .select('food_price_min, food_price_max')
        .eq('region_city', regionCity)
        .eq('status', 'active')
        .not('food_price_min', 'is', null)

      if (error) throw error
      const rows = data ?? []
      if (rows.length === 0) return null
      let sum = 0
      for (const h of rows) {
        const r = h as { food_price_min: number | null; food_price_max: number | null }
        const lo = r.food_price_min ?? 0
        const hi = r.food_price_max ?? lo
        sum += (lo + hi) / 2
      }
      return sum / rows.length
    } catch {
      return null
    }
  }

  return { fetchHallDetail, fetchRegionAvgFoodMid }
}

/** Hall(목록) + 상세 행에서 식대 만원 표시용 */
export function resolveFoodWonRange(
  hall: Hall,
  detail: HallDetailRow | null,
): { min: number | null; max: number | null } {
  const costs = detail?.bw_hall_costs?.[0]
  const min =
    detail?.food_price_min ??
    costs?.meal_cost_min ??
    (typeof hall.foodMin === 'number' ? hall.foodMin * 10000 : null)
  const max =
    detail?.food_price_max ??
    costs?.meal_cost_max ??
    (typeof hall.foodMax === 'number' ? hall.foodMax * 10000 : null)
  return { min: min ?? null, max: max ?? null }
}

/** 보증인원 범위 */
export function resolveGuaranteeRange(
  hall: Hall,
  detail: HallDetailRow | null,
): { min: number | null; max: number | null } {
  const costs = detail?.bw_hall_costs?.[0]
  const rooms = detail?.bw_hall_rooms?.[0]
  return {
    min:
      detail?.capacity_min ??
      costs?.guarantee_min ??
      rooms?.guarantee_min ??
      (typeof hall.minPpl === 'number' ? hall.minPpl : null),
    max:
      detail?.capacity_max ??
      costs?.guarantee_max ??
      rooms?.guarantee_max ??
      (typeof hall.maxPpl === 'number' ? hall.maxPpl : null),
  }
}
