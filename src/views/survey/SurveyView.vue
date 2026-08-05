<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useSurveyStore } from "@/stores/survey";
import "@/styles/survey-tokens.css";

import SurveyIntro from "@/components/survey/SurveyIntro.vue";
import SurveyProgress from "@/components/survey/SurveyProgress.vue";
import SurveySearchingOverlay from "@/components/survey/SurveySearchingOverlay.vue";
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
const router = useRouter();

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
const isConditionEdit = computed(() => survey.conditionEditMode);
const isLastStep = computed(
  () => survey.stepIndex === STEP_COMPONENTS.length - 1,
);

onMounted(() => {
  if (props.surveyId) {
    survey.loadById(props.surveyId);
  } else {
    survey.init();
  }
  window.addEventListener("keydown", onGlobalEnter);
});

/**
 * 어느 단계에서든 엔터 = "다음" 버튼.
 *
 * 금액 입력칸은 AmountField 가 자체 처리(다음 칸 이동)하므로 건드리지 않고,
 * 버튼·드롭다운 등 나머지 위치에서 누른 엔터만 다음 버튼 클릭으로 잇는다.
 * 유효성 검사는 각 단계 submit 안에서 그대로 돌기 때문에 빈 값이면 넘어가지 않는다.
 */
function onGlobalEnter(event) {
  if (event.key !== "Enter") return;
  if (survey.showIntro || searching.value || showResetConfirm.value) return;

  const target = event.target;
  // 입력칸은 AmountField 의 enter 처리에 맡긴다. 여기서도 잡으면 두 번 동작한다.
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
  // 다음/이전 버튼에 포커스가 있으면 브라우저 기본 클릭에 맡긴다.
  if (
    target instanceof HTMLButtonElement &&
    (target.classList.contains("primary-btn") || target.classList.contains("secondary-btn"))
  ) {
    return;
  }

  const nextButton = document.querySelector(".survey-card .primary-btn:not(:disabled)");
  if (!nextButton) return;
  // 토글·칩 버튼에 포커스가 남아 있을 때 엔터가 그 버튼을 다시 누르지 않도록 막는다.
  event.preventDefault();
  nextButton.click();
}

const showResetConfirm = ref(false);
function confirmReset() {
  showResetConfirm.value = false;
  survey.reset();
}

// ---- "집 찾는 중" 로딩 ----
// 마지막 단계에서 설문 제출이 시작되면 카드를 띄우고 0→25→50→75%로 올린다.
// 75%에서 제출 API 완료를 기다렸다가, 성공이면 100%를 찍고 추천 목록으로 넘어간다.
// 실제 진행률이 아니라 연출이므로, 응답이 빨라도 최소 시간은 보여준다.
const searching = ref(false);
const searchPct = ref(0);
const STAGE_MS = 700;
const MIN_SHOW_MS = 2400;
const FINISH_HOLD_MS = 600;
let stageTimer;
let finishTimer;
let searchStartedAt = 0;

function onSearching() {
  if (searching.value) return;
  searching.value = true;
  searchPct.value = 0;
  searchStartedAt = Date.now();
  const stages = [25, 50, 75];
  let next = 0;
  stageTimer = setInterval(() => {
    if (next < stages.length) searchPct.value = stages[next++];
    else clearInterval(stageTimer);
  }, STAGE_MS);
}

function goToRecommendations() {
  if (!searching.value) {
    // 로딩 없이 완료된 경로(예: 조건 수정 모드)는 바로 이동한다.
    router.push("/recommend");
    return;
  }
  const wait = Math.max(0, MIN_SHOW_MS - (Date.now() - searchStartedAt));
  finishTimer = setTimeout(() => {
    clearInterval(stageTimer);
    if (survey.calculationFailed) {
      // 실패 시 카드를 닫고 화면의 오류 문구를 보여준다. 이동하지 않는다.
      searching.value = false;
      searchPct.value = 0;
      return;
    }
    searchPct.value = 100;
    finishTimer = setTimeout(() => router.push("/recommend"), FINISH_HOLD_MS);
  }, wait);
}

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onGlobalEnter);
  clearInterval(stageTimer);
  clearTimeout(finishTimer);
});
</script>

<template>
  <div class="survey-shell" :class="{ 'condition-edit': isConditionEdit }">
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
          :total="survey.progressTotal"
          :percent="survey.progressPct"
          :show-back="isLastStep"
          :disabled="survey.loading"
          @back="survey.back"
          @reset="showResetConfirm = true"
        />

        <component
          :is="currentStep"
          @prev="survey.back"
          @searching="onSearching"
          @complete="goToRecommendations"
        />

        <p v-if="survey.errorMessage" class="field-help text-center mt-3">
          {{ survey.errorMessage }}
        </p>
      </template>
    </div>

    <SurveySearchingOverlay v-if="searching" :progress="searchPct" />

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
