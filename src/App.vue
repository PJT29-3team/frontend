<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Check, Database, FileText, Heart, Search } from '@lucide/vue'
import logoUrl from './assets/images/logo.png'

const route = useRoute()
const showServiceShell = computed(() =>
  route.path.startsWith('/survey') || route.path.startsWith('/recommendation'),
)

const steps = [
  { label: '설문 조사', icon: Check },
  { label: '추천 매물', icon: Search },
  { label: '관심 매물', icon: Heart },
  { label: '금융상품 추천', icon: Database },
  { label: '금융상품 관심', icon: Heart },
  { label: '결과 보기', icon: FileText },
]

// 금융상품 추천 흐름에서는 4번째(금융상품 추천, index 3)가 진행중.
const activeIndex = computed(() =>
  route.path.startsWith('/recommendation') ? 3 : 0,
)
// 완료 선(노란색)이 진행중 단계까지 차오르는 비율(0~1).
const progressFrac = computed(() => activeIndex.value / (steps.length - 1))

function stepState(index) {
  if (index < activeIndex.value) return 'is-done'
  if (index === activeIndex.value) return 'is-active'
  return 'is-pending'
}
function stepStatusLabel(index) {
  if (index < activeIndex.value) return '완료'
  if (index === activeIndex.value) return '진행중'
  return '대기'
}
</script>

<template>
  <main v-if="showServiceShell" class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/" aria-label="작은 둥지 홈">
        <img :src="logoUrl" alt="" />
        <span>작은 둥지</span>
      </RouterLink>
      <div class="topbar-actions">
        <button class="report-button" type="button">
          보고서 받기 <span aria-hidden="true">▾</span>
        </button>
        <button class="outline-button" type="button">마이페이지</button>
        <span class="welcome-text">홍길동님 환영합니다.</span>
        <button class="logout-button" type="button">로그아웃</button>
      </div>
    </header>

    <nav class="journey" aria-label="서비스 진행 단계">
      <ol class="journey-list" :style="{ '--pw': progressFrac }">
        <li
          v-for="(step, index) in steps"
          :key="step.label"
          class="journey-item"
          :class="stepState(index)"
        >
          <div class="journey-link">
            <span class="journey-icon" aria-hidden="true">
              <component :is="step.icon" class="journey-svg" />
            </span>
            <strong>{{ step.label }}</strong>
            <small>{{ stepStatusLabel(index) }}</small>
          </div>
        </li>
      </ol>
    </nav>

    <RouterView />
  </main>
  <RouterView v-else />
</template>

<style scoped>
.app-shell { min-height: 100vh; background: #fff; color: #2f2d29; }

/* 상단바 */
.topbar {
  height: 70px;
  background: #545045;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  color: #fff;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fff;
  font-size: 19px;
  font-weight: 800;
  text-decoration: none;
}
.brand img { width: 34px; height: 34px; object-fit: contain; }
.topbar-actions { display: flex; align-items: center; gap: 18px; }
.report-button {
  padding: 7px 18px;
  border: 1.5px solid #f0d896;
  border-radius: 999px;
  background: #fffaf0;
  color: #8a6a20;
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
}
.report-button span { margin-left: 6px; font-size: 15px; }
.outline-button {
  padding: 7px 18px;
  border: 1.5px solid #fff;
  border-radius: 999px;
  background: transparent;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
}
.welcome-text { font-size: 15px; font-weight: 700; }
.logout-button {
  background: none;
  border: none;
  color: #e8e5df;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
}

/* 진행바 */
.journey {
  background: #fff;
  border-bottom: 1px solid #eceae5;
  padding: 20px 28px 6px;
}
.journey-list {
  position: relative;
  display: flex;
  width: min(940px, 100%);
  margin: 0 auto;
  padding: 0;
  list-style: none;
}
/* 회색 전체 선 */
.journey-list::before {
  content: '';
  position: absolute;
  top: 26px;
  left: 8.33%;
  right: 8.33%;
  height: 4px;
  background: #ecebe6;
  z-index: 0;
}
/* 노란 진행 선(진행중 단계까지) */
.journey-list::after {
  content: '';
  position: absolute;
  top: 26px;
  left: 8.33%;
  width: calc(83.34% * var(--pw, 0));
  height: 4px;
  background: #e3b53f;
  z-index: 0;
}
.journey-item {
  position: relative;
  z-index: 1;
  flex: 1;
  display: grid;
  justify-items: center;
}
.journey-link {
  display: grid;
  justify-items: center;
  padding: 0;
  color: #bfbbaf;
  font-size: 14px;
  font-weight: 700;
}
.journey-icon {
  display: grid;
  width: 52px;
  height: 52px;
  place-items: center;
  border: 3px solid #ecebe6;
  border-radius: 50%;
  background: #fff;
  color: #c6c2b6;
}
.journey-svg { width: 26px; height: 26px; stroke-width: 2.4; }
.journey-link strong { margin-top: 8px; color: inherit; white-space: nowrap; }
.journey-link small { margin-top: 3px; color: inherit; font-size: 12px; }

/* 완료 */
.journey-item.is-done .journey-icon {
  border-color: #e9be4b;
  background: #f3c64b;
  color: #fff;
}
.journey-item.is-done .journey-link { color: #4a4a4a; }
.journey-item.is-done small { color: #c99a1e; }
/* 진행중 */
.journey-item.is-active .journey-icon {
  border-color: #bf8500;
  background: #f5b91e;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(245, 185, 30, 0.18);
}
.journey-item.is-active .journey-link { color: #1f1f1f; }
.journey-item.is-active small { color: #dd9c00; }

@media (max-width: 900px) {
  .topbar { padding: 0 18px; }
  .welcome-text { display: none; }
  .journey-link { font-size: 12px; }
  .journey-icon { width: 46px; height: 46px; }
  .journey-svg { width: 22px; height: 22px; }
}
</style>
