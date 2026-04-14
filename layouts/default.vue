<script setup lang="ts">
import type { TabKey } from '~/data/wedding'
import { AUTH_REQUIRED_TABS, SIDE_MENUS } from '~/data/wedding'

const ICON_PATHS: Record<string, string> = {
  hall: 'M3 21V8l9-6 9 6v13H3z M9 21v-6h6v6',
  lounge: 'M17 21v-2a4 4 0 0 0-3-3.87M9 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  budget: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  dict: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  profile: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
}

const TAB_ROUTES: Record<TabKey, string> = {
  hall: '/', lounge: '/lounge', budget: '/budget',
  dict: '/dict', music: '/music', profile: '/profile',
}

const route = useRoute()
const session = useSupabaseSession()
const { openAuthModal, pendingTabAfterLogin, clearPendingTab } = useAuthModal()

const activeTab = computed<TabKey>(() => {
  const p = route.path
  if (p === '/' || p === '/hall') return 'hall'
  const key = p.replace('/', '') as TabKey
  return (SIDE_MENUS.some(m => m.key === key)) ? key : 'hall'
})

function onSelectTab(key: TabKey) {
  if (AUTH_REQUIRED_TABS.has(key) && !session.value) {
    pendingTabAfterLogin.value = key
    openAuthModal()
    return
  }
  navigateTo(TAB_ROUTES[key])
}

watch(session, (s) => {
  if (s && pendingTabAfterLogin.value) {
    const t = pendingTabAfterLogin.value
    clearPendingTab()
    navigateTo(TAB_ROUTES[t])
  }
})

provide('openLoginModal', (key: TabKey) => {
  if (session.value) return
  pendingTabAfterLogin.value = key
  openAuthModal()
})
</script>

<template>
  <div class="app-layout">
    <nav class="sidebar">
      <div class="sidebar-logo" @click="navigateTo('/')">
        <img src="/app-icon.svg" width="32" height="32" alt="딸깍웨딩" />
      </div>
      <div class="sidebar-menus">
        <LayoutSideBtn
          v-for="m in SIDE_MENUS" :key="m.key"
          :icon="m.icon" :label="m.label" :active="activeTab === m.key"
          @click="onSelectTab(m.key)"
        />
      </div>
      <ClientOnly><DevPanel /></ClientOnly>
    </nav>

    <main class="app-main">
      <slot />
    </main>

    <nav class="bottom-nav">
      <button
        v-for="m in SIDE_MENUS" :key="m.key"
        :class="['bottom-nav-btn', { active: activeTab === m.key }]"
        @click="onSelectTab(m.key)"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path :d="ICON_PATHS[m.icon]" />
        </svg>
        <span class="bottom-nav-label">{{ m.label }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.app-layout { display: flex; height: 100vh; overflow: hidden; background: var(--w-bg-section); }

.sidebar {
  width: 64px; display: flex; flex-direction: column; align-items: center;
  background: #fff; border-right: 1px solid var(--w-border); flex-shrink: 0; z-index: 10;
}
.sidebar-logo { padding: 14px 0 8px; cursor: pointer; }
.sidebar-logo img { width: 32px; height: 32px; border-radius: 8px; display: block; object-fit: cover; }
.sidebar-menus { flex: 1; width: 100%; display: flex; flex-direction: column; gap: 2px; padding-top: 4px; }

.app-main { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

.bottom-nav { display: none; }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .app-main { padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px)); }
  .bottom-nav {
    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
    height: calc(56px + env(safe-area-inset-bottom, 0px));
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: #fff; border-top: 1px solid var(--w-border);
    z-index: 9999; align-items: center; justify-content: space-around;
  }
  .bottom-nav-btn {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; padding: 6px 0; border: none; background: transparent;
    color: var(--w-muted); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: color 0.15s ease;
  }
  .bottom-nav-btn.active { color: var(--w-primary); }
  .bottom-nav-label { font-size: 10px; font-weight: 500; line-height: 1.2; letter-spacing: -0.02em; }
  .bottom-nav-btn.active .bottom-nav-label { font-weight: 700; }
}
</style>
