import { http } from './http'

export async function getRecommendedProperties(params) {
  const response = await http.get('/api/properties/recommended', { params })
  return response.data
}

export async function getPropertyDetail(externalPropertyKey) {
  const response = await http.get(`/api/properties/${externalPropertyKey}`)
  return response.data
}
