<script setup>
import { computed, ref } from "vue";
import { useSurveyStore, formatKRW } from "@/stores/survey";
import { validateMortgage } from "@/utils/surveyValidation";
import AmountField from "./AmountField.vue";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const hasMortgage = ref(survey.hasMortgage);
const mortgageBalance = ref(survey.mortgageBalance);
const submitted = ref(false);

const errors = computed(() =>
  validateMortgage({
    hasMortgage: hasMortgage.value,
    mortgageBalance: mortgageBalance.value,
    netProceeds: survey.netProceeds,
  }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

const shownError = computed(() =>
  submitted.value ? errors.value.mortgageBalance || "" : "",
);

const remaining = computed(() =>
  Math.max(survey.netProceeds - (mortgageBalance.value || 0), 0),
);

function pick(value) {
  hasMortgage.value = value;
  if (!value) mortgageBalance.value = null;
}

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.saveMortgage({
    hasMortgage: hasMortgage.value,
    mortgageBalance: mortgageBalance.value,
  });
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">지금 살고 계신 집에<br />남은 대출이 있으신가요?</h2>
    <p class="step-desc">집을 팔 때 갚아야 할 금액이라 계산에 꼭 필요합니다</p>

    <div class="toggle-pair">
      <button
        type="button"
        class="toggle-opt"
        :class="{ on: hasMortgage === false }"
        :aria-pressed="hasMortgage === false"
        @click="pick(false)"
      >
        대출이 없어요
      </button>
      <button
        type="button"
        class="toggle-opt"
        :class="{ on: hasMortgage === true }"
        :aria-pressed="hasMortgage === true"
        @click="pick(true)"
      >
        대출이 있어요
      </button>
    </div>

    <template v-if="hasMortgage">
      <div class="mt-4">
        <AmountField
          v-model="mortgageBalance"
          input-id="survey-mortgage-balance"
          label="남은 대출 잔액"
          chips
          :error="shownError"
          @enter="submit"
        />
      </div>

      <div v-if="mortgageBalance" class="payoff-box">
        <div>
          이 대출을 갚고 나면<br />
          <b>{{ formatKRW(remaining) }}</b>
        </div>
        <div>이 남습니다</div>
      </div>
    </template>

    <p
      v-if="submitted && !hasMortgage && hasMortgage !== false"
      class="invalid-feedback d-block"
    >
      대출 보유 여부를 선택해주세요.
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
