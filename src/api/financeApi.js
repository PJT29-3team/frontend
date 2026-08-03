import client from './client';

const MOCK = [
  { favoriteId: 1, productName: '신한 정기적금', institutionName: '신한은행', termMonths: 6, annualRate: '3.10', maxAnnualRate: '3.50', productRiskGrade: '매우 낮은 위험', fixed: true },
  { favoriteId: 2, productName: 'KODEX 27-12 은행채(AAA)', institutionName: '삼성자산운용', termMonths: 16, annualRate: '3.55', maxAnnualRate: null, productRiskGrade: '낮은 위험', fixed: true },
  { favoriteId: 3, productName: '미래에셋 목표만기2030 채권형', institutionName: '미래에셋자산운용', termMonths: 49, annualRate: '5.20', maxAnnualRate: null, productRiskGrade: '보통 위험', fixed: true },
];

export function fetchFavoriteProducts(surveyId) {
  // ponytail: 백엔드 미구동 시 mock 폴백. Vite SPA 폴백이 HTML 200을 주므로 배열 체크.
  return client.get('/finance/favorites', { params: { surveyId } })
    .then((res) => Array.isArray(res.data) ? res.data : MOCK)
    .catch(() => MOCK);
}

export function saveAllocations(surveyId, allocations) {
  return client.patch('/finance/favorites/allocations', { surveyId, allocations });
}
