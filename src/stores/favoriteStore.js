import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import * as favoriteApi from '../api/favoriteApi'

export const MAX_FAVORITE_COUNT = 3

function keyOf(property) {
  return property.propertyId ?? property.externalPropertyKey
}

export const useFavoriteStore = defineStore('favorite', () => {
  const favorites = ref([])
  const pendingIds = ref(new Set())
  const toast = ref({ visible: false, message: '', tone: 'success' })

  const isLimitReached = computed(() => favorites.value.length >= MAX_FAVORITE_COUNT)

  async function fetchFavorites() {
    favorites.value = await favoriteApi.getFavoriteProperties()
  }

  function isFavorite(propertyId) {
    return favorites.value.some((item) => keyOf(item) === propertyId)
  }

  function isPending(propertyId) {
    return pendingIds.value.has(propertyId)
  }

  function showToast(message, tone = 'success') {
    toast.value = { visible: true, message, tone }
  }

  function hideToast() {
    toast.value.visible = false
  }

  async function addFavorite(property) {
    const propertyId = keyOf(property)
    if (isFavorite(propertyId) || isPending(propertyId)) return

    if (isLimitReached.value) {
      showToast('관심 매물은 최대 3개까지 담을 수 있어요', 'warning')
      return
    }

    pendingIds.value.add(propertyId)
    favorites.value.push(property)
    try {
      await favoriteApi.addFavoriteProperty(propertyId)
      showToast('관심 매물에 저장했어요', 'success')
    } catch (err) {
      favorites.value = favorites.value.filter((item) => keyOf(item) !== propertyId)
      showToast('관심 매물 저장에 실패했어요', 'danger')
      throw err
    } finally {
      pendingIds.value.delete(propertyId)
    }
  }

  async function removeFavorite(propertyId) {
    if (isPending(propertyId)) return
    const removedIndex = favorites.value.findIndex((item) => keyOf(item) === propertyId)
    if (removedIndex === -1) return
    const [removed] = favorites.value.splice(removedIndex, 1)

    pendingIds.value.add(propertyId)
    try {
      await favoriteApi.removeFavoriteProperty(propertyId)
    } catch (err) {
      favorites.value.splice(removedIndex, 0, removed)
      showToast('관심 매물 해제에 실패했어요', 'danger')
      throw err
    } finally {
      pendingIds.value.delete(propertyId)
    }
  }

  return {
    favorites,
    toast,
    isLimitReached,
    fetchFavorites,
    isFavorite,
    isPending,
    addFavorite,
    removeFavorite,
    showToast,
    hideToast,
  }
})
