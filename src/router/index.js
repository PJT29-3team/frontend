import { createRouter, createWebHistory } from 'vue-router'
import CurrentHomeView from '../views/CurrentHomeView.vue'
import CurrentHomeDetailView from '../views/CurrentHomeDetailView.vue'
import PlaceholderView from '../views/PlaceholderView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', redirect: '/homes/current' },
        { path: '/homes/current', component: CurrentHomeView },
        { path: '/homes/current/detail', component: CurrentHomeDetailView },
        { path: '/properties/recommended', component: PlaceholderView, meta: { title: '추천 매물' } },
        { path: '/properties/favorites', component: PlaceholderView, meta: { title: '관심 매물' } },
        { path: '/financial-products', component: PlaceholderView, meta: { title: '금융상품 추천' } },
    ],
})

router.beforeEach((to) => {
    if (!to.path.startsWith('/homes/current')) return '/homes/current'
    return true
})

export default router