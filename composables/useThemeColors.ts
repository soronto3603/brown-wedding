/**
 * WEDDiC 브랜드 컬러 — 리뉴얼 v2
 * 핑크는 CTA·액티브·뱃지에만 사용, 배경은 화이트/웜그레이 기반.
 * UI에서는 이 composable만 사용하고, 하드코딩된 HEX는 피합니다.
 */
export function useThemeColors() {
  return {
    /** 메인 코랄/피치 — CTA 버튼·액티브·뱃지 */
    PRIMARY: '#F2728A',
    /** 중간 핑크 — 호버·세컨더리 강조 */
    PRIMARY_MID: '#E85C78',
    /** 다크 버건디 — 투톤·강한 액센트 */
    PRIMARY_DARK: '#C9325A',
    /** 매우 연한 핑크 — 액티브 아이템 배경, 뱃지 배경 */
    PRIMARY_LT: '#FFF0F3',
    /** 소프트 핑크 — 칩·태그·비활성 배경 */
    PRIMARY_SOFT: '#FFD6E0',
    /** 다크 모드·히어로 배경용 */
    DARK_BG: '#2A1520',

    /** 골드 — 보조 액센트·태그·상태 */
    GOLD: '#C4A059',
    GOLD_LT: '#FBF6EC',

    /** 기본 배경 — 화이트 */
    BG: '#FFFFFF',
    /** 섹션 배경 — 웜 그레이 */
    BG_SECTION: '#FAFAF8',

    /** 본문 텍스트 */
    TEXT: '#1A1A1A',
    /** 보조 텍스트 */
    TEXT_SECONDARY: '#666666',
    /** 캡션·비활성 텍스트 */
    MUTED: '#999999',
    /** 구분선 — 뉴트럴 */
    BORDER: '#EEEEEE',

    /** 카드 그림자 */
    CARD_SHADOW: '0 1px 3px rgba(0,0,0,0.08)',
    /** 카드 호버 그림자 */
    CARD_SHADOW_HOVER: '0 4px 12px rgba(0,0,0,0.12)',
  } as const
}
