import type { TabKey } from '~/data/wedding'

/**
 * `pages/index.vue`에서 provide한 로그인 모달 열기 (자식 페이지·컴포넌트에서 사용)
 * 예: `const openLogin = useLoginGate(); openLogin('lounge')`
 */
export function useLoginGate() {
  const openLoginModal = inject<((key: TabKey) => void) | undefined>(
    'openLoginModal',
    undefined,
  )
  return (key: TabKey = 'profile') => {
    openLoginModal?.(key)
  }
}
