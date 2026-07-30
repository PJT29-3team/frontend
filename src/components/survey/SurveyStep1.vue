<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateSalePrice } from "@/utils/surveyValidation";
import AmountField from "./AmountField.vue";

const survey = useSurveyStore();
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

// 입력을 시작하기 전에는 오류 문구를 띄우지 않는다.
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
    />

    <div class="mt-4">
      <AmountField
        v-model="expectedSalePrice"
        input-id="survey-expected-sale-price"
        label="내 집을 팔고 싶은 가격"
        :error="shownError('expectedSalePrice')"
      />
    </div>

    <p class="text-center mt-4">
      <!-- 연결할 시세조회 서비스는 아직 정해지지 않아 자리만 마련해 둔다. -->
      <a class="text-link" href="#" @click.prevent>
        팔고싶은 가격을 정확히 모르겠어요 — 시세조회 사이트 연결
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
