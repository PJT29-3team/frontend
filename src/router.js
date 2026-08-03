import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "./stores/authStore";

const routes = [
  { path: "/", component: () => import("./views/landing/LandingView.vue") },
  {
    path: "/main",
    component: () => import("./views/main/MainView.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/login", component: () => import("./views/auth/LoginChoiceView.vue") },
  {
    path: "/login/email",
    component: () => import("./views/auth/EmailLoginView.vue"),
  },
  { path: "/signup", component: () => import("./views/auth/SignupView.vue") },
  {
    path: "/auth/email/verify",
    component: () => import("./views/auth/EmailVerificationResultView.vue"),
  },
  {
    path: "/password/reset/request",
    component: () => import("./views/auth/PasswordResetRequestView.vue"),
  },
  {
    path: "/auth/password/reset",
    component: () => import("./views/auth/PasswordResetCompleteView.vue"),
  },
  {
    path: "/auth/social/callback",
    component: () => import("./views/auth/SocialLoginCallbackView.vue"),
  },
  { path: "/me", component: () => import("./views/account/ProfileView.vue") },
  {
    path: "/social/profile",
    component: () => import("./views/auth/SocialProfileCompletionView.vue"),
  },
  {
    path: "/survey",
    name: "survey",
    component: () => import("@/views/survey/SurveyView.vue"),
  },
  {
    path: "/survey/:surveyId",
    name: "survey-resume",
    component: () => import("@/views/survey/SurveyView.vue"),
    props: true,
  },
  {
    path: "/recommend",
    name: "recommend-list",
    component: () => import("@/views/house/RecommendationList.vue"),
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
