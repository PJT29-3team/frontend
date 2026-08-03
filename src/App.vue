<script setup>
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { authStore } from './stores/authStore'
import logoUrl from './assets/images/logo.png'
import { PATHS } from './router/paths'

const route = useRoute()
const router = useRouter()

const showProcessShell = computed(() => Boolean(route.meta.process))
const userName = computed(() => authStore.state.user?.name || authStore.state.user?.userName || '회원')
const processStepIndex = computed(() => {
  if (route.path.startsWith(PATHS.survey)) return 0
  if (route.path === PATHS.recommendedProperty) return 1
  return 2
})
const processSteps = [
  { label: '설문 조사', icon: '⌕', to: PATHS.survey },
  { label: '추천 매물', icon: '⌕', to: PATHS.recommendedProperty },
  { label: '관심 매물', icon: '♡', to: PATHS.favoriteHome },
  { label: '금융상품 추천', icon: '▤' },
  { label: '금융상품 관심', icon: '♡' },
  { label: '결과 보기', icon: '◧' },
]

function stepState(index) {
  if (index < processStepIndex.value) return 'complete'
  if (index === processStepIndex.value) return 'active'
  return 'waiting'
}

async function logout() {
  try {
    await authStore.logout()
  } finally {
    router.push('/login')
  }
}
</script>

<template>
  <div class="app-shell">
    <template v-if="showProcessShell">
      <header class="topbar">
        <RouterLink class="brand" :to="PATHS.survey" aria-label="작은둥지 홈">
          <img :src="logoUrl" alt="" />
          <span>작은 둥지</span>
        </RouterLink>
        <div class="topbar-actions">
          <RouterLink class="mypage-button" to="/me">마이페이지</RouterLink>
          <span class="welcome-text">{{ userName }}님 환영합니다.</span>
          <button class="logout-button" type="button" @click="logout">로그아웃</button>
        </div>
      </header>
      <nav :class="['process-nav', `stage-${processStepIndex}`]" aria-label="서비스 진행 단계">
        <component
          :is="step.to && index <= processStepIndex ? 'RouterLink' : 'button'"
          v-for="(step, index) in processSteps"
          :key="step.label"
          class="process-link"
          :to="step.to"
          :disabled="!step.to || index > processStepIndex"
          :aria-label="`${step.label}, ${stepState(index) === 'complete' ? '완료' : stepState(index) === 'active' ? '진행 중' : '대기'}`"
        >
          <span class="process-icon" :class="{ 'is-complete': stepState(index) === 'complete', 'is-active': stepState(index) === 'active' }">{{ stepState(index) === 'complete' ? '✓' : step.icon }}</span>
          <strong>{{ step.label }}</strong>
          <small>{{ stepState(index) === 'complete' ? '완료' : stepState(index) === 'active' ? '진행중' : '대기' }}</small>
        </component>
      </nav>
    </template>
    <RouterView />
  </div>
</template>

<style scoped>
.app-shell { min-height: 100vh; background: #fff; color: #545045; }
.topbar { height: 54px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 clamp(18px, 3.4vw, 52px); background: #545045; color: #fff; }
.brand { display: inline-flex; align-items: center; gap: 11px; color: inherit; font-size: 17px; font-weight: 800; text-decoration: none; }
.brand img { width: 30px; height: 30px; object-fit: contain; background: #fff; }
.topbar-actions { display: flex; align-items: center; gap: 16px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.report-button, .mypage-button, .logout-button { border: 1px solid rgba(255,255,255,.82); border-radius: 999px; background: transparent; color: #fff; padding: 5px 12px; font-size: 12px; text-decoration: none; }
.report-button { border-color: #efce73; background: #fff9e7; color: #7e6121; }
.report-button span { margin-left: 5px; }.logout-button { padding-inline: 0; border: 0; border-radius: 0; text-decoration: underline; text-underline-offset: 3px; }
.process-nav { position: relative; min-height: 150px; display: flex; justify-content: center; gap: clamp(33px, 7vw, 108px); padding: 31px 20px 19px; border-bottom: 1px solid #efeee9; background: #fff; }
.process-nav::before { content: ''; position: absolute; top: 62px; left: 50%; width: min(940px, calc(100% - 190px)); height: 3px; transform: translateX(-50%); background: #ece9e1; }
.process-nav::after { content: ''; position: absolute; top: 62px; left: calc(50% - min(470px, (100% - 190px) / 2)); height: 3px; background: #efad16; }.process-nav.stage-0::after { width: 0; }.process-nav.stage-1::after { width: min(188px, calc((100% - 190px) * .2)); }.process-nav.stage-2::after { width: min(376px, calc((100% - 190px) * .4)); }.process-nav.stage-3::after { width: min(564px, calc((100% - 190px) * .6)); }.process-nav.stage-4::after { width: min(752px, calc((100% - 190px) * .8)); }.process-nav.stage-5::after { width: min(940px, calc(100% - 190px)); }
.process-link { position: relative; z-index: 1; width: 84px; display: grid; justify-items: center; gap: 4px; padding: 0; background: transparent; color: #beb9ad; font-size: 13px; line-height: 1.15; text-decoration: none; }
.process-link strong { color: inherit; white-space: nowrap; }.process-link small { color: #bbb5a8; font-size: 12px; }.process-link:disabled { opacity: 1; cursor: not-allowed; }
.process-icon { width: 52px; height: 52px; display: grid; place-items: center; border: 3px solid #ebe8e0; border-radius: 50%; background: #fff; color: #b9b4a8; font-size: 28px; font-weight: 800; }
.process-icon.is-complete { border-color: #f5b426; background: #f5b426; color: #fff; }.process-icon.is-active { border-color: #c88a00; background: #f5b426; color: #fff; box-shadow: 0 0 0 1px #c88a00; }
.process-link:has(.is-complete) small, .process-link:has(.is-active) small { color: #d28c00; font-weight: 800; }.process-link:has(.is-active) strong { color: #2f2d29; }
@media (max-width: 760px) { .topbar { height: auto; min-height: 52px; padding-block: 9px; }.topbar-actions { gap: 8px; }.welcome-text, .mypage-button, .report-button { display: none; }.process-nav { gap: 8px; padding-inline: 8px; overflow-x: auto; justify-content: flex-start; }.process-nav::before, .process-nav::after { display: none; }.process-link { flex: 0 0 64px; font-size: 11px; }.process-icon { width: 40px; height: 40px; font-size: 21px; } }
</style>
