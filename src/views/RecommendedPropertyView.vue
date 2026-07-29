<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PropertyCard from '../components/property/PropertyCard.vue'
import PropertyMapView from '../components/property/PropertyMapView.vue'
import { usePropertyStore } from '../stores/propertyStore'
import { useFavoriteStore, MAX_FAVORITE_COUNT } from '../stores/favoriteStore'

const router = useRouter()
const propertyStore = usePropertyStore()
const favoriteStore = useFavoriteStore()

// TODO: homeStore/homeApi가 도입되면 현재주택 정보를 그쪽에서 가져온다.
const currentHome = { name: '중랑구 소형 아파트', latitude: 37.5886, longitude: 127.0871 }

const budgetLabel = computed(() => {
  const budget = propertyStore.condition.budget
  if (!budget) return ''
  return `${(budget / 100000000).toLocaleString('ko-KR')}억 이하, `
})

function propertyKey(property) {
  return property.propertyId ?? property.externalPropertyKey
}

function goEditCurrentHome() {
  router.push('/homes/current/edit')
}

function goChangeCondition() {
  router.push('/properties/condition')
}

function goCompareFavorites() {
  router.push('/properties/favorites')
}

function viewDetail(property) {
  router.push(`/properties/${property.externalPropertyKey}`)
}

function toggleFavorite(property) {
  if (favoriteStore.isFavorite(propertyKey(property))) {
    favoriteStore.removeFavorite(propertyKey(property))
  } else {
    favoriteStore.addFavorite(property)
  }
}

onMounted(async () => {
  await Promise.all([
    propertyStore.fetchRecommended().catch(() => {}),
    favoriteStore.fetchFavorites().catch(() => {}),
  ])
})
</script>

<template>
  <div class="recommended-page">
    <header class="recommended-header">
      <h1>{{ budgetLabel }}조건에 맞는 집 {{ propertyStore.properties.length }}곳 중 가장 잘 맞는 5곳이에요</h1>
    </header>

    <p v-if="propertyStore.error" class="recommended-error" role="alert">{{ propertyStore.error }}</p>
    <p v-else-if="propertyStore.isLoading" class="recommended-loading" role="status">추천 매물을 불러오고 있어요...</p>

    <div v-else class="recommended-content">
      <ol class="recommended-list">
        <li v-for="(property, index) in propertyStore.properties" :key="propertyKey(property)">
          <PropertyCard
            :property="property"
            :rank="index + 1"
            :is-favorite="favoriteStore.isFavorite(propertyKey(property))"
            :is-pending="favoriteStore.isPending(propertyKey(property))"
            :is-limit-reached="favoriteStore.isLimitReached"
            @view-detail="viewDetail"
            @toggle-favorite="toggleFavorite"
          />
        </li>
      </ol>

      <PropertyMapView :current-home="currentHome" :properties="propertyStore.properties" />
    </div>

    <footer class="recommended-footer">
      <button type="button" class="secondary-action" @click="goEditCurrentHome">← 우리 집 정보 바꾸기</button>
      <button type="button" class="secondary-action" @click="goChangeCondition">마음에 드는 집이 없나요? 조건을 바꿔볼게요</button>
      <div class="favorite-summary">
        <span>담은 매물 {{ favoriteStore.favorites.length }}/{{ MAX_FAVORITE_COUNT }}</span>
        <button type="button" class="primary-action" @click="goCompareFavorites">비교하러 가기 →</button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.recommended-page {
  min-height: calc(100vh - 182px);
  padding: clamp(20px, 3vw, 36px);
  background: var(--color-surface);
}

.recommended-header h1 {
  margin: 0 0 24px;
  color: var(--color-dark);
  font-size: clamp(22px, 2.4vw, 28px);
  line-height: 1.4;
}

.recommended-loading,
.recommended-error {
  padding: 40px;
  color: var(--color-text-muted);
  text-align: center;
  font-size: 18px;
}

.recommended-error {
  color: var(--color-danger);
}

.recommended-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
}

.recommended-list {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.recommended-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.secondary-action {
  min-height: 48px;
  padding: 0 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.favorite-summary {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.primary-action {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 12px;
  background: var(--color-primary);
  color: #1f1f1f;
  font-size: 16px;
  font-weight: 800;
}

@media (max-width: 900px) {
  .recommended-content {
    grid-template-columns: 1fr;
  }

  .recommended-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .favorite-summary {
    margin-left: 0;
    justify-content: space-between;
  }
}
</style>
