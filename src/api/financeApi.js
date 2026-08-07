import { http } from './http'

// 사용자 식별은 서버가 JWT에서 판단한다. userId/surveyId를 보내지 않는다.
export function fetchFavoriteProducts() {
  return http.get('/api/finance/favorites').then((res) => res.data);
}

export function saveAllocations(allocations) {
  return http.patch('/api/finance/favorites/allocations', { allocations });
}
