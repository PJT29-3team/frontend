import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { STEP_ORDER, stepIndexOf, useSurveyStore } from "@/stores/survey";
import SurveyStepArea from "./SurveyStepArea.vue";

function optionByLabel(wrapper, label) {
  return wrapper
    .findAll("button.area-option")
    .find((b) => b.text().startsWith(label));
}

describe("SurveyStepArea", () => {
  let survey;

  beforeEach(() => {
    setActivePinia(createPinia());
    survey = useSurveyStore();
    survey.stepIndex = stepIndexOf("DESIRED_AREA");
  });

  it("평수 구간과 ㎡ 안내를 함께 보여준다", () => {
    const wrapper = mount(SurveyStepArea);

    expect(wrapper.text()).toContain("20~30평대");
    expect(wrapper.text()).toContain("60~85㎡");
    expect(wrapper.text()).toContain("상관없어요");
  });

  it("고르면 스토어에 저장하고 다음 단계로 넘어간다", async () => {
    const wrapper = mount(SurveyStepArea);

    await optionByLabel(wrapper, "20~30평대").trigger("click");
    await wrapper.find("button.primary-btn").trigger("click");

    expect(survey.desiredAreaCode).toBe("60_85");
    expect(STEP_ORDER[survey.stepIndex]).toBe("DESIRED_REGION");
    expect(wrapper.emitted("next")).toHaveLength(1);
  });

  it("고르지 않으면 오류 문구를 띄우고 머문다", async () => {
    const wrapper = mount(SurveyStepArea);

    await wrapper.find("button.primary-btn").trigger("click");

    expect(wrapper.text()).toContain("평수를 선택해주세요.");
    expect(survey.desiredAreaCode).toBeNull();
    expect(STEP_ORDER[survey.stepIndex]).toBe("DESIRED_AREA");
  });

  it("'상관없어요'도 선택으로 인정한다", async () => {
    const wrapper = mount(SurveyStepArea);

    await optionByLabel(wrapper, "상관없어요").trigger("click");
    await wrapper.find("button.primary-btn").trigger("click");

    expect(survey.desiredAreaCode).toBe("ANY");
    expect(wrapper.emitted("next")).toHaveLength(1);
  });
});
