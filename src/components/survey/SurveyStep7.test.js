import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import surveyApi from "@/api/survey";
import { useSurveyStore } from "@/stores/survey";
import { MESSAGES } from "@/utils/surveyValidation";
import SurveyStep7 from "./SurveyStep7.vue";

vi.mock("@/api/survey", () => ({
  default: { calculate: vi.fn() },
}));

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
    survey = useSurveyStore();
  });

  it("서울을 기본으로 보여주고 매물 수를 함께 노출한다", () => {
    const wrapper = mount(SurveyStep7);

    expect(wrapper.text()).toContain("어느 지역에서");
    expect(wrapper.text()).toContain(
      "매물 많은 순으로 보여드려요 · 여러 곳 함께 골라도 돼요",
    );
    expect(chipByName(wrapper, "강남구").text()).toContain("342");
  });

  it("시도를 바꾸면 시군구 목록이 갈린다", async () => {
    const wrapper = mount(SurveyStep7);

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
    expect(wrapper.emitted("next")).toBeUndefined();
  });

  it("한 곳 이상 고르면 완료 처리하고 next를 emit한다", async () => {
    const wrapper = mount(SurveyStep7);

    await chipByName(wrapper, "강남구").trigger("click");
    await wrapper.find("button.primary-btn").trigger("click");

    expect(survey.desiredRegions).toEqual([
      { sidoName: "서울", sigunguName: "강남구", eupmyeondongName: null },
    ]);
    expect(survey.done).toBe(true);
    expect(wrapper.emitted("next")).toHaveLength(1);
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
