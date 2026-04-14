<script setup lang="ts">
import { isTabKey } from '~/data/wedding'

definePageMeta({ layout: false, ssr: false })

const route = useRoute()

onMounted(async () => {
  const raw = route.query.tab
  const path =
    typeof raw === 'string' && isTabKey(raw) && raw !== 'hall'
      ? `/${raw}`
      : '/'
  await navigateTo(path)
})
</script>

<template>
  <div class="confirm-wrap">로그인 연결 중…</div>
</template>

<style scoped>
.confirm-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9b9b9b;
  font-size: 14px;
}
</style>
