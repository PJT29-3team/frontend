import { PATHS } from '../paths'

export const routes = [
  { path: PATHS.landing, component: () => import('@/views/landing/LandingView.vue') },
  { path: PATHS.favoriteHome, component: () => import('@/views/favorite/MainView.vue'), meta: { requiresAuth: true, process: true } },
  { path: PATHS.surveyProcess, component: () => import('@/views/house/ProcessPlaceholderView.vue'), meta: { requiresAuth: true, process: true, title: '설문 조사', description: '나에게 꼭 맞는 주거 조건을 확인하는 설문 조사 페이지입니다.' } },
  { path: PATHS.recommendedProperty, component: () => import('@/views/house/ProcessPlaceholderView.vue'), meta: { requiresAuth: true, process: true, title: '추천 매물', description: '설문 결과를 바탕으로 추천 매물을 살펴보는 페이지입니다.' } },
  { path: PATHS.evaluationMethod, component: () => import('@/views/favorite/EvaluationMethodView.vue'), meta: { requiresAuth: true, process: true } },
  { path: PATHS.login, component: () => import('@/views/auth/LoginChoiceView.vue') },
  { path: PATHS.emailLogin, component: () => import('@/views/auth/EmailLoginView.vue') },
  { path: PATHS.signup, component: () => import('@/views/auth/SignupView.vue') },
  { path: PATHS.emailVerification, component: () => import('@/views/auth/EmailVerificationResultView.vue') },
  { path: PATHS.passwordResetRequest, component: () => import('@/views/auth/PasswordResetRequestView.vue') },
  { path: PATHS.passwordReset, component: () => import('@/views/auth/PasswordResetCompleteView.vue') },
  { path: PATHS.socialCallback, component: () => import('@/views/auth/SocialLoginCallbackView.vue') },
  { path: PATHS.profile, component: () => import('@/views/account/ProfileView.vue') },
  { path: PATHS.socialProfile, component: () => import('@/views/auth/SocialProfileCompletionView.vue') },
  { path: PATHS.survey, name: 'survey', component: () => import('@/views/house/ProcessPlaceholderView.vue'), meta: { requiresAuth: true, process: true, title: '설문 조사', description: '나에게 꼭 맞는 주거 조건을 확인하는 설문 조사 페이지입니다.' } },
  { path: `${PATHS.survey}/:surveyId`, name: 'survey-resume', component: () => import('@/views/house/ProcessPlaceholderView.vue'), props: true, meta: { requiresAuth: true, process: true, title: '설문 조사', description: '나에게 꼭 맞는 주거 조건을 확인하는 설문 조사 페이지입니다.' } },
]
