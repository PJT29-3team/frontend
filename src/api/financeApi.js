import client from './client';

export function fetchFavoriteProducts(surveyId) {
  return client.get('/finance/favorites', { params: { surveyId } })
    .then((res) => res.data);
}

export function saveAllocations(surveyId, allocations) {
  return client.patch('/finance/favorites/allocations', { surveyId, allocations });
}
