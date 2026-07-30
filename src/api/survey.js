import { http } from "./http";

export default {
  calculate(payload) {
    return http.post("/api/survey/calculate", payload).then((res) => res.data);
  },
};
