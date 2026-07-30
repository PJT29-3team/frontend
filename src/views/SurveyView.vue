<script setup>
import { computed, onMounted, ref } from "vue";
import { useSurveyStore, PROGRESS_STEPS_TOTAL, formatKRW } from "@/stores/survey";
import "@/styles/survey-tokens.css";

import SurveyIntro from "@/components/survey/SurveyIntro.vue";
import SurveyProgress from "@/components/survey/SurveyProgress.vue";
import SurveyStep1 from "@/components/survey/SurveyStep1.vue";
import SurveyStep2 from "@/components/survey/SurveyStep2.vue";
import SurveyStep3 from "@/components/survey/SurveyStep3.vue";
import SurveyStep4 from "@/components/survey/SurveyStep4.vue";
import SurveyStep5 from "@/components/survey/SurveyStep5.vue";
import SurveyStep6 from "@/components/survey/SurveyStep6.vue";

const props = defineProps({
  surveyId: { type: String, default: null },
});

const survey = useSurveyStore();

// STEP_ORDER와 같은 순서로 둔다.
const STEP_COMPONENTS = [
  SurveyStep1,
  SurveyStep2,
  SurveyStep3,
  SurveyStep4,
  SurveyStep5,
  SurveyStep6,
];

const currentStep = computed(() => STEP_COMPONENTS[survey.stepIndex]);
const isLastStep = computed(
  () => survey.stepIndex === STEP_COMPONENTS.length - 1,
);

onMounted(() => {
  if (props.surveyId) {
    survey.loadById(props.surveyId);
  } else {
    survey.init();
  }
});

/** 0.6 -> "60%" */
function toPercent(weight) {
  return `${Math.round(weight * 100)}%`;
}

const showResetConfirm = ref(false);
function confirmReset() {
  showResetConfirm.value = false;
  survey.reset();
}
</script>

<template>
  <div class="survey-shell">
    <div class="survey-card">
      <SurveyIntro
        v-if="survey.showIntro"
        :user-name="survey.displayName"
        :loading="survey.loading"
        @start="survey.startSurvey"
      />

      <template v-else>
        <SurveyProgress
          :step="survey.progressStep"
          :total="PROGRESS_STEPS_TOTAL"
          :percent="survey.progressPct"
          :show-back="isLastStep"
          :disabled="survey.loading"
          @back="survey.back"
          @reset="showResetConfirm = true"
        />

        <div v-if="survey.done" class="survey-result">
          <h2 class="step-title">설문이 완료됐어요</h2>
          <p class="step-desc">
            {{ formatKRW(survey.maxPurchaseBudget) }} 이하의 집을 찾아볼게요
          </p>

          <div class="summary-stat">
            <div class="label">매도 예상 실수령액</div>
            <div class="value">{{ formatKRW(survey.netProceeds) }}</div>
          </div>
          <div class="summary-stat">
            <div class="label">양도세</div>
            <div class="value">{{ formatKRW(survey.taxResult.amount) }}</div>
          </div>
          <div class="summary-stat">
            <div class="label">중개수수료</div>
            <div class="value">{{ formatKRW(survey.brokerage.amount) }}</div>
          </div>
          <div class="summary-stat">
            <div class="label">이사 후 남기는 금액</div>
            <div class="value">{{ formatKRW(survey.reserveAmount) }}</div>
          </div>

          <template v-if="survey.weights">
            <p class="step-desc mt-4 mb-2">추천에 반영할 기준이에요</p>
            <div class="summary-stat">
              <div class="label">주거안전</div>
              <div class="value">{{ toPercent(survey.weights.safety) }}</div>
            </div>
            <div class="summary-stat">
              <div class="label">생활편의</div>
              <div class="value">{{ toPercent(survey.weights.convenience) }}</div>
            </div>
            <div class="summary-stat">
              <div class="label">자산안정</div>
              <div class="value">{{ toPercent(survey.weights.asset) }}</div>
            </div>
          </template>

          <p v-else-if="survey.calculationFailed" class="disclaimer text-center">
            추천 기준은 잠시 후 다시 계산할게요. 위 금액은 예상 계산값이에요.
          </p>

          <button type="button" class="primary-btn" @click="survey.reset">
            다시 설문하기
          </button>
        </div>

        <component :is="currentStep" v-else @prev="survey.back" />

        <p v-if="survey.errorMessage" class="field-help text-center mt-3">
          {{ survey.errorMessage }}
        </p>
      </template>
    </div>

    <div
      v-if="showResetConfirm"
      class="reset-modal-overlay"
      @click.self="showResetConfirm = false"
    >
      <div class="reset-modal-card">
        <div class="reset-modal-icon" aria-hidden="true">↺</div>
        <div class="reset-modal-title">처음으로 돌아갈까요?</div>
        <div class="reset-modal-sub">
          지금까지 입력하신 내용이<br />모두 초기화돼요.
        </div>
        <div class="reset-modal-actions">
          <button
            type="button"
            class="reset-btn-cancel"
            @click="showResetConfirm = false"
          >
            계속 진행할게요
          </button>
          <button type="button" class="reset-btn-confirm" @click="confirmReset">
            처음부터 할게요
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
