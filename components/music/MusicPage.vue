<script setup lang="ts">
const { PRIMARY_LT, TEXT, MUTED, BORDER } = useThemeColors()
const user = useSupabaseUser()
const { openAuthModal } = useAuthModal()

const {
  loading, favoriteIds,
  fetchSongs, filterSongs, toggleFavorite,
  SCENES, MOODS, GENRES,
} = useMusic()

const { songs } = useMusic()

const sceneIdx = ref(0)
const mood = ref('전체')
const genre = ref('전체')
const hovered = ref<number | null>(null)
const showFavorites = ref(false)

onMounted(() => fetchSongs())

const currentScene = computed(() => SCENES[sceneIdx.value])
const filtered = computed(() => {
  if (showFavorites.value) {
    return songs.value.filter((s) => favoriteIds.value.has(s.id))
  }
  return filterSongs(currentScene.value, mood.value, genre.value)
})

const GENRE_ICONS: Record<string, string> = {
  '클래식': '🎶', 'K-발라드': '🎸', '팝': '🎵', 'K-POP': '🎤',
}
</script>

<template>
  <div class="page-wrap">
    <div class="page-inner">
      <!-- 장면 탭 -->
      <div class="tab-bar">
        <div
          v-for="(s, i) in SCENES"
          :key="s"
          :class="['tab-item', { active: !showFavorites && sceneIdx === i }]"
          @click="showFavorites = false; sceneIdx = i"
        >
          {{ s }}
        </div>
        <div
          :class="['tab-item', { active: showFavorites }]"
          :style="{ color: showFavorites ? '#E05B5B' : undefined }"
          @click="showFavorites = true"
        >
          ♥ 내 리스트
        </div>
      </div>

      <!-- 무드/장르 필터 -->
      <div v-if="!showFavorites" :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }">
        <button
          v-for="m in MOODS"
          :key="m"
          type="button"
          :class="['pill', { active: mood === m }]"
          :style="{ fontSize: '12px', padding: '5px 14px' }"
          @click="mood = m"
        >
          {{ m }}
        </button>
      </div>
      <div v-if="!showFavorites" :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }">
        <button
          v-for="g in GENRES"
          :key="g"
          type="button"
          :class="['pill', { active: genre === g }]"
          :style="{ fontSize: '12px', padding: '5px 14px' }"
          @click="genre = g"
        >
          {{ g }}
        </button>
      </div>

      <div v-if="loading" :style="{ textAlign: 'center', padding: '40px 0', color: MUTED }">
        불러오는 중...
      </div>

      <div v-else class="card" :style="{ overflow: 'hidden' }">
        <div
          v-if="filtered.length === 0"
          :style="{ padding: '32px', textAlign: 'center', color: MUTED, fontSize: '14px' }"
        >
          {{ showFavorites ? '저장한 곡이 없어요. ♡를 눌러 추가해보세요!' : '이 조건의 곡이 없어요' }}
        </div>
        <div
          v-for="(item, i) in filtered"
          :key="item.id"
          :style="{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '11px 14px',
            borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
            cursor: 'pointer',
            background: hovered === i ? PRIMARY_LT : '#fff',
            transition: 'background 0.15s ease',
          }"
          @mouseenter="hovered = i"
          @mouseleave="hovered = null"
        >
          <span :style="{ fontSize: '11px', color: MUTED, width: '18px', textAlign: 'center', flexShrink: 0 }">
            {{ i + 1 }}
          </span>
          <div
            :style="{
              width: '42px', height: '42px', borderRadius: '8px', flexShrink: 0,
              background: '#F2F3F5', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '20px',
            }"
          >
            {{ GENRE_ICONS[item.genre] ?? '🎵' }}
          </div>
          <div :style="{ flex: 1, minWidth: 0 }">
            <div :style="{ fontSize: '14px', fontWeight: 600, color: TEXT, marginBottom: '2px' }">
              {{ item.title }}
            </div>
            <div :style="{ fontSize: '12px', color: MUTED }">{{ item.artist }}</div>
          </div>
          <span
            :style="{
              fontSize: '16px', cursor: 'pointer', flexShrink: 0,
              color: favoriteIds.has(item.id) ? '#E05B5B' : MUTED,
              transition: 'color 0.15s',
            }"
            @click.stop="user ? toggleFavorite(item.id) : openAuthModal()"
          >
            {{ favoriteIds.has(item.id) ? '♥' : '♡' }}
          </span>
          <span class="badge badge-gold" :style="{ padding: '3px 9px' }">{{ item.genre }}</span>
        </div>
      </div>

      <p v-if="!loading" :style="{ fontSize: '11px', color: MUTED, textAlign: 'center', marginTop: '12px' }">
        {{ filtered.length }}곡
      </p>
    </div>
  </div>
</template>
