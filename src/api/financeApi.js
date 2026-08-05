import { http } from './http'

export function fetchFavoriteProducts(surveyId) {
  return http.get('/api/finance/favorites', { params: { surveyId } })
    .then((res) => res.data);
}

export function saveAllocations(surveyId, allocations) {
  return http.patch('/api/finance/favorites/allocations', { surveyId, allocations });
}
