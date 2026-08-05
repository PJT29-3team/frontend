import { http } from "./http";

export default {
  /**
   * 미리 산출해 둔 페르소나 점수로 매물을 추천받는다. 로그인해야 호출할 수 있다.
   *
   * @param {number} budget 설문에서 산출한 여유자산(원). 이 금액을 넘는 매물은 제외된다.
   * @param {string} type 추천 유형 (SAFETY_FIRST / CONVENIENCE_FIRST / VALUE_STABILITY / BALANCED)
   * @param {Array<{sidoName: string, sigunguName: string}>} regions
   *        희망지역. 비우면 지역을 가리지 않는다.
   * @param {number} limit 추천 개수
   */
  list({ budget, type, regions = [], limit = 20 }) {
    const params = new URLSearchParams();
    params.set("budget", budget);
    params.set("type", type);
    params.set("limit", limit);
    // 백엔드는 시도:시군구 형식을 여러 번 받는다. 시군구명만으로는 시도가 다른 동명이 지역과 섞인다.
    regions.forEach((r) => params.append("region", `${r.sidoName}:${r.sigunguName}`));

    return http.get(`/api/recommendations?${params}`).then((res) => res.data);
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
};
