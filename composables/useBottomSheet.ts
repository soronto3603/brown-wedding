/**
 * 바텀시트 전역 상태 관리
 *
 * 사용법:
 *   const { open, close, isOpen, sheetId, sheetProps } = useBottomSheet()
 *   open('budget-add', { category: '웨딩홀' })
 *   close()
 *
 * 템플릿에서:
 *   <BottomSheet>
 *     <template #default="{ props }">
 *       <!-- sheetId에 따라 분기하여 slot 내용 렌더링 -->
 *     </template>
 *   </BottomSheet>
 */
const _sheetId = ref<string | null>(null)
const _sheetProps = ref<Record<string, any>>({})

export function useBottomSheet() {
  const isOpen = computed(() => _sheetId.value !== null)
  const sheetId = computed(() => _sheetId.value)
  const sheetProps = computed(() => _sheetProps.value)

  function open(id: string, props: Record<string, any> = {}) {
    _sheetId.value = id
    _sheetProps.value = props
  }

  function close() {
    _sheetId.value = null
    _sheetProps.value = {}
  }

  return { isOpen, sheetId, sheetProps, open, close }
}
