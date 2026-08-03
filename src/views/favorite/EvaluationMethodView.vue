<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import EvaluationMethodModal from '@/components/favorite/EvaluationMethodModal.vue'
import { getFavoriteEvaluation } from '@/api/favoriteApi'

const router = useRouter()
const weights = ref({ safetyWeight: 60, convenienceWeight: 20, assetWeight: 20 })

onMounted(async () => {
  try {
    weights.value = await getFavoriteEvaluation()
  } catch {
    // 설문이 없을 때는 기본 가중치로 안내한다.
  }
})
</script>

<template>
  <div class="property-detail">
    <AppHeader />
    <main class="content">
      <EvaluationMethodModal page :weights="weights" @close="router.push('/favorite-home')" />
    </main>
  </div>
</template>

<style scoped>
.property-detail {
  min-height: 100vh;
  background: #fafafa;
}

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 40px 56px;
}

@media (max-width: 760px) {
  .content {
    padding: 18px 16px 36px;
  }
}
</style>
