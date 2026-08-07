import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import propertyRecommendationApi from "@/api/propertyRecommendation";
import surveyApi from "@/api/survey";
import { useSurveyStore } from "@/stores/survey";
import { MESSAGES } from "@/utils/surveyValidation";
import SurveyStep7 from "./SurveyStep7.vue";

vi.mock("@/api/survey", () => ({
  default: { calculate: vi.fn() },
}));

// 목으로 고정하지 않으면 jsdom이 실제 백엔드로 XHR을 날려 테스트가 환경을 탄다.
vi.mock("@/api/propertyRecommendation", () => ({
  default: { regionCounts: vi.fn() },
}));

/** 서버가 알려주는 지역별 매물 수. 개수 순서와 이름 순서가 다르게 잡아둔다. */
const REGION_COUNTS = [
  { sidoName: "서울", sigunguName: "강남구", count: 342 },
  { sidoName: "서울", sigunguName: "송파구", count: 999 },
  { sidoName: "서울", sigunguName: "노원구", count: 500 },
  { sidoName: "경기도", sigunguName: "남양주시", count: 78 },
  { sidoName: "경기도", sigunguName: "수원시", count: 120 },
];

function chipByName(wrapper, name) {
  return wrapper
    .findAll("button.region-chip")
    .find((b) => b.text().startsWith(name));
}

describe("SurveyStep7", () => {
  let survey;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    surveyApi.calculate.mockResolvedValue(null);
    propertyRecommendationApi.regionCounts.mockResolvedValue(REGION_COUNTS);
    survey = useSurveyStore();
  });

  it("서울을 기본으로 보여주고 매물 수를 함께 노출한다", async () => {
    const wrapper = mount(SurveyStep7);
    await flushPromises();

    expect(wrapper.text()).toContain("어느 지역에서");
    expect(wrapper.text()).toContain(
      "숫자는 예산·평수에 맞는 매물 수예요 · 여러 곳 함께 골라도 돼요",
    );
    expect(chipByName(wrapper, "강남구").text()).toContain("342");
  });

  it("설문에서 산출한 예산과 고른 평수로 매물 수를 요청한다", async () => {
    survey.expectedSalePrice = 720_000_000;
    survey.purchasePrice = 580_000_000;
    survey.holdingYears = 7;
    survey.residenceYears = 7;
    survey.isRegulatedArea = false;
    survey.reserveAmount = 150_000_000;
    survey.desiredAreaCode = "60_85";

    mount(SurveyStep7);
    await flushPromises();

    expect(propertyRecommendationApi.regionCounts).toHaveBeenCalledWith(
      survey.maxPurchaseBudget,
      { min: 60, max: 85 },
    );
    expect(propertyRecommendationApi.regionCounts.mock.calls[0][0]).toBeGreaterThan(0);
  });

  it("시군구는 매물 수와 무관하게 가나다순으로 늘어선다", async () => {
    const wrapper = mount(SurveyStep7);
    await flushPromises();

    const names = wrapper
      .findAll(".sigungu-grid .region-chip")
      .map((b) => b.text().replace(/[0-9]/g, ""));

    // 송파구(999) > 노원구(500) > 강남구(342)지만 이름순이 우선이다.
    expect(names.slice(0, 3)).toEqual(["강남구", "강동구", "강북구"]);
    expect(names.indexOf("강남구")).toBeLessThan(names.indexOf("송파구"));
  });

  it("매물이 0개인 지역도 목록에 남기되 고를 수 없게 한다", async () => {
    const wrapper = mount(SurveyStep7);
    await flushPromises();

    // REGION_COUNTS 에 없는 서울 구들은 0건이다.
    const soldOut = chipByName(wrapper, "구로구");
    expect(soldOut).toBeDefined();
    expect(soldOut.classes()).toContain("sold-out");
    expect(soldOut.attributes("disabled")).toBeDefined();

    await soldOut.trigger("click");
    expect(survey.desiredRegions).toHaveLength(0);
  });

  it("매물이 있는 지역은 그대로 고를 수 있다", async () => {
    const wrapper = mount(SurveyStep7);
    await flushPromises();

    const available = chipByName(wrapper, "강남구");
    expect(available.classes()).not.toContain("sold-out");

    await available.trigger("click");
    expect(survey.desiredRegions).toHaveLength(1);
  });

  it("시도를 바꾸면 시군구 목록이 갈린다", async () => {
    const wrapper = mount(SurveyStep7);
    await flushPromises();

    expect(chipByName(wrapper, "남양주시")).toBeUndefined();

    await chipByName(wrapper, "경기도").trigger("click");

    expect(chipByName(wrapper, "남양주시").text()).toContain("78");
    expect(chipByName(wrapper, "강남구")).toBeUndefined();
  });

  it("시군구를 고르면 선택 배너를 띄운다", async () => {
    const wrapper = mount(SurveyStep7);

    await chipByName(wrapper, "경기도").trigger("click");
    await chipByName(wrapper, "남양주시").trigger("click");

    expect(wrapper.find(".selection-banner").text()).toBe(
      "남양주시 선택하셨어요",
    );
    expect(survey.desiredRegions).toEqual([
      { sidoName: "경기도", sigunguName: "남양주시", eupmyeondongName: null },
    ]);
  });

  it("여러 곳을 고르면 개수를 함께 알려준다", async () => {
    const wrapper = mount(SurveyStep7);

    await chipByName(wrapper, "경기도").trigger("click");
    await chipByName(wrapper, "남양주시").trigger("click");
    await chipByName(wrapper, "수원시").trigger("click");

    expect(wrapper.find(".selection-banner").text()).toBe(
      "남양주시 외 1곳 선택하셨어요",
    );
  });

  it("다시 누르면 선택이 해제된다", async () => {
    const wrapper = mount(SurveyStep7);

    await chipByName(wrapper, "강남구").trigger("click");
    await chipByName(wrapper, "강남구").trigger("click");

    expect(survey.desiredRegions).toHaveLength(0);
    expect(wrapper.find(".selection-banner").exists()).toBe(false);
  });

  it("아무 곳도 고르지 않으면 오류 문구를 띄운다", async () => {
    const wrapper = mount(SurveyStep7);

    await wrapper.find("button.primary-btn").trigger("click");

    expect(wrapper.text()).toContain(MESSAGES.desiredRegions);
    expect(surveyApi.calculate).not.toHaveBeenCalled();
    expect(wrapper.emitted("searching")).toBeUndefined();
  });

  it("한 곳 이상 고르면 완료 처리하고 searching을 emit한다", async () => {
    const wrapper = mount(SurveyStep7);

    await chipByName(wrapper, "강남구").trigger("click");
    await wrapper.find("button.primary-btn").trigger("click");

    expect(survey.desiredRegions).toEqual([
      { sidoName: "서울", sigunguName: "강남구", eupmyeondongName: null },
    ]);
    expect(survey.done).toBe(true);
    expect(wrapper.emitted("searching")).toHaveLength(1);
  });

  it("제출하면 백엔드 확정 계산까지 요청한다", async () => {
    const wrapper = mount(SurveyStep7);
    survey.purchasePrice = 580_000_000;
    survey.expectedSalePrice = 720_000_000;
    survey.holdingYears = 7;
    survey.residenceYears = 7;
    survey.isRegulatedArea = false;
    survey.reserveAmount = 150_000_000;
    survey.profileCode = "SAFETY_FIRST";

    await chipByName(wrapper, "강남구").trigger("click");
    await wrapper.find("button.primary-btn").trigger("click");
    await flushPromises();

    expect(surveyApi.calculate).toHaveBeenCalledWith({
      acquisitionPrice: 580_000_000,
      transferPrice: 720_000_000,
      holdingYears: 7,
      residenceYears: 7,
      regulatedArea: false,
      hasMortgage: false,
      mortgageBalance: null,
      requiredReserve: 150_000_000,
      recommendationType: "SAFETY_FIRST",
    });
  });
});
