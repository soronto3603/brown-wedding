<script setup lang="ts">
const { PRIMARY, PRIMARY_LT, GOLD, TEXT, MUTED, BORDER } = useThemeColors()
const {
  profile, loading, updateProfile, logout,
  weddingDate, dDayLabel, setWeddingDate,
} = useProfile()
const { bookmarkedIds } = useBookmark()
const session = useSupabaseSession()
const supabase = useSupabaseClient()

const editMode = ref(false)
const editNickname = ref('')
const saving = ref(false)

const editingDate = ref(false)
const dateInput = ref('')

// 나의 활동 카운트
const myPostCount = ref(0)
const myFavSongCount = ref(0)

function startEdit() {
  editNickname.value = profile.value?.nickname ?? ''
  editMode.value = true
}

async function saveNickname() {
  if (!editNickname.value.trim()) return
  saving.value = true
  const ok = await updateProfile({ nickname: editNickname.value.trim() })
  if (ok) editMode.value = false
  saving.value = false
}

function cancelEdit() {
  editMode.value = false
}

function startEditDate() {
  dateInput.value = weddingDate.value ?? ''
  editingDate.value = true
}

async function saveDate() {
  await setWeddingDate(dateInput.value || null)
  editingDate.value = false
}

async function fetchActivityCounts() {
  if (!session.value?.user) return
  const uid = session.value.user.id

  const [{ count: postCount }, { count: songCount }] = await Promise.all([
    supabase.from('bw_posts').select('*', { count: 'exact', head: true }).eq('author_id', uid),
    supabase.from('bw_song_favorites').select('*', { count: 'exact', head: true }).eq('user_id', uid),
  ])

  myPostCount.value = postCount ?? 0
  myFavSongCount.value = songCount ?? 0
}

watch(() => profile.value?.id, (id) => {
  if (id) fetchActivityCounts()
}, { immediate: true })

const userEmail = computed(() => session.value?.user?.email ?? session.value?.user?.phone ?? '')
const initials = computed(() => (profile.value?.nickname ?? '?').slice(0, 2))
</script>

<template>
  <div class="page-wrap">
    <div class="page-inner">
      <div v-if="loading && !profile" :style="{ textAlign: 'center', padding: '60px 0', color: MUTED }">
        불러오는 중...
      </div>

      <template v-else-if="profile">
        <!-- 프로필 카드 -->
        <div class="card" :style="{ padding: '24px', marginBottom: '14px', textAlign: 'center' }">
          <div
            :style="{
              width: '72px', height: '72px', borderRadius: '50%',
              background: PRIMARY_LT, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '24px', fontWeight: 700,
              color: PRIMARY, margin: '0 auto 12px', overflow: 'hidden',
            }"
          >
            <img v-if="profile.avatar_url" :src="profile.avatar_url" :style="{ width: '100%', height: '100%', objectFit: 'cover' }" alt="avatar" />
            <span v-else>{{ initials }}</span>
          </div>

          <template v-if="!editMode">
            <div :style="{ fontSize: '18px', fontWeight: 700, color: TEXT, marginBottom: '4px' }">
              {{ profile.nickname }}
            </div>
            <div :style="{ fontSize: '13px', color: MUTED, marginBottom: '14px' }">
              {{ userEmail }}
            </div>
            <button class="btn-outline" @click="startEdit">프로필 수정</button>
          </template>

          <template v-else>
            <div :style="{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }">
              <input
                v-model="editNickname"
                placeholder="닉네임 입력"
                :style="{
                  fontFamily: 'inherit', fontSize: '16px', fontWeight: 600, textAlign: 'center',
                  border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '8px 12px',
                  outline: 'none', width: '180px', color: TEXT,
                }"
                @keydown.enter="saveNickname"
              />
            </div>
            <div :style="{ display: 'flex', gap: '8px', justifyContent: 'center' }">
              <button class="btn-primary" :disabled="saving" @click="saveNickname">
                {{ saving ? '저장 중...' : '저장' }}
              </button>
              <button class="btn-outline" @click="cancelEdit">취소</button>
            </div>
          </template>
        </div>

        <!-- 웨딩 정보 -->
        <div class="card" :style="{ overflow: 'hidden', marginBottom: '14px' }">
          <div :style="{ padding: '14px', fontWeight: 600, fontSize: '14px', color: TEXT, borderBottom: `1px solid ${BORDER}` }">
            웨딩 정보
          </div>
          <div class="profile-menu-item">
            <span>결혼 예정일</span>
            <template v-if="!editingDate">
              <div :style="{ display: 'flex', alignItems: 'center', gap: '8px' }">
                <span v-if="dDayLabel" :style="{ fontSize: '13px', fontWeight: 600, color: PRIMARY }">{{ dDayLabel }}</span>
                <span
                  :style="{ fontSize: '13px', color: weddingDate ? TEXT : MUTED, cursor: 'pointer' }"
                  @click="startEditDate"
                >
                  {{ weddingDate ?? '설정하기' }}
                </span>
              </div>
            </template>
            <template v-else>
              <div :style="{ display: 'flex', gap: '6px', alignItems: 'center' }">
                <input
                  v-model="dateInput"
                  type="date"
                  :style="{
                    fontFamily: 'inherit', fontSize: '13px', padding: '4px 8px',
                    border: `1px solid ${BORDER}`, borderRadius: '6px', outline: 'none', color: TEXT,
                  }"
                />
                <button class="btn-primary" :style="{ padding: '4px 10px', fontSize: '11px' }" @click="saveDate">확인</button>
                <span :style="{ fontSize: '13px', color: MUTED, cursor: 'pointer' }" @click="editingDate = false">취소</span>
              </div>
            </template>
          </div>
        </div>

        <!-- 나의 활동 -->
        <div class="card" :style="{ overflow: 'hidden', marginBottom: '14px' }">
          <div :style="{ padding: '14px', fontWeight: 600, fontSize: '14px', color: TEXT, borderBottom: `1px solid ${BORDER}` }">
            나의 활동
          </div>
          <div class="profile-menu-item">
            <span>내가 쓴 글</span>
            <span :style="{ color: MUTED, fontSize: '13px' }">{{ myPostCount }}개</span>
          </div>
          <div class="profile-menu-item">
            <span>관심 웨딩홀</span>
            <span :style="{ color: MUTED, fontSize: '13px' }">{{ bookmarkedIds.size }}개</span>
          </div>
          <div class="profile-menu-item" :style="{ borderBottom: 'none' }">
            <span>저장한 곡</span>
            <span :style="{ color: MUTED, fontSize: '13px' }">{{ myFavSongCount }}개</span>
          </div>
        </div>

        <!-- 설정 -->
        <div class="card" :style="{ overflow: 'hidden', marginBottom: '14px' }">
          <div :style="{ padding: '14px', fontWeight: 600, fontSize: '14px', color: TEXT, borderBottom: `1px solid ${BORDER}` }">
            설정
          </div>
          <div class="profile-menu-item" :style="{ cursor: 'pointer' }" @click="logout()">
            <span :style="{ color: '#E05B5B' }">로그아웃</span>
          </div>
        </div>

        <p :style="{ fontSize: '11px', color: MUTED, textAlign: 'center', marginTop: '16px' }">
          가입일: {{ new Date(profile.created_at).toLocaleDateString('ko-KR') }}
        </p>
      </template>

      <div v-else :style="{ textAlign: 'center', padding: '60px 0', color: MUTED, fontSize: '14px' }">
        로그인이 필요해요
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn-outline {
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  padding: 7px 20px;
  background: transparent;
  color: var(--w-text-secondary);
  border: 1px solid var(--w-border);
  border-radius: 99px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-outline:hover {
  border-color: var(--w-primary);
  color: var(--w-primary);
}

.profile-menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px 14px;
  font-size: 14px;
  color: var(--w-text);
  border-bottom: 1px solid var(--w-border);
}
</style>
