<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { Database, Heart, Search } from '@lucide/vue'
import logoUrl from './assets/images/logo.png'

const steps = [
  { label: '현재 주택', icon: Search, to: '/homes/current' },
  { label: '추천 매물', icon: Search, to: '/properties/recommended' },
  { label: '관심 매물', icon: Heart, to: '/properties/favorites' },
  { label: '금융상품 추천', icon: Database, to: '/financial-products' },
]

const route = useRoute()

const activeStepIndex = computed(() => {
  const matchedIndex = [...steps].reverse().findIndex((step) => route.path.startsWith(step.to))
  return matchedIndex === -1 ? 0 : steps.length - 1 - matchedIndex
})

function stepState(index) {
  if (index === activeStepIndex.value) return 'is-active'
  if (index < activeStepIndex.value) return 'is-done'
  return 'is-pending'
}
</script>

<template>
  <main class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/homes/current" aria-label="작은 둥지 홈">
        <img :src="logoUrl" alt="" />
        <span>작은 둥지</span>
      </RouterLink>
      <div class="topbar-actions">
        <button class="outline-button" type="button">마이페이지</button>
        <span class="welcome-text">홍길동님 환영합니다.</span>
        <button class="outline-button" type="button">로그아웃</button>
      </div>
    </header>

    <nav class="journey" aria-label="서비스 진행 단계">
      <ol class="journey-list">
        <li v-for="(step, index) in steps" :key="step.to" class="journey-item" :class="stepState(index)">
          <RouterLink
            v-if="index <= activeStepIndex"
            class="journey-link"
            :to="step.to"
            :aria-current="index === activeStepIndex ? 'step' : undefined"
          >
            <span class="journey-icon" aria-hidden="true"><component :is="step.icon" class="journey-svg" /></span>
            <strong>{{ step.label }}</strong>
            <small>{{ index === activeStepIndex ? '진행중' : '완료' }}</small>
          </RouterLink>
          <button v-else class="journey-link" type="button" disabled>
            <span class="journey-icon" aria-hidden="true"><component :is="step.icon" class="journey-svg" /></span>
            <strong>{{ step.label }}</strong>
            <small>대기</small>
          </button>
        </li>
      </ol>
      <button class="report-button" type="button">보고서 받기 <span aria-hidden="true">▾</span></button>
    </nav>

    <RouterView />
  </main>
</template>

<style scoped>
.app-shell { min-height: 100vh; background: #fff; color: #2f2d29; }
.topbar { height: 70px; background: #545045; border: 1px solid #171717; display: flex; align-items: center; justify-content: space-between; padding: 0 42px 0 32px; color: #fff; }
.brand, .topbar-actions { display: flex; align-items: center; gap: 24px; }
.brand { color: #fff; font-size: 19px; font-weight: 800; text-decoration: none; gap: 16px; }
.brand img { width: 38px; height: 38px; object-fit: contain; }
.outline-button { padding: 7px 18px; border: 1.5px solid #fff; border-radius: 999px; background: transparent; color: #fff; font-size: 16px; }
.welcome-text { font-size: 16px; font-weight: 700; }
.journey { min-width: 0; min-height: 112px; margin-left: 27.5%; display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 24px; align-items: start; padding: 13px 28px 0; border-bottom: 1px solid #eceae5; background: #fff; }
.journey-list { position: relative; display: flex; width: min(730px, 100%); margin: 0 auto; padding: 0; list-style: none; justify-content: space-between; }
.journey-list::before { content: ''; position: absolute; top: 27px; right: 12.5%; left: 12.5%; height: 4px; background: #eeece5; z-index: 0; }
.journey-item { position: relative; z-index: 1; flex: 1; display: grid; justify-items: center; }
.journey-link { display: grid; justify-items: center; min-width: 94px; padding: 0; border: 0; background: transparent; color: #bebaae; font-size: 14px; font-weight: 700; text-decoration: none; cursor: pointer; }
.journey-link:disabled { cursor: not-allowed; opacity: 1; }
.journey-icon { display: grid; width: 54px; height: 54px; place-items: center; border: 3px solid #eeece5; border-radius: 50%; background: #fff; color: #bdb9ac; line-height: 1; }
.journey-svg { width: 29px; height: 29px; stroke-width: 3; }
.journey-link strong { margin-top: 7px; color: inherit; white-space: nowrap; }
.journey-link small { margin-top: 2px; color: inherit; font-size: 12px; }
.journey-item.is-active small { color: #dd9c00; }
.journey-item.is-active .journey-icon { border-color: #bf8500; background: #fabb22; color: #fff; box-shadow: 0 0 0 1px #bf8500; }
.journey-item.is-active .journey-link { color: #1f1f1f; }
.journey-item.is-done small { color: #3d9961; }
.journey-item.is-done .journey-icon { border-color: #3d9961; color: #3d9961; }
.journey-item.is-done .journey-link { color: #545045; }
.report-button { align-self: start; margin-top: 16px; padding: 6px 19px; border: 2px solid #f0d896; border-radius: 999px; background: #fffaf0; color: #8a6a20; font-weight: 700; white-space: nowrap; }
.report-button span { margin-left: 12px; font-size: 18px; }
@media (max-width: 1000px) { .topbar { padding: 0 22px; }.journey { margin-left: 27.5%; padding-right: 16px; padding-left: 16px; column-gap: 12px; }.journey-link { min-width: 0; }.report-button { padding-right: 12px; padding-left: 12px; } }
@media (max-width: 720px) { .topbar { height: auto; min-height: 64px; padding: 12px 16px; }.topbar-actions { gap: 8px; }.welcome-text, .outline-button:first-child { display: none; }.journey { min-height: 101px; margin-left: 0; grid-template-columns: 1fr; padding: 10px 16px 0; }.journey-list { width: 100%; }.journey-list::before { top: 24px; right: 12.5%; left: 12.5%; }.journey-link { min-width: 0; font-size: 11px; }.journey-link small { font-size: 11px; }.journey-icon { width: 49px; height: 49px; }.journey-svg { width: 26px; height: 26px; }.report-button { display: none; } }
</style>
