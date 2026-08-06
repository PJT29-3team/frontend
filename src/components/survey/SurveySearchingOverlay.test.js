import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import SurveySearchingOverlay from "./SurveySearchingOverlay.vue";

describe("SurveySearchingOverlay", () => {
  it.each([
    [0, "조건에 맞는 동네부터 찾고 있어요"],
    [25, "후보 매물들 하나씩 살펴보는 중이에요"],
    [50, "안전·편리·자산 점수 매기고 있어요"],
    [75, "안전·편리·자산 점수 매기고 있어요"],
    [100, "딱 맞는 곳 골랐어요!"],
  ])("%i%%에는 해당 구간 메시지를 보여준다", (progress, message) => {
    const wrapper = mount(SurveySearchingOverlay, { props: { progress } });

    expect(wrapper.find(".searching-message").text()).toBe(message);
    expect(wrapper.find(".searching-percent").text()).toBe(`${progress}%`);
  });

  it("진행률만큼 막대를 채운다", () => {
    const wrapper = mount(SurveySearchingOverlay, { props: { progress: 75 } });

    expect(wrapper.find(".searching-fill").attributes("style")).toContain(
      "width: 75%",
    );
  });

  it("고정 문구가 함께 나온다", () => {
    const wrapper = mount(SurveySearchingOverlay, { props: { progress: 0 } });

    expect(wrapper.text()).toContain("곧 결과를 보여드릴게요");
    expect(wrapper.find(".searching-icon").text()).toBe("🔍");
  });
});
