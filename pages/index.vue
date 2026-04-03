<script setup lang="ts">
import type { TabKey } from '~/data/wedding'
import { AUTH_REQUIRED_TABS, isTabKey, SIDE_MENUS } from '~/data/wedding'

const { PRIMARY_LT, BORDER } = useThemeColors()

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
  <div
    :style="{
      background: PRIMARY_LT,
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
    }"
  >
    <div
      :style="{
        width: '56px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: `1px solid ${BORDER}`,
        background: '#fff',
        flexShrink: 0,
        zIndex: 10,
        paddingTop: '8px',
      }"
    >
      <img
        src="/weddic-icon.svg"
        width="36"
        height="36"
        alt="WEDDiC"
        :style="{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '6px',
          display: 'block',
          objectFit: 'cover',
        }"
        @click="tab = 'hall'"
      />

      <LayoutSideBtn
        v-for="m in SIDE_MENUS"
        :key="m.key"
        :icon="m.icon"
        :label="m.label"
        :active="tab === m.key"
        @click="onSelectTab(m.key)"
      />
    </div>

    <div
      :style="{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
      }"
    >
      <HallPage v-if="tab === 'hall'" />
      <LoungePage v-else-if="tab === 'lounge'" />
      <BudgetPage v-else-if="tab === 'budget'" />
      <DictPage v-else-if="tab === 'dict'" />
      <MusicPage v-else-if="tab === 'music'" />
      <div
        v-else-if="tab === 'profile'"
        :style="{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: '8px',
          color: '#9B9B9B',
          fontSize: '14px',
        }"
      >
        <template v-if="session?.user">
          <span :style="{ color: '#1a1a1a', fontWeight: 600 }">마이 프로필</span>
          <span>{{ session.user.email ?? session.user.phone ?? '연결됨' }}</span>
        </template>
        <template v-else> 로그인이 필요해요 </template>
      </div>
    </div>
  </div>
</template>
