import { http } from './http';

/**
 * 설문 API.
 *
 * 현재 백엔드에 구현된 설문 엔드포인트는 계산 API 하나뿐이다.
 * 답변은 Pinia에 모아두었다가 마지막 단계에서 한 번에 보낸다(CLAUDE.md 규칙).
 *
 * 설문 영속화 API(POST/GET /surveys/*)가 생기면 여기에 함수를 추가하고
 * 스토어의 save* 액션에서 호출하면 된다.
 */
export default {
  /**
   * POST /api/survey/calculate
   *
   * 요청: SurveyCalculationRequest
   *   { acquisitionPrice, transferPrice, holdingYears, residenceYears,
   *     regulatedArea, hasMortgage, mortgageBalance, requiredReserve, recommendationType }
   * 응답: SurveyCalculationResponse
   *   { capitalGainsTax, brokerageFee, transferPrice, mortgageRepayment,
   *     netProceeds, availableAsset, weights }
   *
   * 백엔드 CORS가 /api/** 에 Authorization·Content-Type만 허용하므로
   * X-User-Id를 붙이는 client 대신 JWT 클라이언트(http)를 쓴다.
   */
  calculate(payload) {
    return http.post('/api/survey/calculate', payload).then((res) => res.data);
  },
};
