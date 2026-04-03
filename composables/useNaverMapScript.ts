/**
 * 네이버 지도 JS API v3 스크립트 로드 (중복 삽입 방지)
 * @see https://navermaps.github.io/maps.js.ncp/
 */
export function useNaverMapScript() {
  function waitForNaver(): Promise<void> {
    return new Promise((resolve) => {
      const tick = () => {
        const w = window as unknown as { naver?: { maps?: unknown } }
        if (w.naver?.maps) {
          resolve()
          return
        }
        requestAnimationFrame(tick)
      }
      tick()
    })
  }

  async function load(clientId: string, legacyClientId = false): Promise<void> {
    if (import.meta.server) return
    const id = clientId.trim()
    if (!id) throw new Error('Naver Map: empty client id')

    const w = window as unknown as { naver?: { maps?: unknown } }
    if (w.naver?.maps) return

    const existing = document.querySelector<HTMLScriptElement>('script[data-naver-maps="1"]')
    if (existing) {
      await waitForNaver()
      return
    }

    const param = legacyClientId ? 'ncpClientId' : 'ncpKeyId'

    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script')
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?${param}=${encodeURIComponent(id)}`
      s.async = true
      s.dataset.naverMaps = '1'
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('Naver Maps script failed to load'))
      document.head.appendChild(s)
    })
  }

  return { load }
}
