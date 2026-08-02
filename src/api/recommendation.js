import client from './client';

/**
 * FPR 금융상품 추천 API. 백엔드 com.jiphyeonjeon.finance 와 계약 일치.
 * baseURL(VITE_API_BASE_URL=http://localhost:8080) + 아래 경로.
 * 인증: 공용 client가 X-User-Id 자동 첨부(개발 스텁).
 */
export default {
  /**
   * 조건 제출(투자비율) → 기간 구간별 추천 결과.
   * 신설계: 안전도/기간은 선택하지 않음(위험도=태그, 기간=결과에서 구간별).
   * @returns { investAmount, remainingCash, investRatio,
   *            periods: [{ code, label, hint, products[] }] }
   */
  submit({ surveyId, fundingAmount, investRatio }) {
    return client
      .post('/api/finance/recommendations', { surveyId, fundingAmount, investRatio })
      .then((res) => res.data);
  },
};
