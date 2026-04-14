<script setup lang="ts">
// Supabase OAuth(PKCE) 리다이렉트: ?code= 파라미터 처리
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

onMounted(async () => {
  if (route.query.code) {
    await supabase.auth.getSession()
    await router.replace({ path: '/', query: {} })
  }
})
</script>

<template>
  <HallPage />
</template>
