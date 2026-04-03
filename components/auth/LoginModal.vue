<script setup lang="ts">
import { isTabKey } from "~/data/wedding";

const { isOpen, closeAuthModal, clearPendingTab, pendingTabAfterLogin } =
  useAuthModal();
const supabase = useSupabaseClient();
const session = useSupabaseSession();
const router = useRouter();

const loading = ref(false);
const errorMsg = ref("");

const features = [
  {
    icon: "🗺",
    title: "홀지도",
    desc: "웨딩홀 검색·비교를 한눈에",
  },
  {
    icon: "👥",
    title: "예비부부 대기실",
    desc: "실제 정보를 나누는 커뮤니티",
  },
  {
    icon: "💰",
    title: "우리 예산",
    desc: "파트너와 실시간 지출 관리",
  },
  {
    icon: "📖",
    title: "용어 사전",
    desc: "웨딩 용어 백과",
  },
  {
    icon: "🎵",
    title: "노래 선곡기",
    desc: "식순별 BGM 리스트 저장",
  },
] as const;

watch(isOpen, (open) => {
  if (!import.meta.client) return;
  document.body.style.overflow = open ? "hidden" : "";
});

watch(session, (s) => {
  if (s) {
    errorMsg.value = "";
    closeAuthModal();
  }
});

function onLater() {
  errorMsg.value = "";
  clearPendingTab();
  closeAuthModal();
}

/**
 * Supabase/Kakao OAuth는 redirectTo에 절대 URL이 필요합니다.
 * 경로는 앱 내부 라우트(`/confirm`)만 쓰고, 호스트는 `window.location.origin`으로 맞춥니다.
 */
function oauthRedirectUrl(): string {
  const next = pendingTabAfterLogin.value;
  const query: Record<string, string> = {};
  if (next != null && isTabKey(next)) {
    query.tab = next;
  }
  const resolved = router.resolve({ path: "/confirm", query });
  return new URL(resolved.fullPath, window.location.origin).href;
}

async function onKakao() {
  if (!import.meta.client) return;
  errorMsg.value = "";
  loading.value = true;
  try {
    const redirectTo = oauthRedirectUrl();
    /** 카카오 개발자 콘솔 동의 항목과 동일: 닉네임·프로필 사진만 (공백 구분) */
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo,
        scopes: "profile_nickname profile_image",
      },
    });
    if (error) {
      errorMsg.value = error.message;
    }
  } catch (e: unknown) {
    errorMsg.value =
      e instanceof Error ? e.message : "로그인 요청에 실패했어요.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="auth-pop">
      <div
        v-if="isOpen"
        class="auth-login-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-login-title"
        @keydown.escape="onLater"
      >
        <div class="auth-login-backdrop" @click.self="onLater" />

        <div class="auth-login-sheet">
          <button
            type="button"
            class="auth-login-close"
            aria-label="닫기"
            @click="onLater"
          >
            ×
          </button>

          <div class="auth-login-brand">
            <img
              class="auth-login-logo"
              src="/weddic-icon.svg"
              width="48"
              height="48"
              alt=""
              aria-hidden="true"
            />
            <h2 id="auth-login-title" class="auth-login-title">
              결혼 준비, 웨딩 백과사전 WEDDiC 🕊️
            </h2>
            <p class="auth-login-lead">
              웨딩 용어부터 예산·홀·BGM까지, 결혼 준비에 필요한 정보를 한곳에서
              모았어요.
            </p>
            <p class="auth-login-safe">
              소셜 로그인이므로 관심 정보를 안전하게 보관해요
            </p>
          </div>

          <div class="auth-login-actions">
            <button
              type="button"
              class="auth-login-kakao"
              :disabled="loading"
              @click="onKakao"
            >
              <span class="auth-login-kakao-ico" aria-hidden="true">💬</span>
              {{ loading ? "연결 중…" : "카카오로 3초 만에 연결하기" }}
            </button>
            <button type="button" class="auth-login-later" @click="onLater">
              나중에 하기
            </button>
            <p v-if="errorMsg" class="auth-login-error">{{ errorMsg }}</p>
          </div>

          <div class="auth-login-features">
            <div class="auth-login-features-head">
              웨딕의 핵심 기능
              <span class="auth-login-features-sub">모든 기능이 무료예요</span>
            </div>
            <ul class="auth-login-feature-list">
              <li
                v-for="(f, i) in features"
                :key="i"
                class="auth-login-feature"
              >
                <span class="auth-login-feature-ico">{{ f.icon }}</span>
                <div>
                  <div class="auth-login-feature-title">{{ f.title }}</div>
                  <div class="auth-login-feature-desc">{{ f.desc }}</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.auth-login-overlay {
  position: fixed;
  inset: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  pointer-events: auto;
}

.auth-login-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(42, 21, 32, 0.42);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.auth-login-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 400px;
  max-height: min(92vh, 720px);
  overflow: auto;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 24px 80px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(15, 23, 42, 0.06);
  padding: 28px 22px 20px;
}

.auth-login-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  border-radius: 8px;
}

.auth-login-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.auth-login-brand {
  text-align: center;
  padding: 8px 8px 4px;
}

.auth-login-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 12px;
  display: block;
  object-fit: cover;
}

.auth-login-title {
  font-size: 17px;
  font-weight: 700;
  color: #2a1520;
  line-height: 1.45;
  margin-bottom: 10px;
}

.auth-login-lead {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.55;
  margin-bottom: 10px;
}

.auth-login-safe {
  font-size: 12px;
  color: #e85c78;
  font-weight: 500;
}

.auth-login-actions {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-login-kakao {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  background: #fee500;
  color: #191919;
  transition: filter 0.15s ease;
}

.auth-login-kakao:hover:not(:disabled) {
  filter: brightness(0.97);
}

.auth-login-kakao:disabled {
  opacity: 0.7;
  cursor: wait;
}

.auth-login-kakao-ico {
  font-size: 18px;
}

.auth-login-later {
  border: none;
  background: none;
  color: #9ca3af;
  font-size: 13px;
  cursor: pointer;
  padding: 4px;
}

.auth-login-later:hover {
  color: #6b7280;
}

.auth-login-error {
  font-size: 12px;
  color: #dc2626;
  text-align: center;
}

.auth-login-features {
  margin-top: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  background: #fafafa;
}

.auth-login-features-head {
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #f2728a, #c9325a);
  text-align: center;
}

.auth-login-features-sub {
  font-weight: 600;
  opacity: 0.95;
}

.auth-login-feature-list {
  list-style: none;
  padding: 10px 12px 12px;
}

.auth-login-feature {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.auth-login-feature:last-child {
  border-bottom: none;
}

.auth-login-feature-ico {
  flex-shrink: 0;
  font-size: 20px;
  line-height: 1.2;
}

.auth-login-feature-title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2937;
}

.auth-login-feature-desc {
  font-size: 11px;
  color: #6b7280;
  margin-top: 2px;
  line-height: 1.4;
}

.auth-pop-enter-active,
.auth-pop-leave-active {
  transition: opacity 0.2s ease;
}

.auth-pop-enter-active .auth-login-sheet,
.auth-pop-leave-active .auth-login-sheet {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.auth-pop-enter-from,
.auth-pop-leave-to {
  opacity: 0;
}

.auth-pop-enter-from .auth-login-sheet,
.auth-pop-leave-to .auth-login-sheet {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>
