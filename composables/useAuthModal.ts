import type { TabKey } from '~/data/wedding'

/**
 * 전역 로그인 모달 + 로그인 후 이동할 사이드 탭 예약
 */
export function useAuthModal() {
  const isOpen = useState('auth-modal-open', () => false)
  const pendingTabAfterLogin = useState<TabKey | null>(
    'auth-pending-tab',
    () => null,
  )

  function openAuthModal() {
    isOpen.value = true
  }

  function closeAuthModal() {
    isOpen.value = false
  }

  function clearPendingTab() {
    pendingTabAfterLogin.value = null
  }

  /** 특정 탭으로 가려다 로그인이 필요할 때 한 번에 열기 */
  function openAuthModalForTab(tab: TabKey) {
    pendingTabAfterLogin.value = tab
    openAuthModal()
  }

  return {
    isOpen,
    pendingTabAfterLogin,
    openAuthModal,
    openAuthModalForTab,
    closeAuthModal,
    clearPendingTab,
  }
}
