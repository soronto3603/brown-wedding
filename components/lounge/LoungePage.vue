<script setup lang="ts">
import { HALLS, INITIAL_POSTS } from '~/data/wedding'
import type { Post } from '~/data/wedding'

const { PRIMARY, PRIMARY_LT, GOLD, GOLD_LT, TEXT, MUTED, BORDER } = useThemeColors()

const posts = ref<Post[]>([...INITIAL_POSTS])
const body = ref('')
const hallTag = ref('')
const liked = ref<Record<number, boolean>>({})
const filter = ref('최신순')

function submit() {
  if (!body.value.trim()) return
  posts.value = [
    {
      id: Date.now(),
      nick: '나',
      time: '방금',
      hall: hallTag.value || null,
      body: body.value,
      likes: 0,
      comments: 0,
    },
    ...posts.value,
  ]
  body.value = ''
  hallTag.value = ''
}

function toggleLike(id: number) {
  liked.value = { ...liked.value, [id]: !liked.value[id] }
}
</script>

<template>
  <div :style="{ background: '#FAFAFA', height: '100%', overflowY: 'auto' }">
    <div :style="{ maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }">
      <div :style="{ display: 'flex', gap: '6px', marginBottom: '14px' }">
        <button
          v-for="f in ['최신순', '관심홀', '나의홀']"
          :key="f"
          type="button"
          :style="{
            fontFamily: 'inherit',
            fontSize: '13px',
            fontWeight: filter === f ? 600 : 400,
            padding: '6px 16px',
            borderRadius: '99px',
            border: `1px solid ${filter === f ? PRIMARY : BORDER}`,
            background: filter === f ? PRIMARY : '#fff',
            color: filter === f ? '#fff' : MUTED,
            cursor: 'pointer',
          }"
          @click="filter = f"
        >
          {{ f }}
        </button>
      </div>

      <div
        :style="{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '14px',
        }"
      >
        <textarea
          v-model="body"
          placeholder="웨딩홀 후기나 결혼 준비 고민을 공유해보세요 :)"
          :style="{
            width: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: TEXT,
            lineHeight: 1.65,
            minHeight: '70px',
            background: 'transparent',
            boxSizing: 'border-box',
          }"
        />
        <div
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '10px',
            borderTop: `1px solid ${BORDER}`,
            marginTop: '4px',
          }"
        >
          <select
            v-model="hallTag"
            :style="{
              fontFamily: 'inherit',
              fontSize: '12px',
              padding: '4px 10px',
              border: `1px solid ${BORDER}`,
              borderRadius: '99px',
              color: MUTED,
              background: 'transparent',
              cursor: 'pointer',
              outline: 'none',
            }"
          >
            <option value="">홀 태그</option>
            <option v-for="h in HALLS" :key="h.id" :value="h.name">{{ h.name }}</option>
          </select>
          <button
            type="button"
            :style="{
              fontFamily: 'inherit',
              fontSize: '13px',
              fontWeight: 600,
              padding: '7px 20px',
              background: PRIMARY,
              color: '#fff',
              border: 'none',
              borderRadius: '99px',
              cursor: 'pointer',
            }"
            @click="submit"
          >
            게시
          </button>
        </div>
      </div>

      <div
        v-for="p in posts"
        :key="p.id"
        :style="{
          background: '#fff',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '10px',
        }"
      >
        <div :style="{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }">
          <div
            :style="{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: PRIMARY_LT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: PRIMARY,
              flexShrink: 0,
            }"
          >
            {{ p.nick.slice(0, 2) }}
          </div>
          <div :style="{ flex: 1 }">
            <div :style="{ fontSize: '13px', fontWeight: 600, color: TEXT }">{{ p.nick }}</div>
            <div :style="{ fontSize: '11px', color: MUTED }">{{ p.time }}</div>
          </div>
          <span
            v-if="p.hall"
            :style="{
              fontSize: '11px',
              padding: '3px 10px',
              borderRadius: '99px',
              background: GOLD_LT,
              color: GOLD,
              fontWeight: 500,
            }"
          >
            {{ p.hall }}
          </span>
        </div>
        <p :style="{ fontSize: '14px', lineHeight: 1.7, color: '#444', marginBottom: '10px' }">
          {{ p.body }}
        </p>
        <div :style="{ display: 'flex', gap: '14px' }">
          <span
            :style="{
              fontSize: '13px',
              color: liked[p.id] ? '#E05B5B' : MUTED,
              cursor: 'pointer',
            }"
            @click="toggleLike(p.id)"
          >
            {{ liked[p.id] ? '♥' : '♡' }} {{ p.likes + (liked[p.id] ? 1 : 0) }}
          </span>
          <span :style="{ fontSize: '13px', color: MUTED, cursor: 'pointer' }">💬 {{ p.comments }}</span>
          <span :style="{ fontSize: '13px', color: MUTED, cursor: 'pointer' }">공유</span>
        </div>
      </div>
    </div>
  </div>
</template>
