<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/common/AppHeader.vue'
import StepIndicator from './components/common/StepIndicator.vue'
import { PATHS } from './router/paths'
import { useSurveyStore } from './stores/survey'

const route = useRoute()
const survey = useSurveyStore()
const showProcessShell = computed(() => Boolean(route.meta.process))

const currentStep = computed(() => {
  if (route.path.startsWith('/survey')) return 'survey'
  if (route.path === PATHS.recommendedProperty) return 'recommend'
  return 'favorite'
})

const unlockedStep = computed(() => {
  if (route.path === PATHS.favoriteHome || route.path === PATHS.evaluationMethod) return 'favorite'
  if (survey.done) return 'recommend'
  return 'survey'
})
</script>

<template>
  <div class="app-shell">
    <template v-if="showProcessShell">
      <AppHeader />
      <StepIndicator :current-step="currentStep" :unlocked-step="unlockedStep" />
    </template>
    <RouterView />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #fff;
  color: #545045;
}
</style>
