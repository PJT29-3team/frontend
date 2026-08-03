<script setup>
import { computed, onMounted, ref } from "vue";
import { useSurveyStore, PROGRESS_STEPS_TOTAL } from "@/stores/survey";
import "@/styles/survey-tokens.css";

import SurveyIntro from "@/components/survey/SurveyIntro.vue";
import SurveyProgress from "@/components/survey/SurveyProgress.vue";
import SurveyStep1 from "@/components/survey/SurveyStep1.vue";
import SurveyStep2 from "@/components/survey/SurveyStep2.vue";
import SurveyStep3 from "@/components/survey/SurveyStep3.vue";
import SurveyStep4 from "@/components/survey/SurveyStep4.vue";
import SurveyStep5 from "@/components/survey/SurveyStep5.vue";
import SurveyStep6 from "@/components/survey/SurveyStep6.vue";
import SurveyStep7 from "@/components/survey/SurveyStep7.vue";

const props = defineProps({
  surveyId: { type: String, default: null },
});

const survey = useSurveyStore();

const STEP_COMPONENTS = [
  SurveyStep1,
  SurveyStep2,
  SurveyStep3,
  SurveyStep4,
  SurveyStep5,
  SurveyStep6,
  SurveyStep7,
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
  survey.loadUserName();
});

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
          v-if="survey.showProgress"
          :step="survey.progressStep"
          :total="PROGRESS_STEPS_TOTAL"
          :percent="survey.progressPct"
          :show-back="isLastStep"
          :disabled="survey.loading"
          @back="survey.back"
          @reset="showResetConfirm = true"
        />

        <component :is="currentStep" @prev="survey.back" />

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
