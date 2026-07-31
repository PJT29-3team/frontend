<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateDesiredRegions } from "@/utils/surveyValidation";
import { SIDO_LIST, SIGUNGU_BY_SIDO } from "@/constants/regions";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const sido = ref(SIDO_LIST[0]);
const submitted = ref(false);

const sigunguList = computed(() => SIGUNGU_BY_SIDO[sido.value] || []);

const errors = computed(() =>
  validateDesiredRegions({ desiredRegions: survey.desiredRegions }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

const shownError = computed(() =>
  submitted.value ? errors.value.desiredRegions || "" : "",
);

const selectionText = computed(() => {
  const picked = survey.desiredRegions;
  if (picked.length === 0) return "";
  const [first] = picked;
  return picked.length === 1
    ? `${first.sigunguName} 선택하셨어요`
    : `${first.sigunguName} 외 ${picked.length - 1}곳 선택하셨어요`;
});

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.submitSurvey(survey.desiredRegions);
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">어느 지역에서<br />새 집을 찾아볼까요?</h2>
    <p class="step-desc">
      매물 많은 순으로 보여드려요 · 여러 곳 함께 골라도 돼요
    </p>

    <div class="d-flex gap-2">
      <button
        v-for="s in SIDO_LIST"
        :key="s"
        type="button"
        class="region-chip flex-grow-1"
        :class="{ on: sido === s }"
        :aria-pressed="sido === s"
        @click="sido = s"
      >
        {{ s }}
      </button>
    </div>

    <div class="d-flex gap-2 flex-wrap mt-3">
      <button
        v-for="g in sigunguList"
        :key="g.name"
        type="button"
        class="region-chip"
        :class="{ on: survey.isRegionSelected(sido, g.name) }"
        :aria-pressed="survey.isRegionSelected(sido, g.name)"
        @click="survey.toggleRegion(sido, g.name)"
      >
        {{ g.name }}<span class="region-count">{{ g.count }}</span>
      </button>
    </div>

    <div v-if="selectionText" class="selection-banner">
      {{ selectionText }}
    </div>

    <div v-if="shownError" class="invalid-feedback d-block mt-2">
      {{ shownError }}
    </div>

    <div class="btn-row">
      <button type="button" class="secondary-btn" @click="emit('prev')">
        이전
      </button>
      <button
        type="button"
        class="primary-btn"
        :disabled="submitted && !isValid"
        @click="submit"
      >
        다음
      </button>
    </div>
  </div>
</template>
