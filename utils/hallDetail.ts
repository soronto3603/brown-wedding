/** 출처 링크·source_link 에서 도메인 → 뱃지 라벨 */
export const SOURCE_LABEL: Record<string, string> = {
  'iwedding.co.kr': '아이웨딩',
  'directwedding.co.kr': '다이렉트웨딩',
  smartwedding: '스마트웨딩',
  'barrowed.co.kr': 'barrowed',
  'blog.naver.com': '네이버 블로그',
  'tistory.com': 'tistory',
  'weddingbook.com': '웨딩북',
}

const SOURCE_ORDER = Object.keys(SOURCE_LABEL)

/** source_link URL에서 매칭되는 라벨 목록 (중복 없이 순서 고정) */
export function labelsFromSourceLink(sourceLink: string | null | undefined): string[] {
  if (!sourceLink?.trim()) return []
  const out: string[] = []
  for (const key of SOURCE_ORDER) {
    if (sourceLink.includes(key)) out.push(SOURCE_LABEL[key]!)
  }
  return out
}

export function sourceTypeLabel(t: string | null | undefined): string {
  if (!t) return '외부'
  const map: Record<string, string> = {
    naver_blog: '네이버 블로그',
    tistory: 'tistory',
    iwedding: '아이웨딩',
    directwedding: '다이렉트웨딩',
    other: '외부',
  }
  return map[t] ?? t
}

/** 원 → 만원 정수 (표시용) */
export function wonToManwon(won: number | null | undefined): number | null {
  if (won == null || !Number.isFinite(won)) return null
  return Math.round(won / 10000)
}

export function formatManwonRange(
  minWon: number | null | undefined,
  maxWon: number | null | undefined,
): string | null {
  const a = wonToManwon(minWon ?? undefined)
  const b = wonToManwon(maxWon ?? undefined)
  if (a != null && b != null) return `${a}~${b} 만원`
  if (a != null) return `${a} 만원~`
  if (b != null) return `~${b} 만원`
  return null
}

export function displayUrlHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url.slice(0, 40)
  }
}

/** source_link 문자열의 첫 번째 URL에서 짧은 식별자 추출 (naver 블로그 ID, 도메인 첫 세그먼트 등) */
export function extractSourceLabel(sourceLink: string | null | undefined): string {
  if (!sourceLink?.trim()) return ''
  const firstUrl = sourceLink.split(/[\n\r\s]+/).find((s) => s.startsWith('http'))
  if (!firstUrl) return ''
  try {
    const url = new URL(firstUrl)
    if (url.hostname.includes('blog.naver.com')) {
      return url.pathname.split('/').filter(Boolean)[0] ?? 'naver'
    }
    return url.hostname.replace(/^www\./, '').split('.')[0] ?? ''
  } catch {
    return ''
  }
}

/** "label +N" 형태 배지 문자열 */
export function sourceBadgeText(
  sourceLink: string | null | undefined,
  totalSourceCount: number,
): string {
  const label = extractSourceLabel(sourceLink)
  if (!label) return totalSourceCount > 0 ? `출처 +${totalSourceCount}` : ''
  return totalSourceCount > 1 ? `${label} +${totalSourceCount}` : label
}
