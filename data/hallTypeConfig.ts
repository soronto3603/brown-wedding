// hall_type 배지 색상 매핑
// DB 값 기준 (unnest 결과 그대로)

export const HALL_TYPE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  웨딩홀: {
    label: '웨딩홀',
    bg: '#5B7BF5', // 인디고 블루
    text: '#ffffff',
  },
  '컨벤션 웨딩홀': {
    label: '컨벤션',
    bg: '#E8543A', // 코랄 레드
    text: '#ffffff',
  },
  '호텔 웨딩홀': {
    label: '호텔',
    bg: '#9B59B6', // 퍼플
    text: '#ffffff',
  },
  '야외 웨딩홀': {
    label: '야외',
    bg: '#27AE60', // 그린
    text: '#ffffff',
  },
  '채플 웨딩홀': {
    label: '채플',
    bg: '#795548', // 브라운
    text: '#ffffff',
  },
  '한옥 웨딩홀': {
    label: '한옥',
    bg: '#D35400', // 번트 오렌지
    text: '#ffffff',
  },
  '복합 웨딩홀': {
    label: '복합',
    bg: '#16A085', // 틸 그린
    text: '#ffffff',
  },
  '전통 웨딩홀': {
    label: '전통',
    bg: '#8B6914', // 골드 브라운
    text: '#ffffff',
  },
  '대학 웨딩홀': {
    label: '대학',
    bg: '#2471A3', // 딥 블루
    text: '#ffffff',
  },
  '교회 웨딩홀': {
    label: '교회',
    bg: '#616A6B', // 그레이 슬레이트
    text: '#ffffff',
  },
}

/** 배지 라벨 추출 헬퍼 */
export function getHallTypeBadge(hallType: string[] | null | undefined) {
  if (!hallType || hallType.length === 0) return HALL_TYPE_CONFIG['웨딩홀']
  return HALL_TYPE_CONFIG[hallType[0]] ?? HALL_TYPE_CONFIG['웨딩홀']
}
