<script setup lang="ts">
import type { TabKey } from '~/data/wedding'
import { AUTH_REQUIRED_TABS, isTabKey, SIDE_MENUS } from '~/data/wedding'

const tab = ref<TabKey>('hall')
const route = useRoute()
const router = useRouter()

const session = useSupabaseSession()
const supabase = useSupabaseClient()
const {
  openAuthModal,
  openAuthModalForTab,
  clearPendingTab,
  pendingTabAfterLogin,
} = useAuthModal()

function onSelectTab(key: TabKey) {
  if (AUTH_REQUIRED_TABS.has(key) && !session.value) {
    pendingTabAfterLogin.value = key
    openAuthModal()
    return
  }
  tab.value = key
}

/** 자식 화면 등에서 로그인이 필요할 때 호출 (예: `openLoginFor('lounge')`) */
function openLoginFor(key: TabKey) {
  if (session.value) return
  openAuthModalForTab(key)
}

provide('openLoginModal', openLoginFor)

watch(session, (s) => {
  if (s && pendingTabAfterLogin.value) {
    tab.value = pendingTabAfterLogin.value
    clearPendingTab()
  }
})

onMounted(async () => {
  if (!import.meta.client) return

  /** Supabase OAuth(PKCE)가 Site URL 루트로 `?code=` 붙여 리다이렉트하는 경우 */
  if (route.query.code) {
    await supabase.auth.getSession()
    const q = { ...route.query } as Record<string, string | string[] | null | undefined>
    delete q.code
    await router.replace({ path: '/', query: q })
  }

  const q = route.query.tab
  if (typeof q === 'string' && isTabKey(q)) {
    tab.value = q
    clearPendingTab()
    router.replace({ path: '/', query: {} })
  }
})
</script>

<template>
  <div class="app-layout">
    <nav class="sidebar">
      <div class="sidebar-logo" @click="tab = 'hall'">
        <img
          src="/weddic-icon.svg"
          width="32"
          height="32"
          alt="WEDDiC"
        />
      </div>

      <div class="sidebar-menus">
        <LayoutSideBtn
          v-for="m in SIDE_MENUS"
          :key="m.key"
          :icon="m.icon"
          :label="m.label"
          :active="tab === m.key"
          @click="onSelectTab(m.key)"
        />
      </div>
    </nav>

    <main class="app-main">
      <HallPage v-if="tab === 'hall'" />
      <LoungePage v-else-if="tab === 'lounge'" />
      <BudgetPage v-else-if="tab === 'budget'" />
      <DictPage v-else-if="tab === 'dict'" />
      <MusicPage v-else-if="tab === 'music'" />
      <ProfilePage v-else-if="tab === 'profile'" />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--weddic-bg-section);
}

.sidebar {
  width: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-right: 1px solid var(--weddic-border);
  flex-shrink: 0;
  z-index: 10;
}

.sidebar-logo {
  padding: 14px 0 8px;
  cursor: pointer;
}

.sidebar-logo img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: block;
  object-fit: cover;
}

.sidebar-menus {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-top: 4px;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>
