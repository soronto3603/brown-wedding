# 딸깍웨딩 (brown-wedding) 프로젝트

## 기술 스택
- **프레임워크**: Nuxt 3 (Vue 3) + TypeScript
- **백엔드**: Supabase (PostgreSQL + Auth + RLS)
- **인증**: 카카오 OAuth (@nuxtjs/supabase)
- **스타일**: 바닐라 CSS + CSS 변수 (`--w-*`), Tailwind 미사용
- **폰트**: Pretendard

## 프로젝트 구조
```
pages/index.vue          # SPA 메인 — 탭 기반 (hash 라우팅: /#hall, /#budget 등)
components/
  layout/
    SideBtn.vue          # 데스크톱 사이드바 버튼
    BottomSheet.vue      # 범용 바텀시트 컴포넌트
  hall/                  # 홀지도 탭
  lounge/                # 대기실 탭
  budget/                # 우리예산 탭
    BudgetPage.vue       # 예산 에디터 + PDF
    BudgetReportView.vue # A4 리포트 뷰 (print용)
  dict/                  # 용어사전 탭
  music/                 # 선곡기 탭
  profile/               # 프로필 탭
  auth/LoginModal.vue    # 로그인 모달
  dev/DevPanel.vue       # 개발용 테스트 로그인 패널
composables/
  useBottomSheet.ts      # 바텀시트 전역 상태 store
  useBudget.ts           # 예산 CRUD + computed
  useProfile.ts          # 프로필 (자동생성 포함)
  useThemeColors.ts      # 브랜드 색상 상수
  useAuthModal.ts        # 인증 모달 상태
assets/css/main.css      # 글로벌 CSS 변수 + 유틸리티
```

## 핵심 패턴

### 바텀시트 (useBottomSheet + BottomSheet.vue)
모바일 전용 바텀시트를 전역 store로 관리. 어디서든 `useBottomSheet()`로 열고 닫을 수 있음.

```ts
// 열기
const sheet = useBottomSheet()
sheet.open('my-sheet-id', { someData: 123 })

// 닫기
sheet.close()
```

BottomSheet.vue는 slot 기반이라 내부 콘텐츠를 자유롭게 구성 가능:
```vue
<LayoutBottomSheet>
  <template #default="{ id, props, close }">
    <div v-if="id === 'my-sheet-id'">
      {{ props.someData }}
      <button @click="close">닫기</button>
    </div>
  </template>
</LayoutBottomSheet>
```

- 모바일(≤768px)에서만 표시, PC에서는 자동으로 닫힘
- Teleport to body + slide-up/down 트랜지션
- 배경 클릭으로 닫기 가능

### 반응형 전략
- **≤768px**: 모바일 — 하단 탭 네비게이션, 바텀시트 폼
- **769~1023px**: 태블릿 — 사이드바 + 싱글 컬럼
- **≥1024px**: 데스크톱 — 사이드바 + 2칸 레이아웃 (예산 페이지)

### CSS 변수 네이밍
모든 CSS 변수는 `--w-` 접두사 사용 (이전 `--weddic-`에서 변경됨):
- `--w-primary`, `--w-primary-lt`, `--w-primary-mid`
- `--w-text`, `--w-text-secondary`, `--w-muted`
- `--w-border`, `--w-bg`, `--w-bg-section`
- `--w-card-shadow`, `--w-card-radius`

### Auth & Profile 자동생성
카카오 OAuth 로그인 시 DB trigger가 불안정하므로, `useProfile.ts`의 `fetchProfile()`에서 profile이 없으면 자동 생성함.
user_metadata에서 닉네임/아바타를 추출하여 bw_profiles에 upsert.

### Supabase 테이블 구조
- `bw_profiles` — 사용자 프로필 (id = auth.users.id)
- `bw_couples` — 커플 (user_a, user_b)
- `bw_budget_plans` — 예산 계획 (couple_id, total)
- `bw_budget_items` — 예산 항목 (plan_id, category, name, amount, deposit, balance, pay_method, payer, status)
- `bw_halls` — 웨딩홀 데이터

### 탭 라우팅
SPA 방식으로 hash 라우팅 사용: `/#hall`, `/#budget`, `/#profile` 등.
`pages/index.vue`에서 `window.location.hash`를 읽어 탭 전환.
새로고침/뒤로가기 시 현재 탭 유지됨.

## 브랜드
- 앱 이름: **딸깍웨딩**
- 프로젝트 코드명: brown-wedding
- "WEDDiC" / "weddic" 텍스트는 전부 제거됨
- 아이콘 파일: `/public/app-icon.svg`
