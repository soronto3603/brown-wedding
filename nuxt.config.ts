// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  /** Vite가 nuxt 소스의 `import("#app-manifest")` 를 선분석할 때 가상 모듈이 없으면 실패함 → 빈 모듈으로 고정 */
  experimental: {
    appManifest: false,
  },
  vite: {
    resolve: {
      alias: {
        '#app-manifest': 'mocked-exports/empty',
      },
    },
  },
  modules: ['@nuxtjs/supabase'],
  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  routeRules: {
    '/confirm': { ssr: false },
  },
  /** 배포 타깃별 Nitro 프리셋 (로컬은 기본 node-server) */
  nitro: {
    preset: process.env.VERCEL
      ? 'vercel'
      : process.env.NETLIFY
        ? 'netlify'
        : undefined,
  },
  runtimeConfig: {
    public: {
      /** 앱/프로젝트 표시명 (선택) — NUXT_PUBLIC_PROJECT_NAME */
      projectName: '',
      /** 네이버 Maps JS API용 Client ID — NUXT_PUBLIC_NAVER_MAP_CLIENT_ID */
      naverMapClientId: '',
      /**
       * true면 스크립트에 `ncpClientId=` (구 Open API). false면 `ncpKeyId=` (NCP 통합 콘솔).
       * NUXT_PUBLIC_NAVER_MAP_LEGACY_CLIENT_ID=true
       */
      naverMapLegacyClientId: false,
      /** Supabase 프로젝트 URL — NUXT_PUBLIC_SUPABASE_URL */
      supabaseUrl: '',
      /** Supabase anon (public) key — NUXT_PUBLIC_SUPABASE_ANON_KEY */
      supabaseAnonKey: '',
    },
  },
  app: {
    head: {
      title: 'brown-wedding',
      htmlAttrs: { lang: 'ko' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#F2728A' },
      ],
      link: [
        {
          rel: 'icon',
          href: '/weddic-icon.svg',
          type: 'image/svg+xml',
        },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css',
        },
      ],
    },
  },
  css: ['~/assets/css/main.css'],
})
