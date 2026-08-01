import client from './client';

/**
 * FPR 금융상품 추천 API.
 * 백엔드 finance 모듈이 아직 준비 전이라, 지금은 요청/응답 계약(shape)만 확정해 둔다.
 * 화면은 당분간 mock으로 동작하고, 백엔드 연결 시 이 모듈을 호출한다.
 *
 * 인증: 공용 client가 X-User-Id 헤더를 자동으로 붙인다(개발 스텁).
 * 경로 주의: baseURL(VITE_API_BASE_URL) 뒤에 /api 접두가 붙는지는 팀 확정 필요.
 *           백엔드 컨트롤러는 /api/finance/... 네임스페이스를 사용한다.
 */
export default {
  // 조건 제출 → 추천 결과. body는 financial_investment_profiles와 매핑.
  // 응답(예정): { investAmount, remainingCash, condition, products: [...] }
  submit({ ratioPercent, riskLevel, periodCode }) {
    return client
      .post('/api/finance/recommendations', { ratioPercent, riskLevel, periodCode })
      .then((res) => res.data);
  },
};
