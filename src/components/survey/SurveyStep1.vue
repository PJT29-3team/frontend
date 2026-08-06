<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateSalePrice } from "@/utils/surveyValidation";
import AmountField from "./AmountField.vue";

const survey = useSurveyStore();

/** 네이버페이 부동산 시세 조회. 설문 입력 중에 참고할 수 있게 새 탭으로 연다. */
const PRICE_LOOKUP_URL = "https://new.land.naver.com/";
const emit = defineEmits(["next", "prev"]);

const purchasePrice = ref(survey.purchasePrice);
const expectedSalePrice = ref(survey.expectedSalePrice);
const submitted = ref(false);

const errors = computed(() =>
  validateSalePrice({
    purchasePrice: purchasePrice.value,
    expectedSalePrice: expectedSalePrice.value,
  }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

function shownError(field) {
  return submitted.value ? errors.value[field] || "" : "";
}

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.saveSalePrice({
    purchasePrice: purchasePrice.value,
    expectedSalePrice: expectedSalePrice.value,
  });
  emit("next");
}

/** 엔터: 비어 있는 다음 칸으로 옮기고, 다 채웠으면 다음 단계로 넘어간다. */
function onEnter() {
  if (purchasePrice.value === null) {
    document.getElementById("survey-purchase-price")?.focus();
    return;
  }
  if (expectedSalePrice.value === null) {
    document.getElementById("survey-expected-sale-price")?.focus();
    return;
  }
  submit();
}
</script>

<template>
  <div>
    <p class="info-banner">
      1세대 1주택 비과세·양도소득세 계산을 위해 필요한 정보예요
    </p>

    <h2 class="step-title">내집, 얼마에 사고 팔건지 알려주세요</h2>

    <AmountField
      v-model="purchasePrice"
      input-id="survey-purchase-price"
      label="내 집을 샀던 가격"
      :error="shownError('purchasePrice')"
      @enter="onEnter"
    />

    <div class="amount-gap">
      <AmountField
        v-model="expectedSalePrice"
        input-id="survey-expected-sale-price"
        label="내 집을 팔고 싶은 가격"
        :error="shownError('expectedSalePrice')"
        @enter="onEnter"
      />
    </div>

    <p class="text-center amount-gap">
      <!-- 설문 입력을 잃지 않도록 새 탭으로 연다.
           rel=noopener 는 새 탭이 window.opener 로 이 페이지를 건드리지 못하게 막는다. -->
      <a
        class="text-link"
        :href="PRICE_LOOKUP_URL"
        target="_blank"
        rel="noopener noreferrer"
      >
        팔고싶은 가격을 정확히 모르겠어요 — 네이버페이 부동산에서 시세 확인하기
      </a>
    </p>

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
