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
   * 지역별 추천 가능한 단지 수.
   * 희망지역 선택 화면이 실제 적재량을 보여주는 데 쓴다.
   *
   * @returns {Promise<Array<{sidoName: string, sigunguName: string, count: number}>>}
   */
  regionCounts() {
    return http.get("/api/recommendations/region-counts").then((res) => res.data);
  },

  /** 매물 상세(안전/편의/자산 평가, AI 요약 포함). 로그인 필수. */
  detail(houseId) {
    return http.get(`/api/recommendations/${houseId}`).then((res) => res.data);
  },
};
