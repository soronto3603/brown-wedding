export type HallMarkerKind =
  | 'wedding_hall'
  | 'convention'
  | 'outdoor'
  | 'hotel'
  | 'hanok'
  | 'chapel'

export interface Hall {
  /** 데모는 number, Supabase `bw_halls`는 uuid string */
  id: number | string
  name: string
  location: string
  phone: string
  mood: string
  foodMin: number
  foodMax: number
  minPpl: number
  maxPpl: number
  icon: string
  tags: string[]
  hallName: string
  hallDesc: string
  hallNote: string
  food: string
  foodDesc: string
  avgFood: string
  avgDiff: number
  /** 네이버 지도 마커용 (대략 좌표) */
  lat: number
  lng: number
  pinX: string
  pinY: string
  /** 지도 pill 왼쪽 칩 — 없으면 `hallTypes`·`tags`로 추론 */
  markerKind?: HallMarkerKind
  /** DB `hall_type` — 마커 종류 추론용 */
  hallTypes?: string[]
}

export interface Post {
  id: number
  nick: string
  time: string
  hall: string | null
  body: string
  likes: number
  comments: number
}

export interface BudgetItem {
  icon: string
  name: string
  sub: string
  amount: number
  done: boolean
}

export interface DictEntry {
  term: string
  cat: string
  def: string
}

export type MusicType = 'pop' | 'classic' | 'kpop'

export interface MusicItem {
  title: string
  artist: string
  icon: string
  badge: string
  type: MusicType
  mood: string
}

export const HALLS: Hall[] = [
  {
    id: 1,
    name: 'DMC타워웨딩',
    location: '서울 마포구 상암동 1622',
    phone: '1899-1221',
    mood: '모던',
    foodMin: 5,
    foodMax: 6,
    minPpl: 150,
    maxPpl: 150,
    icon: '🏢',
    tags: ['모던', '어두운홀', '높은천고'],
    hallName: '그랜드볼룸홀',
    hallDesc:
      '웅장하고 넓은 홀. 높은 층고, 긴 버진로드 21m, 통창, 샹들리에, 생화 장식 고급스러움, 화려함, 어두운 홀',
    hallNote: '신부대기실 규모와 퀄리티 손에 꼽음, 신랑측·신부측 메이크업실 분리',
    food: '뷔페',
    foodDesc: '퀄리티 좋은 회, 사시미 쫄깃하고 부드럽고 비린내 없음',
    avgFood: '7.2만원',
    avgDiff: 24,
    lat: 37.5786,
    lng: 126.896,
    pinX: '36%',
    pinY: '34%',
  },
  {
    id: 2,
    name: '아펠가모 도산',
    location: '서울 강남구 신사동 669',
    phone: '02-3444-0100',
    mood: '럭셔리',
    foodMin: 9,
    foodMax: 12,
    minPpl: 200,
    maxPpl: 300,
    icon: '🏛',
    tags: ['럭셔리', '뷔페', '대형홀'],
    hallName: '그랜드볼룸',
    hallDesc:
      '웅장한 럭셔리 홀. 높은 천고와 고급스러운 인테리어, 대형 샹들리에. 강남 최고급 웨딩홀 중 하나.',
    hallNote: '신부대기실 별도 운영, 주차 편리, VIP 전담 플래너',
    food: '뷔페',
    foodDesc: '고급 뷔페, 다양한 요리 구성. 해산물 코너와 라이브 코너 운영.',
    avgFood: '11만원',
    avgDiff: -5,
    lat: 37.5247,
    lng: 127.0381,
    pinX: '63%',
    pinY: '60%',
  },
  {
    id: 3,
    name: '더파티웨딩',
    location: '서울 서초구 반포동 19-3',
    phone: '02-533-7000',
    mood: '모던',
    foodMin: 7,
    foodMax: 8,
    minPpl: 150,
    maxPpl: 200,
    icon: '💒',
    tags: ['모던', '인기', '자연광'],
    hallName: '메인홀',
    hallDesc: '모던하고 세련된 분위기. 자연광이 잘 드는 밝은 홀로 화사한 웨딩 사진 연출 가능.',
    hallNote: '신랑/신부 대기실 분리, 넓은 주차장 보유',
    food: '뷔페',
    foodDesc: '신선한 재료 사용, 합리적인 가격대. 시즌별 메뉴 변경.',
    avgFood: '8.5만원',
    avgDiff: 18,
    lat: 37.5014,
    lng: 127.002,
    pinX: '55%',
    pinY: '66%',
  },
  {
    id: 4,
    name: '더채플 한남',
    location: '서울 용산구 한남동 683-139',
    phone: '02-790-1234',
    mood: '클래식',
    foodMin: 10,
    foodMax: 14,
    minPpl: 80,
    maxPpl: 100,
    icon: '⛪',
    tags: ['클래식', '소규모', '채플'],
    hallName: '채플홀',
    hallDesc: '유럽풍 클래식 채플. 스테인드글라스와 아치형 천장이 특징적인 아름다운 소규모 공간.',
    hallNote: '소규모 프라이빗 웨딩 특화, 맞춤 패키지 협의 가능',
    food: '양식코스',
    foodDesc: '미슐랭 출신 셰프의 정찬 코스. 와인 페어링 옵션.',
    avgFood: '12만원',
    avgDiff: -8,
    lat: 37.5331,
    lng: 127.0047,
    pinX: '44%',
    pinY: '44%',
  },
  {
    id: 5,
    name: '더컨벤션 신사',
    location: '서울 강남구 논현동 98',
    phone: '02-512-5000',
    mood: '모던',
    foodMin: 8,
    foodMax: 9,
    minPpl: 180,
    maxPpl: 250,
    icon: '🌿',
    tags: ['모던', '가든', '야외'],
    hallName: '컨벤션홀 A',
    hallDesc: '넓은 컨벤션 홀. 야외 가든과 연결, 자연채광이 풍부한 밝은 공간.',
    hallNote: '야외 가든 부대시설 이용 가능, 드론 촬영 허용',
    food: '뷔페',
    foodDesc: '신선한 제철 재료, 다양한 라이브 코너 운영.',
    avgFood: '9만원',
    avgDiff: 11,
    lat: 37.5225,
    lng: 127.0314,
    pinX: '64%',
    pinY: '52%',
  },
  {
    id: 6,
    name: '신라호텔 다이너스티',
    location: '서울 중구 장충동 2가 202',
    phone: '02-2233-3131',
    mood: '럭셔리',
    foodMin: 14,
    foodMax: 18,
    minPpl: 300,
    maxPpl: 500,
    icon: '🏨',
    tags: ['럭셔리', '호텔', '초대형'],
    hallName: '다이너스티홀',
    hallDesc: '최고급 호텔 웨딩홀. 500명 수용 가능한 초대형 홀, 최고급 인테리어와 시설.',
    hallNote: '호텔 스위트룸 신부 대기, VIP 의전 서비스 포함',
    food: '양식/한식 선택',
    foodDesc: '신라호텔 특급 요리사의 프리미엄 코스. 와인 포함.',
    avgFood: '16만원',
    avgDiff: -12,
    lat: 37.5558,
    lng: 127.0053,
    pinX: '52%',
    pinY: '38%',
  },
]

/** 식대 구간 필터 */
export function hallMatchesFoodRange(h: Hall, foodF: string): boolean {
  if (foodF === '전체') return true
  if (foodF === '~6만원') return h.foodMax <= 6
  if (foodF === '6~9만원') return h.foodMin <= 9 && h.foodMax >= 6
  if (foodF === '9만원~') return h.foodMin >= 9
  return true
}

/** 보증인원 구간 필터 */
export function hallMatchesGuestRange(h: Hall, minF: string): boolean {
  if (minF === '전체') return true
  if (minF === '~100명') return h.maxPpl <= 100
  if (minF === '100~200명') return h.maxPpl >= 100 && h.minPpl <= 200
  if (minF === '200명~') return h.maxPpl >= 200
  return true
}

export const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    nick: '라부부',
    time: '10시간 전',
    hall: '더파티웨딩',
    body: '예랑이랑 취향이 너무 달라서 힘드네요 ㅠㅠ 저는 밝고 화사한 홀이 좋은데 예랑이는 어둡고 차분한 홀이 좋다고 하고... 하나하나 맞춰가는 게 이렇게 에너지 소모가 클 줄 몰랐어요.',
    likes: 11,
    comments: 3,
  },
  {
    id: 2,
    nick: '슈잉',
    time: '3월 26일',
    hall: null,
    body: '블로그는 광고 같고 카페는 정보가 흩어져 있고… 여기는 뭔가 클린한 느낌이네요.',
    likes: 1,
    comments: 0,
  },
  {
    id: 3,
    nick: '심바맘',
    time: '3월 26일',
    hall: '신도림 웨딩홀',
    body: '신도림 최악의 웨딩홀이라고 함. 절대 가지 말기. 식사도 별로고 직원도 불친절.',
    likes: 21,
    comments: 7,
  },
  {
    id: 4,
    nick: '예식장탐방중',
    time: '2월 4일',
    hall: '더컨벤션 신사',
    body: '더컨벤션 신사 최종 후보로 고민중인데, 혹시 하신분들 있다면 정보 같이 공유하면 좋을 것 같아요!!',
    likes: 7,
    comments: 2,
  },
]

export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  { icon: '🏛', name: '웨딩홀', sub: '더파티웨딩 · 계약완료', amount: 680, done: true },
  { icon: '📸', name: '스드메', sub: '스튜디오+드레스+메이크업', amount: 740, done: true },
  { icon: '✈️', name: '허니문', sub: '몰디브 5박 7일 예정', amount: 500, done: false },
  { icon: '💍', name: '예물·예단', sub: '미정', amount: 800, done: false },
  { icon: '📨', name: '청첩장', sub: '인쇄 150장', amount: 15, done: true },
  { icon: '🎁', name: '답례품', sub: '미정', amount: 200, done: false },
]

export const DICT: DictEntry[] = [
  {
    term: '스드메',
    cat: '스드메',
    def: '스튜디오 + 드레스 + 메이크업의 줄임말. 웨딩 사진 촬영, 드레스 대여, 헤어메이크업을 패키지로 묶은 것.',
  },
  {
    term: '보증인원',
    cat: '예식장',
    def: '웨딩홀에서 계약 시 최소한으로 보장해야 하는 하객 인원 수. 실제 하객 수가 보증인원보다 적어도 보증인원 기준으로 식대 정산.',
  },
  {
    term: '예단',
    cat: '예물·예단',
    def: '신부가 신랑 집에 보내는 폐백 음식이나 혼수 등의 선물. 요즘은 현금으로 대체하거나 간소화하는 추세.',
  },
  {
    term: '본식스냅',
    cat: '준비단계',
    def: '결혼식 당일에 식장에서 찍는 사진. 야외촬영과 별개로 실제 식이 진행되는 동안 현장을 담는 스냅 사진.',
  },
  {
    term: '식대',
    cat: '음식',
    def: '하객 1인당 식사 비용. 뷔페, 한식 코스, 양식 코스 등 방식에 따라 다르며 웨딩 전체 비용에서 큰 비중 차지.',
  },
  {
    term: '폐백',
    cat: '준비단계',
    def: '결혼식 후 신랑 부모님과 친척들께 인사를 드리는 전통 예식. 한복을 입고 큰절을 올리고 대추, 밤 등을 받음.',
  },
  {
    term: '하객답례품',
    cat: '비용',
    def: '결혼식에 참석한 하객에게 감사의 마음을 담아 드리는 선물. 식품, 화장품, 소품 등 다양.',
  },
]

export const MUSIC: MusicItem[] = [
  { title: 'A Thousand Years', artist: 'Christina Perri', icon: '🎵', badge: '인기', type: 'pop', mood: '잔잔한' },
  { title: 'Canon in D', artist: 'Johann Pachelbel', icon: '🎶', badge: '클래식', type: 'classic', mood: '클래식' },
  { title: '그대라는 시', artist: '거미 & 김조한', icon: '🎸', badge: 'K-발라드', type: 'kpop', mood: '잔잔한' },
  { title: 'Perfect', artist: 'Ed Sheeran', icon: '🎹', badge: '팝', type: 'pop', mood: '설레는' },
  { title: '사랑이래', artist: '박효신', icon: '🎼', badge: 'K-발라드', type: 'kpop', mood: '잔잔한' },
  { title: 'Marry You', artist: 'Bruno Mars', icon: '🎤', badge: '설레는', type: 'pop', mood: '설레는' },
]

export type TabKey = 'hall' | 'lounge' | 'budget' | 'dict' | 'music' | 'profile'

export const TAB_KEYS: TabKey[] = [
  'hall',
  'lounge',
  'budget',
  'dict',
  'music',
  'profile',
]

export function isTabKey(s: string): s is TabKey {
  return (TAB_KEYS as string[]).includes(s)
}

/** 로그인 없이 열면 로그인 모달을 띄우는 사이드 탭 */
export const AUTH_REQUIRED_TABS = new Set<TabKey>(['profile', 'lounge', 'budget'])

export const SIDE_MENUS: { key: TabKey; icon: string; label: string }[] = [
  { key: 'hall', icon: '🏠', label: '홀지도' },
  { key: 'lounge', icon: '👥', label: '대기실' },
  { key: 'budget', icon: '📋', label: '우리예산' },
  { key: 'dict', icon: '📖', label: '용어사전' },
  { key: 'music', icon: '🎵', label: '선곡기' },
  { key: 'profile', icon: '👤', label: '프로필' },
]
