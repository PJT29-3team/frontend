import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as propertyApi from '../api/propertyApi'

export const usePropertyStore = defineStore('property', () => {
  const properties = ref([])
  const condition = ref({ budget: null, region: null, priority: null })
  const isLoading = ref(false)
  const error = ref('')

  async function fetchRecommended(overrideCondition) {
    if (overrideCondition) {
      condition.value = { ...condition.value, ...overrideCondition }
    }
    isLoading.value = true
    error.value = ''
    try {
      properties.value = await propertyApi.getRecommendedProperties(condition.value)
    } catch (err) {
      error.value = '추천 매물을 불러오지 못했습니다.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  function setCondition(nextCondition) {
    condition.value = { ...condition.value, ...nextCondition }
  }

  return {
    properties,
    condition,
    isLoading,
    error,
    fetchRecommended,
    setCondition,
  }
})
