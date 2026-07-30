<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateHoldingPeriod } from "@/utils/surveyValidation";
import {
  REGULATED_AREAS,
  TAX_DISCLAIMER,
  YEAR_OPTIONS,
} from "@/constants/regions";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const holdingYears = ref(survey.holdingYears);
const residenceYears = ref(survey.residenceYears);
const isRegulatedArea = ref(survey.isRegulatedArea);
const submitted = ref(false);

const errors = computed(() =>
  validateHoldingPeriod({
    holdingYears: holdingYears.value,
    residenceYears: residenceYears.value,
    isRegulatedArea: isRegulatedArea.value,
  }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

function shownError(field) {
  return submitted.value ? errors.value[field] || "" : "";
}

function toYears(event) {
  const raw = event.target.value;
  return raw === "" ? null : Number(raw);
}

function onHoldingChange(event) {
  holdingYears.value = toYears(event);
}

function onResidenceChange(event) {
  residenceYears.value = toYears(event);
}

function onRegulatedChange(event) {
  const raw = event.target.value;
  isRegulatedArea.value = raw === "" ? null : raw === "true";
}

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.saveHoldingPeriod({
    holdingYears: holdingYears.value,
    residenceYears: residenceYears.value,
    isRegulatedArea: isRegulatedArea.value,
  });
  emit("next");
}
</script>

<template>
  <div>
    <p class="info-banner">
      1세대 1주택 비과세·양도소득세 계산을 위해 필요한 정보예요
    </p>

    <h2 class="step-title">내집에 대해서 좀더 알려주세요</h2>

    <div class="mb-4">
      <label for="survey-holding-years" class="form-label survey-label">
        보유기간
      </label>
      <select
        id="survey-holding-years"
        class="form-select survey-select"
        :class="{ 'is-invalid': !!shownError('holdingYears') }"
        :value="holdingYears === null ? '' : String(holdingYears)"
        @change="onHoldingChange"
      >
        <option value="">선택해주세요</option>
        <option v-for="o in YEAR_OPTIONS" :key="o.value" :value="o.value">
          {{ o.label }}
        </option>
      </select>
      <div v-if="shownError('holdingYears')" class="invalid-feedback d-block">
        {{ shownError("holdingYears") }}
      </div>
    </div>

    <div class="mb-4">
      <label for="survey-residence-years" class="form-label survey-label">
        거주기간
      </label>
      <select
        id="survey-residence-years"
        class="form-select survey-select"
        :class="{ 'is-invalid': !!shownError('residenceYears') }"
        :value="residenceYears === null ? '' : String(residenceYears)"
        @change="onResidenceChange"
      >
        <option value="">선택해주세요</option>
        <option v-for="o in YEAR_OPTIONS" :key="o.value" :value="o.value">
          {{ o.label }}
        </option>
      </select>
      <div v-if="shownError('residenceYears')" class="invalid-feedback d-block">
        {{ shownError("residenceYears") }}
      </div>
    </div>

    <div class="mb-2">
      <label for="survey-regulated-area" class="form-label survey-label">
        조정대상지역 주택인가요?
      </label>
      <select
        id="survey-regulated-area"
        class="form-select survey-select"
        :class="{ 'is-invalid': !!shownError('isRegulatedArea') }"
        :value="isRegulatedArea === null ? '' : String(isRegulatedArea)"
        @change="onRegulatedChange"
      >
        <option value="">선택해주세요</option>
        <option value="false">아니요</option>
        <option value="true">예</option>
      </select>
      <div
        v-if="shownError('isRegulatedArea')"
        class="invalid-feedback d-block"
      >
        {{ shownError("isRegulatedArea") }}
      </div>
    </div>

    <div class="footnote">
      <strong>조정대상지역</strong>
      <div v-for="line in REGULATED_AREAS" :key="line">{{ line }}</div>
    </div>

    <div class="disclaimer">
      <p v-for="line in TAX_DISCLAIMER" :key="line">{{ line }}</p>
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
