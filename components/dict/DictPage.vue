<script setup lang="ts">
const { PRIMARY_LT, TEXT, MUTED, BORDER } = useThemeColors()
const { entries, loading, fetchGlossary, categories, search } = useGlossary()

const q = ref('')
const cat = ref('전체')
const open = ref<number | null>(null)

onMounted(() => fetchGlossary())

const filtered = computed(() => search(q.value, cat.value))
</script>

<template>
  <div class="page-wrap">
    <div class="page-inner">
      <div
        :style="{
          display: 'flex',
          border: `1px solid ${BORDER}`,
          borderRadius: '99px',
          background: '#fff',
          overflow: 'hidden',
          marginBottom: '12px',
          boxShadow: 'var(--w-card-shadow)',
        }"
      >
        <input
          v-model="q"
          placeholder="용어를 검색하세요"
          :style="{
            flex: 1,
            border: 'none',
            outline: 'none',
            padding: '10px 16px',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: TEXT,
            background: 'transparent',
          }"
        />
        <button type="button" class="btn-primary" :style="{ borderRadius: 0 }">검색</button>
      </div>
      <div :style="{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }">
        <button
          v-for="c in categories"
          :key="c"
          type="button"
          :class="['pill', { active: cat === c }]"
          :style="{ fontSize: '12px', padding: '5px 14px' }"
          @click="cat = c"
        >
          {{ c }}
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
          검색 결과가 없어요
        </div>
        <div
          v-for="(d, i) in filtered"
          :key="d.id"
          :style="{
            padding: '13px 14px',
            borderBottom: i < filtered.length - 1 ? `1px solid ${BORDER}` : 'none',
            cursor: 'pointer',
            background: open === i ? PRIMARY_LT : '#fff',
            transition: 'background 0.15s ease',
          }"
          @click="open = open === i ? null : i"
        >
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: open === i ? '6px' : '3px',
            }"
          >
            <span :style="{ fontSize: '14px', fontWeight: 600, color: TEXT }">{{ d.term }}</span>
            <span class="badge badge-gold">{{ d.category }}</span>
          </div>
          <div
            :style="{
              fontSize: '13px',
              color: MUTED,
              lineHeight: 1.65,
              overflow: open === i ? 'visible' : 'hidden',
              textOverflow: open === i ? 'unset' : 'ellipsis',
              whiteSpace: open === i ? 'normal' : 'nowrap',
            }"
          >
            {{ d.description }}
          </div>
        </div>
      </div>

      <p v-if="!loading" :style="{ fontSize: '11px', color: MUTED, textAlign: 'center', marginTop: '12px' }">
        총 {{ filtered.length }}개 용어
      </p>
    </div>
  </div>
</template>
