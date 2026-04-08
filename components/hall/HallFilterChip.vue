<script setup lang="ts">
const props = defineProps<{
  label: string
  options: string[]
  modelValue: string
  icon?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [val: string]
}>()

const open = ref(false)
const btnRef = ref<HTMLElement | null>(null)
const panelTop = ref(0)
const panelLeft = ref(0)

function select(opt: string) {
  emit('update:modelValue', opt)
}

function toggle() {
  if (!open.value) {
    const rect = btnRef.value?.getBoundingClientRect()
    if (rect) {
      panelTop.value = rect.bottom + 6
      panelLeft.value = rect.left
    }
  }
  open.value = !open.value
}

function onOutsideClick(e: MouseEvent) {
  if (btnRef.value && !btnRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onOutsideClick))
onUnmounted(() => document.removeEventListener('mousedown', onOutsideClick))

const isActive = computed(() => props.modelValue !== '전체')
const displayLabel = computed(() =>
  props.modelValue !== '전체' ? props.modelValue : props.label,
)
</script>

<template>
  <div class="chip-wrap">
    <button ref="btnRef" :class="['chip-btn', { active: isActive, open }]" @click="toggle">
      <span v-if="icon" class="chip-icon">{{ icon }}</span>
      <span class="chip-label">{{ displayLabel }}</span>
      <svg class="chip-chevron" :class="{ rotated: open }" width="10" height="6" viewBox="0 0 10 6">
        <path d="M0 0l5 6 5-6z" fill="currentColor" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="chip-panel">
        <div
          v-if="open"
          class="chip-panel"
          :style="{ top: panelTop + 'px', left: panelLeft + 'px' }"
        >
          <div class="chip-options">
            <button
              v-for="opt in options"
              :key="opt"
              :class="['opt-pill', { selected: modelValue === opt }]"
              @click="select(opt)"
            >{{ opt }}</button>
          </div>
          <div class="chip-hint">바깥을 터치하면 자동 저장됩니다</div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.chip-wrap { flex-shrink: 0; }

.chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border: 1.5px solid #e0e0e0;
  border-radius: 99px;
  background: #fff;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #333;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.chip-btn:hover { border-color: #ccc; background: #fafafa; }
.chip-btn.active { border-color: #F2728A; background: #FFF0F3; color: #F2728A; }
.chip-btn.open { border-color: #bbb; }

.chip-icon { font-size: 12px; }
.chip-chevron { flex-shrink: 0; transition: transform 0.2s; opacity: 0.5; }
.chip-chevron.rotated { transform: rotate(180deg); }

.chip-panel {
  position: fixed;
  z-index: 99999;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  padding: 14px 14px 10px;
  min-width: 220px;
}
.chip-options { display: flex; flex-wrap: wrap; gap: 8px; }

.opt-pill {
  padding: 7px 16px;
  border: 1.5px solid #e0e0e0;
  border-radius: 99px;
  background: #fff;
  font-size: 13px;
  font-family: inherit;
  color: #444;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}
.opt-pill:hover { border-color: #ccc; background: #f8f8f8; }
.opt-pill.selected { border-color: #F2728A; background: #F2728A; color: #fff; font-weight: 600; }

.chip-hint {
  font-size: 11px;
  color: #bbb;
  text-align: center;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.chip-panel-enter-active, .chip-panel-leave-active { transition: opacity 0.15s, transform 0.15s; }
.chip-panel-enter-from, .chip-panel-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
