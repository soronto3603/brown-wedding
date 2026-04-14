<script setup lang="ts">
definePageMeta({ layout: false, middleware: 'admin' })

const route = useRoute()

const ADMIN_MENUS = [
  { key: 'index', label: '대시보드', icon: '📊', path: '/admin' },
  { key: 'halls', label: '홀 관리', icon: '🏛', path: '/admin/halls' },
  { key: 'posts', label: '게시글 관리', icon: '📝', path: '/admin/posts' },
  { key: 'glossary', label: '용어사전', icon: '📖', path: '/admin/glossary' },
  { key: 'songs', label: '선곡기', icon: '🎵', path: '/admin/songs' },
  { key: 'users', label: '유저 관리', icon: '👤', path: '/admin/users' },
  { key: 'banners', label: '배너/광고', icon: '🖼', path: '/admin/banners' },
  { key: 'settings', label: '설정', icon: '⚙️', path: '/admin/settings' },
]

function isActive(path: string) {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-logo">
        <NuxtLink to="/" class="admin-logo-back">← 딸깍웨딩</NuxtLink>
        <div class="admin-logo-title">Admin</div>
      </div>
      <nav class="admin-nav">
        <NuxtLink
          v-for="m in ADMIN_MENUS"
          :key="m.key"
          :to="m.path"
          :class="['admin-nav-item', { active: isActive(m.path) }]"
        >
          <span class="admin-nav-icon">{{ m.icon }}</span>
          <span class="admin-nav-label">{{ m.label }}</span>
        </NuxtLink>
      </nav>
    </aside>

    <main class="admin-main">
      <NuxtPage />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #f4f5f7;
  font-family: 'Pretendard', sans-serif;
}

.admin-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #1a1a2e;
  color: #ccc;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.admin-logo {
  padding: 16px 14px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.admin-logo-back {
  display: block;
  font-size: 11px;
  color: #888;
  text-decoration: none;
  margin-bottom: 4px;
  transition: color 0.15s;
}
.admin-logo-back:hover { color: #aaa; }

.admin-logo-title {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.admin-nav {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}

.admin-nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: #999;
  text-decoration: none;
  border-left: 3px solid transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.admin-nav-item:hover {
  background: rgba(255,255,255,0.06);
  color: #ddd;
}
.admin-nav-item.active {
  background: rgba(255,255,255,0.08);
  color: #fff;
  border-left-color: #F2728A;
  font-weight: 600;
}

.admin-nav-icon { font-size: 15px; flex-shrink: 0; }
.admin-nav-label { flex: 1; }

.admin-main {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}
</style>
