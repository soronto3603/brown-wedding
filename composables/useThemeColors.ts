/**
 * WEDDiC 브랜드 컬러 (파레트 출처: `.cursor/rules/weddic-brand-colors.mdc`)
 * UI에서는 이 composable만 사용하고, 하드코딩된 HEX는 피합니다.
 */
export function useThemeColors() {
  return {
    /** 메인 핑크 — 버튼·활성·강조 */
    PRIMARY: '#F2728A',
    /** 중간 핑크 — 호버·세컨더리 강조 */
    PRIMARY_MID: '#E85C78',
    /** 다크 버건디 — 투톤·강한 액센트 */
    PRIMARY_DARK: '#C9325A',
    /** 서페이스/배경 — 거의 화이트 핑크 */
    PRIMARY_LT: '#FFF0F3',
    /** 소프트 핑크 — 칩·보더·비활성 배경 */
    PRIMARY_SOFT: '#FFD6E0',
    /** 다크 모드·히어로 배경용 */
    DARK_BG: '#2A1520',

    GOLD: '#C4A059',
    GOLD_LT: '#FBF6EC',

    TEXT: '#1A1A1A',
    MUTED: '#9B9B9B',
    /** 핑크 톤 보더 */
    BORDER: '#FFD6E0',
  } as const
}
