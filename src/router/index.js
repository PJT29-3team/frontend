import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from '@/stores/authStore'
import { routes } from './routes'
import { PATHS } from './paths'

export function requireAuthentication(to) {
  if (to.meta.requiresAuth && !authStore.state.accessToken) {
    return { path: PATHS.login, query: { redirect: to.fullPath } }
  }
  return true
}

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach(requireAuthentication)

export default router
