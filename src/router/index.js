import { createRouter, createWebHistory } from "vue-router";

const routes = [
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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;import { createRouter, createWebHistory } from "vue-router";

const routes = [
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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;