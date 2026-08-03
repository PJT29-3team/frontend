import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/stores/authStore'
import { useSurveyStore } from '@/stores/survey'
import { routes } from './routes'
import { PATHS } from './paths'

export function requireAuthentication(to) {
  if (to.meta.requiresAuth && !authStore.state.accessToken) {
    return { path: PATHS.login, query: { redirect: to.fullPath } }
  }
  return true
}

export function requireSurveyCompletion(to) {
  const isLaterProcessStep = to.meta.process && !to.path.startsWith(PATHS.survey)
  if (isLaterProcessStep && !useSurveyStore().done) {
    return { path: PATHS.survey }
  }
  return true
}

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  const authResult = requireAuthentication(to)
  if (authResult !== true) return authResult
  return requireSurveyCompletion(to)
})

export default router
