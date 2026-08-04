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
};
