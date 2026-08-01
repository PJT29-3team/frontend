<script setup>
import { useRouter } from 'vue-router';
import {
  useRecommendationStore,
  formatKRW,
} from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

// FPR-002 결과 화면의 임시 스텁. 조건이 제대로 넘어오는지 확인용으로
// 선택값과 계산 금액만 보여준다. 3탭(나에게 맞는 / 비슷한 그룹 / 관심)은
// 명세-목업 불일치 확인 후 구현 예정.
const router = useRouter();
const rec = useRecommendationStore();
</script>

<template>
  <div class="result-shell">
    <button class="link-back" type="button" @click="router.push('/recommendation')">
      ← 조건 설정으로 돌아가기
    </button>

    <div class="survey-card">
      <h1 class="r-title">추천 결과 (준비 중)</h1>
      <p class="r-sub">아래 조건으로 추천 목록 화면을 이어서 만들 예정이에요.</p>

      <dl class="summary">
        <div>
          <dt>추천 투자 금액</dt>
          <dd class="hl">{{ formatKRW(rec.investAmount) }}</dd>
        </div>
        <div>
          <dt>투자 후 남는 현금</dt>
          <dd>{{ formatKRW(rec.remainingCash) }}</dd>
        </div>
        <div>
          <dt>선택한 조건</dt>
          <dd>
            {{ rec.selectedRisk?.label }} · {{ rec.selectedPeriod?.label }} ·
            투자비율 {{ rec.ratioPercent }}%
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.result-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 60px;
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}
.link-back {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  cursor: pointer;
}
.r-title {
  font-weight: 800;
  font-size: 22px;
  margin: 0 0 6px;
}
.r-sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0 0 22px;
}
.summary div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 14px 0;
  border-top: 1px solid var(--card-border);
}
.summary dt {
  color: var(--text-muted);
  font-size: 14px;
}
.summary dd {
  margin: 0;
  font-weight: 700;
}
.summary dd.hl {
  color: var(--kb-yellow-deep);
  font-size: 20px;
}
</style>
