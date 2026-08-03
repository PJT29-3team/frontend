import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "./stores/authStore";

const routes = [
  { path: "/", component: () => import("./views/LandingView.vue") },
  {
    path: "/main",
    component: () => import("./views/MainView.vue"),
    meta: { requiresAuth: true },
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
  {
    path: "/me",
    component: () => import("./views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
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
  {
    // FPR-001 금융상품 추천 조건입력. (survey처럼 현재는 auth 가드 없이 접근)
    path: "/recommendation",
    name: "recommendation",
    component: () => import("@/views/RecommendationConditionView.vue"),
  },
  {
    path: "/recommendation/result",
    name: "recommendation-result",
    component: () => import("@/views/RecommendationResultView.vue"),
  },
  {
    path: "/recommendation/favorites",
    name: "recommendation-favorites",
    component: () => import("@/views/RecommendationFavoritesView.vue"),
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
