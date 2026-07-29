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
  { path: '/me', component: () => import('./views/ProfileView.vue') },
  { path: '/social/profile', component: () => import('./views/SocialProfileCompletionView.vue') },
  { path: '/homes/current', component: () => import('./views/CurrentHomeView.vue') },
  { path: '/homes/current/edit', component: () => import('./views/CurrentHomeEditView.vue') },
  { path: '/properties/recommended', component: () => import('./views/RecommendedPropertyView.vue'), meta: { title: '추천 매물' } },
  { path: '/properties/condition', component: () => import('./views/PlaceholderView.vue'), meta: { title: '조건 변경' } },
  { path: '/properties/favorites', component: () => import('./views/PlaceholderView.vue'), meta: { title: '관심 매물' } },
  { path: '/properties/:externalPropertyKey', component: () => import('./views/PlaceholderView.vue'), meta: { title: '매물 상세' } },
  { path: '/financial-products', component: () => import('./views/PlaceholderView.vue'), meta: { title: '금융상품 추천' } },
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
