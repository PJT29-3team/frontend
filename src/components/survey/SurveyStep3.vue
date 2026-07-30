<script setup>
import { computed } from "vue";
import { useSurveyStore, formatKRW } from "@/stores/survey";
import CalcCard from "./CalcCard.vue";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const tax = computed(() => survey.taxResult);
const brokerage = computed(() => survey.brokerage);

function submit() {
  survey.advanceFromTaxSummary();
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">집을 팔면 이만큼 들어와요</h2>
    <p class="step-desc">
      매도 예상 실수령액은 {{ formatKRW(survey.netProceeds) }}예요
    </p>

    <CalcCard title="양도세" :amount="tax.amount" :steps="tax.steps" />

    <CalcCard
      title="주택 매매 중개수수료"
      prefix="최대"
      :amount="brokerage.amount"
      :steps="brokerage.steps"
    />

    <div class="disclaimer">
      <p>
        1세대 1주택자를 대상으로 한 계산결과이며, 절세 정보는 참고용으로
        제공되며, 법률·세무 자문을 대체하지 않습니다.
      </p>
    </div>

    <div class="btn-row">
      <button type="button" class="secondary-btn" @click="emit('prev')">
        이전
      </button>
      <button type="button" class="primary-btn" @click="submit">다음</button>
    </div>
  </div>
</template>
