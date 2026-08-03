import { http } from "./http";

export default {
  /** 계산만 한다. 저장하지 않으므로 로그인 없이도 호출할 수 있다. */
  calculate(payload) {
    return http.post("/api/survey/calculate", payload).then((res) => res.data);
  },

  /**
   * 설문 답변과 계산 결과를 저장하고 설문을 마감한다. 로그인 필요.
   * 응답의 calculation은 calculate()가 주는 것과 같은 형태다.
   */
  submit(payload) {
    return http.post("/api/survey/submit", payload).then((res) => res.data);
  },

  /** 가장 최근 완료 설문. 완료한 설문이 없으면 404. */
  findLatest(userId) {
    return http.get(`/api/survey/${userId}`).then((res) => res.data);
  },
};
