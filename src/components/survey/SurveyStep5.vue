<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateReserveBudget } from "@/utils/surveyValidation";
import AmountField from "./AmountField.vue";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const reserveAmount = ref(survey.reserveAmount);
const submitted = ref(false);

const errors = computed(() =>
  validateReserveBudget({
    reserveAmount: reserveAmount.value,
    netProceeds: survey.afterMortgage,
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
    <h2 class="step-title">
      이사하고 나서 최소<br />얼마 정도는 남아있으면 될까요?
    </h2>

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
