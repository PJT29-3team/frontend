import client from './client';

/**
 * FPR 금융상품 추천 API. 백엔드 com.jiphyeonjeon.finance 와 계약 일치.
 * baseURL(VITE_API_BASE_URL=http://localhost:8080) + 아래 경로.
 * 인증: 공용 client가 X-User-Id 자동 첨부(개발 스텁).
 */
export default {
  /**
   * 조건 제출(즉시지출 + 매달쓸돈 + 위험도) → 기간 구간별 추천 결과.
   * 투자금액 = 여유자금 − 즉시지출. 소프트 필터: 선택 위험도 위주로 추천하되 구간이 비면 전 등급 폴백.
   * @returns { investAmount, remainingCash, immediateExpense, monthlyNeed, safetyLevel,
   *            periods: [{ code, label, hint, fallback, products[] }] }
   */
  submit({ surveyId, fundingAmount, immediateExpense, monthlyNeed, safetyLevel }) {
    return client
      .post('/api/finance/recommendations', {
        surveyId,
        fundingAmount,
        immediateExpense,
        monthlyNeed,
        safetyLevel,
      })
      .then((res) => res.data);
  },
};
