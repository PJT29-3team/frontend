import { http } from './http'

export async function getFavoriteProperties() {
  const response = await http.get('/api/favorite-properties')
  return response.data
}

export async function addFavoriteProperty(propertyId) {
  const response = await http.post('/api/favorite-properties', { propertyId })
  return response.data
}

export async function removeFavoriteProperty(externalPropertyKey) {
  await http.delete(`/api/favorite-properties/${externalPropertyKey}`)
}
