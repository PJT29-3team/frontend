<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateReserveBudget } from "@/utils/surveyValidation";
import AmountField from "./AmountField.vue";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const reserveAmount = ref(survey.reserveAmount);
const submitted = ref(false);
const reserveLimit = computed(() =>
  typeof survey.calculation?.netProceeds === "number"
    ? survey.calculation.netProceeds
    : survey.afterMortgage,
);

const errors = computed(() =>
  validateReserveBudget({
    reserveAmount: reserveAmount.value,
    netProceeds: reserveLimit.value,
  }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

const shownError = computed(() =>
  submitted.value ? errors.value.reserveAmount || "" : "",
);

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.saveReserveBudget({ reserveAmount: reserveAmount.value });
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">이사 후 생활자금은 얼마 필요하신가요?</h2>

    <AmountField
      v-model="reserveAmount"
      input-id="survey-reserve-amount"
      label="이사후 남기고싶은 금액"
      equals
      chips
      :error="shownError"
      @enter="submit"
    />

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
