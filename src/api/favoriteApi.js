import { http } from './http'

export async function getFavoriteProperties() {
  const response = await http.get('/api/favorite-properties')
  return response.data
}

export async function getFavoriteEvaluation() {
  const response = await http.get('/api/favorite-properties/evaluation')
  return response.data
}

// 추천 매물 화면에서 사용자가 직접 관심 매물을 담을 때 호출한다.
export async function addFavoriteProperty(houseId) {
  await http.post('/api/favorite-properties', { houseId })
}

export async function selectFavoriteProperty(houseId) {
  await http.patch(`/api/favorite-properties/${houseId}/selection`)
}

export async function removeFavoriteProperty(houseId) {
  await http.delete(`/api/favorite-properties/${houseId}`)
}
