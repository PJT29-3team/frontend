import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSurveyStore } from "@/stores/survey";
import SurveyView from "./SurveyView.vue";

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useRoute: () => ({ query: {} }),
}));

vi.mock("@/api/survey", () => ({
  default: { calculate: vi.fn(), submit: vi.fn(), findLatest: vi.fn() },
}));

vi.mock("@/api/propertyRecommendation", () => ({
  default: { regionCounts: vi.fn().mockResolvedValue([]) },
}));

describe("SurveyView 전역 엔터", () => {
  let survey;
  let wrapper;

  beforeEach(async () => {
    setActivePinia(createPinia());
    survey = useSurveyStore();
    // primary-btn 을 document.querySelector 로 찾으므로 실제 DOM 에 붙인다.
    wrapper = mount(SurveyView, { attachTo: document.body });
    await flushPromises();

    // 2단계(보유·거주기간 드롭다운)로 이동. 이 단계에는 input 이 없어
    // 전역 엔터 처리가 없으면 엔터로 넘어갈 방법이 없다.
    survey.showIntro = false;
    survey.stepIndex = 1;
    await flushPromises();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  function pressEnter() {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
  }

  it("입력칸이 없는 단계에서도 엔터로 다음 단계로 넘어간다", async () => {
    survey.holdingYears = 7;
    survey.residenceYears = 7;
    survey.isRegulatedArea = false;
    // 스토어 값을 단계 컴포넌트가 새로 읽도록 다시 그린다.
    survey.stepIndex = 0;
    await flushPromises();
    survey.stepIndex = 1;
    await flushPromises();

    pressEnter();
    await flushPromises();

    expect(survey.stepIndex).toBe(2);
  });

  it("값을 채우지 않았으면 엔터를 눌러도 머문다", async () => {
    pressEnter();
    await flushPromises();

    expect(survey.stepIndex).toBe(1);
  });

  it("인트로 화면에서는 엔터가 아무것도 하지 않는다", async () => {
    survey.showIntro = true;
    await flushPromises();

    pressEnter();
    await flushPromises();

    expect(survey.showIntro).toBe(true);
    expect(survey.stepIndex).toBe(1);
  });
});
