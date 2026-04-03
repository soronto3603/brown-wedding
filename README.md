# brown-wedding

Nuxt 3 + Vue 3 + TypeScript 웨딩 준비 데모 UI.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 표시되는 로컬 URL(기본 http://localhost:3000)을 엽니다.

## 환경 변수

- **로컬**: [direnv](https://direnv.net/) + `.envrc` (`.envrc.example` 복사 후 값 입력). `.envrc`는 git에 포함되지 않습니다.
- **Vercel**: 프로젝트 Settings → Environment Variables에 **동일한 `NUXT_PUBLIC_*` 이름**으로 등록합니다.

### 네이버 클라우드 Maps 문서 구분

공식 [Maps 개요](https://api.ncloud-docs.com/docs/application-maps-overview)는 **REST API**(Static Map, Geocoding, Directions 등)를 다룹니다. 이런 호출은 `maps.apigw.ntruss.com` 으로 가며, 요청 헤더에 **Client ID**와 **Client Secret**이 함께 필요하고, **서버·백엔드**에서 쓰는 패턴입니다.

이 프로젝트 **홀지도 화면**은 브라우저에 **Maps JavaScript API v3**(Dynamic Map / 웹용 스크립트)를 로드합니다. 스크립트 URL에는 **[Client ID만](https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html)** 넣으며(`ncpKeyId`), **Client Secret은 프론트·`NUXT_PUBLIC_*`에 넣지 마세요.** 콘솔에서 Application 등록·API 선택·웹 서비스 URL 허용은 [Maps 개요](https://api.ncloud-docs.com/docs/application-maps-overview)와 연결된 **Maps 사용 가이드**, [Dynamic Map](https://api.ncloud-docs.com/docs/application-maps-dynamic)을 참고하면 됩니다. 개요 문서에 나온 **REST API 헤더 인증**(Client ID + Secret, `maps.apigw.ntruss.com` 호출)과 브라우저 **JS 스크립트 `ncpKeyId`** 는 용도가 다릅니다.

`nuxt.config.ts`의 `runtimeConfig.public`과 대응하는 주요 변수:

| 변수 | 설명 |
|------|------|
| `NUXT_PUBLIC_PROJECT_NAME` | 프로젝트 표시명 |
| `NUXT_PUBLIC_NAVER_MAP_CLIENT_ID` | 네이버 지도(JS API) Client ID (NCP 콘솔 **Application 인증 정보**의 ID) |
| `NUXT_PUBLIC_NAVER_MAP_LEGACY_CLIENT_ID` | `true`이면 스크립트에 `ncpClientId=` 사용 (구 방식 키만 쓸 때) |
| `NUXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NUXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon(public) 키 |

**네이버 지도 “Open API 인증 실패”** 시 확인:

1. **값**: NCP 콘솔 → Application → **인증 정보**에 표시된 ID를 그대로 넣었는지 (공백·따옴표 없음).
2. **콘솔 URL**: 같은 애플리케이션에서 **Maps API**가 켜져 있고, **웹 서비스 URL**에 `http://localhost:3000`(또는 실제 도메인)이 등록되어 있는지.
3. **키 종류**: 신규 통합 콘솔 키는 `ncpKeyId`(기본). 예전 Open API 전용 키만 있으면 `.env`에 `NUXT_PUBLIC_NAVER_MAP_LEGACY_CLIENT_ID=true` 후 `npm run dev` 재시작.
4. **반영**: `.env` / `.envrc` 수정 후 **개발 서버를 완전히 종료했다가 다시** `npm run dev` (Nuxt는 기동 시 `NUXT_PUBLIC_*`를 읽음).

네이버 지도 키가 없으면 홀지도 탭은 목업 지도를 씁니다. Supabase URL은 대시보드의 실제 Project URL과 맞는지 확인하세요 (`https://<ref>.supabase.co`).

### `ERR_PACKAGE_IMPORT_NOT_DEFINED` / `#internal/nuxt/paths`

`.nuxt/dist/server/server.mjs`는 **직접 `node`로 실행하면 안 됩니다.** 개발은 항상 `npm run dev`, 프로덕션 로컬 확인은 `npm run build` 후 `npm run preview`(또는 `node .output/server/index.mjs`)만 사용하세요.

캐시가 꼬였으면: `npm run clean` 또는 `nuxt cleanup` 후 다시 `npm run dev`.

## 빌드

```bash
npm run build
npm run preview
```

프리뷰는 Nitro 서버로 프로덕션 빌드를 띄웁니다.
