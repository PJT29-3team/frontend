import { http } from './http'

export default {
  submit({ surveyId, fundingAmount, immediateExpense, monthlyNeed, safetyLevel }) {
    return http
      .post('/api/finance/recommendations', {
        surveyId,
        fundingAmount,
        immediateExpense,
        monthlyNeed,
        safetyLevel,
      })
      .then((res) => res.data);
  },
  // 마지막으로 저장된 추천 조건. 조건이 없으면 204라 res.data가 빈 문자열로 온다.
  getLatestPreference() {
    return http
      .get('/api/finance/preferences/latest')
      .then((res) => (res.status === 204 || !res.data ? null : res.data));
  },
  logFavorites(payload) {
    return http.post('/api/finance/favorites', payload).then((res) => res.data);
  },
  getProductDetail(productType, kind) {
    return http
      .get('/api/finance/product-detail', {
        params: { productType, kind },
      })
      .then((res) => res.data);
  },
  logInteraction(payload) {
    return http.post('/api/finance/interactions', payload).then((res) => res.data);
  },
};
