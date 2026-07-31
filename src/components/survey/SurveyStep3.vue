<script setup>
import { computed, ref } from "vue";
import { useSurveyStore, formatKRW } from "@/stores/survey";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const tax = computed(() => survey.taxResult);
const brokerage = computed(() => survey.brokerage);

const openTax = ref(false);
const openBrokerage = ref(false);

function won(n) {
  return `${Math.floor(n || 0).toLocaleString("ko-KR")}원`;
}

function submit() {
  survey.advanceFromTaxSummary();
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">
      지금 집을 팔면 {{ formatKRW(survey.netProceeds) }} 정도<br />수령할
      것으로 예상되요
    </h2>

    <section class="result-card">
      <div class="result-row">
        <span class="result-label">내집 팔 가격</span>
        <span class="result-value">{{ won(survey.expectedSalePrice) }}</span>
      </div>
    </section>

    <section class="result-card">
      <div class="result-row">
        <span class="result-label">양도세</span>
        <span class="result-value">{{ won(tax.amount) }}</span>
      </div>
      <p class="result-note">26년 5월 9일 변경된 세법이 적용되었습니다</p>
      <button
        v-if="tax.steps.length"
        type="button"
        class="calc-toggle"
        :aria-expanded="openTax"
        @click="openTax = !openTax"
      >
        {{ openTax ? "계산식 접기" : "자세한 계산식 보기" }}
      </button>
      <div v-if="openTax && tax.steps.length" class="calc-body">
        <p v-for="(line, i) in tax.steps" :key="i">{{ line }}</p>
      </div>
    </section>

    <section class="result-card">
      <div class="result-row">
        <span class="result-label">주택 매매 중개수수료</span>
        <span class="result-value">최대 {{ won(brokerage.amount) }}</span>
      </div>
      <button
        v-if="brokerage.steps.length"
        type="button"
        class="calc-toggle"
        :aria-expanded="openBrokerage"
        @click="openBrokerage = !openBrokerage"
      >
        {{ openBrokerage ? "계산식 접기" : "자세한 계산식 보기" }}
      </button>
      <div v-if="openBrokerage && brokerage.steps.length" class="calc-body">
        <p v-for="(line, i) in brokerage.steps" :key="i">{{ line }}</p>
      </div>
    </section>

    <hr class="result-divider" />

    <section class="result-card total">
      <div class="result-row">
        <span class="result-label">내집 팔고 남는 돈</span>
        <span class="result-value">{{ won(survey.netProceeds) }}</span>
      </div>
    </section>

    <div class="btn-row">
      <button type="button" class="secondary-btn" @click="emit('prev')">
        이전
      </button>
      <button type="button" class="primary-btn" @click="submit">다음</button>
    </div>
  </div>
</template>
