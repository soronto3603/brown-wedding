<!--
  범용 바텀시트 컴포넌트

  사용법:
    <BottomSheet>
      <template #default="{ id, props, close }">
        <div v-if="id === 'my-sheet'">
          {{ props.someData }}
          <button @click="close">닫기</button>
        </div>
      </template>
    </BottomSheet>

  바텀시트는 useBottomSheet() composable로 열고 닫습니다.
  모바일(≤768px)에서만 표시되며, 슬라이드 업/다운 트랜지션이 적용됩니다.
-->
<script setup lang="ts">
const { isOpen, sheetId, sheetProps, close } = useBottomSheet()

const isMobile = ref(false)
function check() { isMobile.value = import.meta.client && window.innerWidth <= 768 }
onMounted(() => { check(); window.addEventListener('resize', check) })
onUnmounted(() => { if (import.meta.client) window.removeEventListener('resize', check) })

// PC에서 열리면 자동 닫기
watch(isMobile, (m) => { if (!m && isOpen.value) close() })
</script>

<template>
  <Teleport to="body">
    <Transition name="bsheet">
      <div
        v-if="isOpen && isMobile"
        class="bsheet-backdrop"
        @click.self="close"
      >
        <div class="bsheet-panel">
          <div class="bsheet-handle" />
          <slot
            :id="sheetId"
            :props="sheetProps"
            :close="close"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.bsheet-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(0,0,0,0.35);
  display: flex; align-items: flex-end; justify-content: center;
}
.bsheet-panel {
  width: 100%; max-width: 500px;
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px));
  max-height: 85vh; overflow-y: auto;
}
.bsheet-handle {
  width: 36px; height: 4px; border-radius: 2px;
  background: #ddd; margin: 0 auto 14px;
}

/* 트랜지션 */
.bsheet-enter-active { transition: opacity 0.25s ease; }
.bsheet-enter-active .bsheet-panel { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.bsheet-leave-active { transition: opacity 0.2s ease; }
.bsheet-leave-active .bsheet-panel { transition: transform 0.2s ease-in; }
.bsheet-enter-from { opacity: 0; }
.bsheet-enter-from .bsheet-panel { transform: translateY(100%); }
.bsheet-leave-to { opacity: 0; }
.bsheet-leave-to .bsheet-panel { transform: translateY(100%); }
</style>
