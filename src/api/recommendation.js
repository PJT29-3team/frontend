import client from './client';

/**
 * FPR 금융상품 추천 API. 백엔드 com.jiphyeonjeon.finance 와 계약 일치.
 * baseURL(VITE_API_BASE_URL=http://localhost:8080) + 아래 경로.
 * 인증: 공용 client가 X-User-Id 자동 첨부(개발 스텁).
 */
export default {
  /**
   * 조건 제출 → 맞춤추천 결과.
   * @returns { investAmount, remainingCash, safetyLevel, investPeriod, investRatio, products[] }
   */
  submit({ surveyId, fundingAmount, investRatio, safetyLevel, investPeriod }) {
    return client
      .post('/api/finance/recommendations', {
        surveyId,
        fundingAmount,
        investRatio,
        safetyLevel,
        investPeriod,
      })
      .then((res) => res.data);
  },
};
