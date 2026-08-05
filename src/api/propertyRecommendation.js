import { http } from "./http";

export default {
  /**
   * 로그인한 사용자의 완료된 설문(예산/성향/희망지역)을 서버가 조회해서 추천한다.
   * 로그인 필수이며, 완료된 설문이 없으면 400으로 실패한다.
   *
   * @returns {Promise<Array<{
   *   id: number, rank: number, name: string, price: string, priceNum: number,
   *   address: string, score: number, size: number, buildYear: number, buildMonth: number,
   *   floors: number, buildingCount: number, householdCount: number,
   *   latitude: number, longitude: number, remainingAmount: number
   * }>>}
   */
  list() {
    return http.get("/api/recommendations").then((res) => res.data);
  },

  /**
   * 지역별 추천 가능한 매물 수.
   * 희망지역 선택 화면이 설문 예산으로 살 수 있는 매물이 몇 개인지 보여주는 데 쓴다.
   *
   * @param {number} [budget] 설문에서 산출한 여유자산(원). 주면 그 안의 매물만 센다.
   * @returns {Promise<Array<{sidoName: string, sigunguName: string, count: number}>>}
   */
  regionCounts(budget) {
    const params = budget != null ? `?budget=${budget}` : "";
    return http.get(`/api/recommendations/region-counts${params}`).then((res) => res.data);
  },

  /** 매물 상세(안전/편의/자산 평가, AI 요약 포함). 로그인 필수. */
  detail(houseId) {
    return http.get(`/api/recommendations/${houseId}`).then((res) => res.data);
  },
};
