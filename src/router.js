import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "./stores/authStore";

const routes = [
  { path: "/", component: () => import("./views/LandingView.vue") },
  {
    path: "/main",
    component: () => import("./views/MainView.vue"),
    meta: { requiresAuth: true, process: true },
  },
  {
    path: "/process/survey",
    component: () => import("./views/ProcessPlaceholderView.vue"),
    meta: { requiresAuth: true, process: true, title: '설문 조사', description: '나에게 꼭 맞는 주거 조건을 확인하는 설문 조사 페이지입니다.' },
  },
  {
    path: "/process/recommended",
    component: () => import("./views/ProcessPlaceholderView.vue"),
    meta: { requiresAuth: true, process: true, title: '추천 매물', description: '설문 결과를 바탕으로 추천 매물을 살펴보는 페이지입니다.' },
  },
  {
    path: "/evaluation-method",
    component: () => import("./views/EvaluationMethodView.vue"),
    meta: { requiresAuth: true, process: true },
  },
  { path: "/login", component: () => import("./views/LoginChoiceView.vue") },
  {
    path: "/login/email",
    component: () => import("./views/EmailLoginView.vue"),
  },
  { path: "/signup", component: () => import("./views/SignupView.vue") },
  {
    path: "/auth/email/verify",
    component: () => import("./views/EmailVerificationResultView.vue"),
  },
  {
    path: "/password/reset/request",
    component: () => import("./views/PasswordResetRequestView.vue"),
  },
  {
    path: "/auth/password/reset",
    component: () => import("./views/PasswordResetCompleteView.vue"),
  },
  {
    path: "/auth/social/callback",
    component: () => import("./views/SocialLoginCallbackView.vue"),
  },
  { path: "/me", component: () => import("./views/ProfileView.vue") },
  {
    path: "/social/profile",
    component: () => import("./views/SocialProfileCompletionView.vue"),
  },
  {
    path: "/survey",
    name: "survey",
    component: () => import("@/views/SurveyView.vue"),
  },
  {
    path: "/survey/:surveyId",
    name: "survey-resume",
    component: () => import("@/views/SurveyView.vue"),
    props: true,
  },
];

export function requireAuthentication(to) {
  if (to.meta.requiresAuth && !authStore.state.accessToken) {
    return {
      path: "/login",
      query: { redirect: to.fullPath },
    };
  }
  return true;
}

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(requireAuthentication);

export default router;
