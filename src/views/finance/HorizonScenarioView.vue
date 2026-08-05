<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetchFavoriteProducts, saveAllocations } from "@/api/financeApi";
import { allocate, buildTimeline } from "@/utils/finance/horizonTimeline";
import { termGroupOf } from "@/utils/finance/portfolioAllocation";
import { formatKRW } from "@/stores/survey";
import { useRecommendationStore } from "@/stores/recommendation";
import { authStore } from "@/stores/authStore";
import "@/styles/survey-tokens.css";

const router = useRouter();
const rec = useRecommendationStore();

const TERM_LABELS = { UNDER_1Y: "단기", Y1_TO_3: "중기", OVER_3Y: "장기" };
const TERM_STEP_CLASS = { UNDER_1Y: "step-short", Y1_TO_3: "step-mid", OVER_3Y: "step-long" };
const RISK_LABELS = { VERY_LOW: "매우 낮은 위험", LOW: "낮은 위험", MEDIUM: "보통 위험", HIGH: "높은 위험" };

const products = ref([]);
const loadError = ref("");
// ponytail: 총 투자금액은 앞 페이지(DB)에서 넘어올 예정. 지금은 스토어 목업.
const totalFund = computed(() => rec.investAmount || 50_000_000);
const monthlyNeedMan = ref(rec.monthlyNeed ? rec.monthlyNeed / 10_000 : 100);
const optimistic = ref(false);

const monthlyNeed = computed(() => (monthlyNeedMan.value || 0) * 10_000);

onMounted(async () => {
  try {
    // survey_id 컬럼에 userId를 임시로 사용 중
    const surveyId = authStore.state.user?.userId ?? 0;
    const items = await fetchFavoriteProducts(surveyId);
    products.value = items
      .map((item) => ({
        favoriteId: item.favoriteId,
        name: item.productName,
        maturity: item.termMonths || 0,
        rate: Number(item.annualRate) / 100,
        fixed: !!item.fixed,
        meta: `${item.institutionName} · 연 ${Number(item.annualRate).toFixed(1)}%`,
        tag:
          TERM_LABELS[termGroupOf(item.termMonths || 0)] +
          " · " +
          (RISK_LABELS[item.productRiskGrade] || item.productRiskGrade || ""),
      }))
      .sort((a, b) => a.maturity - b.maturity);
  } catch {
    loadError.value = "관심 금융상품을 불러오지 못했습니다.";
  }
});

// 만기 사다리 배분 → 타임라인
const allocation = computed(() => {
  if (!products.value.length || monthlyNeed.value <= 0) return null;
  return allocate(products.value, monthlyNeed.value, totalFund.value);
});

const timeline = computed(() => {
  if (!allocation.value) return null;
  return buildTimeline(allocation.value.segments, monthlyNeed.value, optimistic.value);
});

const timelineBase = computed(() => {
  if (!allocation.value) return null;
  return buildTimeline(allocation.value.segments, monthlyNeed.value, false);
});

const timelineOpt = computed(() => {
  if (!allocation.value) return null;
  return buildTimeline(allocation.value.segments, monthlyNeed.value, true);
});

// 파킹/CMA 버킷 (있으면)
const parking = computed(
  () => allocation.value?.segments.find((s) => s.cssType === "park") ?? null,
);

// 상품별 투자금 (favoriteId → invest)
const investByFavoriteId = computed(() => {
  const map = new Map();
  for (const seg of allocation.value?.segments ?? []) {
    if (seg.favoriteId) map.set(seg.favoriteId, seg.invest);
  }
  return map;
});

function dur(m) {
  if (m >= 600) return "50년 이상";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}개월`;
  if (mo === 0) return `${y}년`;
  return `${y}년 ${mo}개월`;
}

function investOf(favoriteId) {
  return investByFavoriteId.value.get(favoriteId) || 0;
}

function fundPct(amount) {
  if (!totalFund.value) return 0;
  return Math.round((amount / totalFund.value) * 100);
}

function investPct(favoriteId) {
  return fundPct(investOf(favoriteId));
}

function segPct(seg) {
  if (!timeline.value || timeline.value.span === 0) return 0;
  return Math.max(2, Math.round((seg.months / timeline.value.span) * 100));
}

const saving = ref(false);
const saveMsg = ref("");

// TODO: 금융상품 추천페이지로 연결 필요
function handleBack() {
  router.push("/recommendation/result");
}

async function handleContinue() {
  if (!allocation.value) return;
  saving.value = true;
  saveMsg.value = "";
  try {
    const items = allocation.value.segments
      .filter((s) => s.favoriteId)
      .map((s) => ({
        favoriteId: s.favoriteId,
        amount: s.invest,
        percent: Math.round((s.invest / totalFund.value) * 10000) / 100,
      }));
    await saveAllocations(null, items);
    router.push("/summary");
  } catch {
    saveMsg.value = "저장에 실패했습니다.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="hz-shell">
    <p v-if="loadError" class="notice error">{{ loadError }}</p>

    <template v-if="products.length">
      <!-- 선택 상품 + 입력 -->
      <div class="survey-card">
        <h1 class="step-title" style="text-align:left;margin-top:0">얼마를 어디에 투자할까요?</h1>
        <p class="step-desc" style="text-align:left">
          총 {{ formatKRW(totalFund) }}을 관심 등록한 {{ products.length }}개 상품에 아래와 같이 나눠 투자하세요.
        </p>
        <div class="picks">
          <div v-if="parking" class="pick">
            <div class="pick-step step-park">0</div>
            <div class="pick-body">
              <div class="pick-head">
                <span class="pick-tag">파킹통장·CMA</span>
                <span class="pick-name">통장</span>
              </div>
              <div class="pick-meta">
                첫 상품 만기({{ products[0].maturity }}개월) 전까지 쓸 돈은
                입출금이 자유로운 곳에 넣어두는 것을 추천합니다.
              </div>
              <div class="pick-bar-track">
                <div class="pick-bar-fill" :style="{ width: fundPct(parking.invest) + '%' }"></div>
              </div>
            </div>
            <div class="pick-amt">
              <div class="pick-invest">{{ formatKRW(parking.invest) }}</div>
              <div class="pick-pct">{{ fundPct(parking.invest) }}%</div>
            </div>
          </div>
          <div v-for="(p, i) in products" :key="p.favoriteId" class="pick">
            <div class="pick-step" :class="TERM_STEP_CLASS[termGroupOf(p.maturity)]">{{ i + 1 }}</div>
            <div class="pick-body">
              <div class="pick-head">
                <span class="pick-tag">{{ p.tag }}</span>
                <span class="pick-name">{{ p.name }}</span>
              </div>
              <div class="pick-meta">{{ p.meta }} · 만기 {{ p.maturity }}개월</div>
              <div class="pick-bar-track">
                <div class="pick-bar-fill" :style="{ width: investPct(p.favoriteId) + '%' }"></div>
              </div>
            </div>
            <div class="pick-amt">
              <div class="pick-invest">{{ formatKRW(investOf(p.favoriteId)) }}</div>
              <div class="pick-pct">{{ investPct(p.favoriteId) }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 타임라인 -->
      <div v-if="timeline" class="survey-card" style="margin-top: 28px">
        <h2 class="tl-title">시기별로 어디서 돈이 나오는지</h2>
        <p v-if="timelineBase && timelineOpt" class="tl-sub">
          한달에 추가로 <b>{{ formatKRW(monthlyNeed) }}</b>씩
          <b v-if="timelineBase.funded === timelineOpt.funded">{{ dur(timelineBase.funded) }}</b>
          <b v-else>{{ dur(timelineBase.funded) }} ~ {{ dur(timelineOpt.funded) }}</b>
          사용 가능
          <span class="tl-sub-note">(보수적 기준 ~ 이자 반영 기준)</span>
        </p>
        <div class="toggle-row tl-toggle">
          <button class="toggle" :class="{ active: !optimistic }" @click="optimistic = false">
            보수적 계산
          </button>
          <button class="toggle" :class="{ active: optimistic }" @click="optimistic = true">
            이자 반영
          </button>
        </div>
        <div class="legend">
          <span class="l-park">파킹·CMA</span>
          <span class="l-short">단기</span>
          <span class="l-mid">중기</span>
          <span class="l-long">장기</span>
        </div>

        <div class="tl-bar">
          <div
            v-for="(seg, i) in timeline.segs"
            :key="i"
            class="seg"
            :class="seg.type"
            :style="{ width: segPct(seg) + '%' }"
          >
            {{ seg.months }}개월
          </div>
        </div>

        <table class="tl-table">
          <tr v-for="(seg, i) in timeline.segs" :key="i">
            <td>{{ seg.name }} ({{ seg.from }}~{{ seg.to }}개월차)</td>
            <td>{{ formatKRW(seg.amount) }}</td>
          </tr>
        </table>

        <p class="footnote">
          {{
            optimistic
              ? "예금·적금 등 확정금리 상품에 기본금리를 반영한 낙관적 계산입니다. 변동금리 상품은 원금 그대로 계산했습니다."
              : "이자 없이 원금만 쓴다고 가정한 일반적인(보수적) 계산입니다."
          }}
        </p>
      </div>

      <!-- 이동 -->
      <div class="nav-row">
        <button class="btn-nav btn-nav-back" type="button" @click="handleBack">
          ← 뒤로가기
        </button>
        <button class="btn-nav btn-nav-continue" :disabled="saving || !allocation" @click="handleContinue">
          {{ saving ? "저장 중..." : "이대로 계속하기" }}
        </button>
      </div>
      <p v-if="saveMsg" class="save-msg">{{ saveMsg }}</p>
    </template>
  </div>
</template>

<style scoped>
.hz-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 60px;
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}

/* 상품 요약 */
.picks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pick {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid var(--card-border);
  border-radius: 14px;
  padding: 14px 16px;
}

.pick-step {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--kb-yellow);
  color: var(--btn-text);
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pick-step.step-park { background: #4f9a91; color: #fff; }
.pick-step.step-short { background: #3b82f6; color: #fff; }
.pick-step.step-mid { background: #7c3aed; color: #fff; }
.pick-step.step-long { background: #1e1b4b; color: #fff; }

.pick-body {
  flex: 1;
  min-width: 0;
}

.pick-head {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.pick-bar-track {
  margin-top: 8px;
  height: 6px;
  border-radius: 3px;
  background: var(--card-border);
  overflow: hidden;
}

.pick-bar-fill {
  height: 100%;
  background: var(--kb-yellow);
  border-radius: 3px;
}

.pick-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--kb-yellow-deep);
  background: var(--kb-yellow-soft);
  border: 1px solid var(--kb-yellow);
  border-radius: 10px;
  padding: 1px 8px;
  margin-bottom: 4px;
}

.pick-name {
  font-weight: 700;
  font-size: 15px;
}

.pick-meta {
  color: var(--text-muted);
  font-size: 12.5px;
  margin-top: 2px;
}

.pick-amt {
  flex-shrink: 0;
  text-align: right;
}

.pick-invest {
  font-weight: 800;
  color: var(--kb-yellow-deep);
  font-size: 19px;
  white-space: nowrap;
}

.pick-pct {
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 700;
  margin-top: 2px;
}

/* 입력 */
.input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1.5px solid var(--card-border);
  border-radius: 10px;
  padding: 8px 12px;
}

.input-wrap input {
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 800;
  text-align: right;
  width: 100%;
  color: var(--text-dark);
}

.input-wrap em {
  font-style: normal;
  color: var(--text-muted);
  font-size: 13px;
}

.tl-sub {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.tl-sub b {
  color: var(--kb-yellow-deep);
}

.tl-sub-note {
  font-size: 12.5px;
  color: var(--text-muted);
}

.toggle-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.toggle {
  border: 1.5px solid var(--card-border);
  background: transparent;
  color: var(--text-muted);
  font-size: 13.5px;
  font-weight: 700;
  padding: 9px 16px;
  border-radius: 20px;
  cursor: pointer;
}

.toggle.active {
  background: var(--kb-yellow);
  color: var(--btn-text);
  border-color: var(--kb-yellow);
}

.tl-toggle {
  margin-bottom: 12px;
}

/* 타임라인 */
.tl-title {
  font-weight: 800;
  font-size: 19px;
  margin: 2px 0 10px;
}

.tl-bar {
  display: flex;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  margin: 6px 0 8px;
}

.seg {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  min-width: 2px;
}

.seg.park { background: #4f9a91; }
.seg.short { background: #3b82f6; }
.seg.mid { background: #7c3aed; }
.seg.long { background: #1e1b4b; }

.legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.legend span::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 5px;
  vertical-align: -1px;
}

.l-park::before { background: #4f9a91; }
.l-short::before { background: #3b82f6; }
.l-mid::before { background: #7c3aed; }
.l-long::before { background: #1e1b4b; }

/* 테이블 */
.tl-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.tl-table td {
  padding: 10px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 14px;
}

.tl-table td:last-child {
  text-align: right;
  font-weight: 700;
  white-space: nowrap;
}

.notice {
  padding: 12px 14px;
  border-radius: 6px;
  background: #eef7ee;
  font-size: 15px;
  margin-bottom: 14px;
}

.notice.error {
  background: #ffe9e0;
}

.nav-row {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-nav {
  flex: 1;
  border: none;
  font-size: 16px;
  font-weight: 800;
  padding: 14px 0;
  border-radius: 14px;
  cursor: pointer;
}

.btn-nav-back {
  background: transparent;
  color: var(--text-dark);
  border: 1.5px solid var(--card-border);
}

.btn-nav-continue {
  background: var(--kb-yellow);
  color: var(--btn-text);
}

.btn-nav-continue:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-msg {
  font-size: 14px;
  font-weight: 700;
  color: var(--kb-yellow-deep);
  text-align: center;
  margin-top: 10px;
}

</style>
