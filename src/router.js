import { createRouter, createWebHistory } from 'vue-router'
import { authStore } from './stores/authStore'

const routes = [
  { path: '/', component: () => import('./views/LandingView.vue') },
  { path: '/main', component: () => import('./views/MainView.vue'), meta: { requiresAuth: true } },
  { path: '/login', component: () => import('./views/LoginChoiceView.vue') },
  { path: '/login/email', component: () => import('./views/EmailLoginView.vue') },
  { path: '/signup', component: () => import('./views/SignupView.vue') },
  { path: '/auth/email/verify', component: () => import('./views/EmailVerificationResultView.vue') },
  { path: '/password/reset/request', component: () => import('./views/PasswordResetRequestView.vue') },
  { path: '/auth/password/reset', component: () => import('./views/PasswordResetCompleteView.vue') },
  { path: '/auth/social/callback', component: () => import('./views/SocialLoginCallbackView.vue') },
  { path: '/social/link', component: () => import('./views/SocialAccountLinkView.vue') },
  { path: '/me', component: () => import('./views/ProfileView.vue') },
  { path: '/social/profile', component: () => import('./views/SocialProfileCompletionView.vue') },
]

export function requireAuthentication(to) {
  if (to.meta.requiresAuth && !authStore.state.accessToken) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
  return true
}

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(requireAuthentication)

export default router
