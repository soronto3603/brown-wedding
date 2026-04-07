<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const show = ref(false)
const status = ref('')

const TEST_ACCOUNTS = [
  { email: 'test@brownwedding.dev', label: '테스트유저', icon: '🧪' },
  { email: 'bride01@brownwedding.dev', label: '예비신부A', icon: '👰' },
  { email: 'groom01@brownwedding.dev', label: '예비신랑A', icon: '🤵' },
  { email: 'bride02@brownwedding.dev', label: '예비신부B', icon: '👰' },
  { email: 'groom02@brownwedding.dev', label: '예비신랑B', icon: '🤵' },
  { email: 'admin@brownwedding.dev', label: '관리자', icon: '🔑' },
] as const

async function loginAs(email: string) {
  status.value = '로그인 중...'
  // 기존 세션 로그아웃
  if (user.value) await supabase.auth.signOut()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: 'test1234!',
  })
  status.value = error ? `실패: ${error.message}` : '로그인 성공!'
  setTimeout(() => { status.value = '' }, 2000)
}

async function testLogout() {
  status.value = '로그아웃 중...'
  await supabase.auth.signOut()
  status.value = '로그아웃 완료'
  setTimeout(() => { status.value = '' }, 2000)
}

const currentLabel = computed(() => {
  if (!user.value) return null
  return TEST_ACCOUNTS.find(a => a.email === user.value!.email)?.label ?? user.value.email
})

const isAdmin = computed(() =>
  TEST_ACCOUNTS.find(a => a.email === user.value?.email)?.label === '관리자'
)
</script>

<template>
  <div class="dev-wrap">
    <button v-if="!show" class="dev-toggle" @click="show = true" title="Dev Tools">
      🛠
    </button>

    <div v-if="show" class="dev-panel">
      <div class="dev-header">
        <span>🛠 Dev</span>
        <span class="dev-close" @click="show = false">✕</span>
      </div>
      <div class="dev-body">
        <!-- 현재 상태 -->
        <div class="dev-row">
          <span :class="['dev-dot', user ? 'on' : 'off']" />
          <span class="dev-text">{{ currentLabel ?? '비로그인' }}</span>
        </div>

        <!-- 로그아웃 -->
        <button v-if="user" class="dev-btn dev-btn-out" @click="testLogout">로그아웃</button>

        <!-- 계정 목록 -->
        <div class="dev-divider" />
        <div class="dev-section-label">테스트 계정으로 로그인</div>
        <button
          v-for="acc in TEST_ACCOUNTS"
          :key="acc.email"
          class="dev-account"
          :class="{ active: user?.email === acc.email }"
          @click="loginAs(acc.email)"
        >
          <span class="dev-account-icon">{{ acc.icon }}</span>
          <span class="dev-account-label">{{ acc.label }}</span>
          <span v-if="user?.email === acc.email" class="dev-account-check">✓</span>
        </button>

        <!-- 어드민 패널 링크 -->
        <div v-if="isAdmin" class="dev-divider" />
        <NuxtLink v-if="isAdmin" to="/admin" class="dev-admin-link">🔑 어드민 패널 열기</NuxtLink>

        <div v-if="status" class="dev-status">{{ status }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-wrap {
  margin-top: auto;
  width: 100%;
  flex-shrink: 0;
}

.dev-toggle {
  width: 100%;
  height: 40px;
  border: none;
  background: transparent;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.15s;
}

.dev-toggle:hover {
  opacity: 0.8;
}

.dev-panel {
  position: absolute;
  bottom: 0;
  left: 64px;
  width: 210px;
  background: #1a1a2e;
  color: #ddd;
  border-radius: 0 10px 10px 0;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
  z-index: 100;
  font-size: 12px;
  overflow: hidden;
}

.dev-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #16213e;
  font-weight: 600;
  font-size: 12px;
}

.dev-close {
  cursor: pointer;
  opacity: 0.5;
  font-size: 12px;
}

.dev-close:hover {
  opacity: 1;
}

.dev-body {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.dev-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.dev-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dev-dot.on { background: #52b788; }
.dev-dot.off { background: #e07070; }

.dev-text {
  font-size: 11px;
  color: #ccc;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dev-btn {
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 0;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #0f3460;
  color: #eee;
  transition: background 0.15s;
}

.dev-btn:hover { background: #1a5276; }
.dev-btn-out { background: #5c2626; }
.dev-btn-out:hover { background: #7a3333; }

.dev-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 4px 0;
}

.dev-section-label {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 2px 0;
}

.dev-account {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  border: none;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.04);
  color: #bbb;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
}

.dev-account:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.dev-account.active {
  background: rgba(82, 183, 136, 0.15);
  color: #52b788;
}

.dev-account-icon {
  font-size: 13px;
  flex-shrink: 0;
}

.dev-account-label {
  flex: 1;
}

.dev-account-check {
  font-size: 12px;
  color: #52b788;
}

.dev-status {
  font-size: 10px;
  color: #53c28b;
  text-align: center;
  padding: 2px 0;
}

.dev-admin-link {
  display: block;
  text-align: center;
  padding: 6px 8px;
  border-radius: 5px;
  background: rgba(242, 114, 138, 0.15);
  color: #F2728A;
  font-size: 11px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s;
}
.dev-admin-link:hover { background: rgba(242, 114, 138, 0.25); }
</style>
