# Brown Wedding — Admin Panel 개발 계획 v1.0

## 개요
웨딩 플래닝 서비스 WEDDiC의 관리자 전용 어드민 패널.
`/admin` 경로에서 `role = 'admin'` 유저만 접근 가능.

---

## Phase 1 — 기반 + 핵심 기능 (완료)

### A-1. 어드민 레이아웃 + 라우팅
- [x] `middleware/admin.ts` — 미들웨어 기반 role 검증
- [x] `pages/admin.vue` — 어드민 레이아웃 (사이드바 + `<NuxtPage />`)
- [x] DB 마이그레이션: `bw_profiles` 에 `is_blocked`, `blocked_at`, `blocked_reason`, `admin_memo` 컬럼 추가
- [x] DB 마이그레이션: `bw_banners`, `bw_banner_clicks`, `bw_settings` 테이블 생성 + RLS
- [x] `admin@brownwedding.dev` role을 `admin`으로 설정

### A-2. 대시보드 (`/admin`)
- [x] 통계 카드: 전체 홀 / 활성 홀 / 가입 유저 / 게시글 / 선곡 / 용어사전
- [x] 최근 게시글 5건
- [x] 최근 가입 유저 5명

### A-3. 홀 관리 (`/admin/halls`)
- [x] 목록 조회 + 페이지네이션 (30개씩)
- [x] 이름 검색 + status 필터
- [x] status / is_verified 편집 모달

### A-4. 게시글 관리 (`/admin/posts`)
- [x] 전체 게시글 목록 (삭제된 것 포함)
- [x] 소프트 삭제 / 복구

### A-5. 용어사전 관리 (`/admin/glossary`)
- [x] 카테고리별 그룹화 목록
- [x] 추가 / 편집 / 삭제

### A-6. 선곡기 관리 (`/admin/songs`)
- [x] 구분별(입장곡/축가/피로연) 그룹화 목록
- [x] 추가 / 편집 / 삭제

### A-7. 유저 관리 (`/admin/users`)
- [x] 전체 유저 목록 + 페이지네이션
- [x] 차단 / 차단 해제 (사유 입력)
- [x] 관리자 메모 편집

### A-8. 배너/광고 관리 (`/admin/banners`)
- [x] 배너 목록 + 클릭 수 통계
- [x] 추가 / 편집 / 삭제 / 노출 토글
- [x] 위치(4개), 기간, 순서 설정

### A-9. 설정 (`/admin/settings`)
- [x] key-value 설정 목록 조회 + 인라인 편집

---

## Phase 2 — 고도화 (예정)

- [ ] A-10. 홀 상세 편집 (이름, 주소, 태그, 설명 등 전체 필드)
- [ ] A-11. 홀 신규 등록 폼
- [ ] A-12. 통계 차트 (월별 가입, 게시글 추이)
- [ ] A-13. 배너 이미지 Storage 업로드
- [ ] A-14. 공지사항 관리
- [ ] A-15. 스크래퍼 로그 조회

---

## DB 스키마 변경 내역

| 테이블 | 변경 |
|--------|------|
| `bw_profiles` | `is_blocked` bool, `blocked_at` timestamptz, `blocked_reason` text, `admin_memo` text 추가 |
| `bw_banners` | 신규 생성 (배너/광고) |
| `bw_banner_clicks` | 신규 생성 (클릭 추적) |
| `bw_settings` | 신규 생성 (전역 설정) |

## 접근 방법
- DevPanel(🛠)에서 `관리자` 계정으로 로그인 → "어드민 패널 열기" 클릭
- 또는 브라우저에서 직접 `/admin` 접속
