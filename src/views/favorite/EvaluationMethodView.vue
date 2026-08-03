<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
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
  <EvaluationMethodModal page :weights="weights" @close="router.push('/favorite-home')" />
</template>
