<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetchFavoriteProducts, saveAllocations } from "@/api/financeApi";
import { allocate, buildTimeline, dur } from "@/utils/finance/horizonTimeline";
import { termGroupOf } from "@/utils/finance/portfolioAllocation";
import { formatKRW } from "@/stores/survey";
import { useRecommendationStore } from "@/stores/recommendation";
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

const monthlyNeed = computed(() => (monthlyNeedMan.value || 0) * 10_000);

onMounted(async () => {
  try {
    const items = await fetchFavoriteProducts();
    products.value = items
      .map((item) => {
        // 우대금리 기준(추천 화면과 동일). stock은 maxAnnualRate가 없어 수익률로 떨어진다.
        const rate = Number(item.maxAnnualRate ?? item.annualRate);
        return {
        favoriteId: item.favoriteId,
        name: item.productName,
        maturity: item.termMonths || 0,
        rate: rate / 100,
        fixed: !!item.fixed,
        meta: `${item.institutionName} · 연 ${rate.toFixed(1)}%`,
        tag:
          TERM_LABELS[termGroupOf(item.termMonths || 0)] +
          " · " +
          (RISK_LABELS[item.productRiskGrade] || item.productRiskGrade || ""),
        };
      })
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
  return buildTimeline(allocation.value.segments, monthlyNeed.value);
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

// 카드1 태그용 — favoriteId → "5~19개월차"
const periodByFavoriteId = computed(() => {
  const map = new Map();
  for (const seg of timeline.value?.segs ?? []) {
    if (seg.favoriteId) map.set(seg.favoriteId, `${seg.from}~${seg.to}개월차`);
  }
  return map;
});

// 파킹 버킷 담당 구간 (총액이 월 필요금액에 못 미치면 세그먼트 자체가 없다)
const parkingPeriod = computed(() => {
  const seg = timeline.value?.segs.find((s) => s.cssType === "park");
  return seg ? `${seg.from}~${seg.to}개월차` : "";
});

// 총 투자금이 모자라 배분받지 못한 상품이 있는지
const underfunded = computed(() =>
  (allocation.value?.segments ?? []).some((s) => s.favoriteId && s.invest === 0),
);

// 이자로 늘어난 생활비 개월 수 (소수 1자리)
const interestMonths = computed(() => {
  if (!timeline.value || monthlyNeed.value <= 0) return 0;
  return Math.round((timeline.value.interest / monthlyNeed.value) * 10) / 10;
});

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
    await saveAllocations(items);
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
                <span v-if="parkingPeriod" class="pick-period">{{ parkingPeriod }} 담당</span>
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
                <span v-if="periodByFavoriteId.get(p.favoriteId)" class="pick-period">
                  {{ periodByFavoriteId.get(p.favoriteId) }} 담당
                </span>
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
        <p class="tl-sub">
          총 투자금액 <b>{{ formatKRW(totalFund) }}</b>으로
          <b>{{ dur(timeline.funded) }}</b> 사용 가능
          <span class="tl-sub-note">(이자 반영 기준)</span>
        </p>
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

        <p class="tl-basis">
          각 상품은 자기가 맡은 기간의 생활비가 <b>만기에 딱 나오도록</b> 금액을 역산했어요.
        </p>

        <table class="tl-table">
          <thead>
            <tr>
              <th>상품 · 담당 구간</th>
              <th>지금 넣을 돈</th>
              <th>만기에 필요한 돈</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(seg, i) in timeline.segs" :key="i">
              <td>
                {{ seg.name }} · {{ seg.from }}~{{ seg.to }}개월차
                <span v-if="seg.rate" class="tl-rate">연 {{ (seg.rate * 100).toFixed(2) }}%</span>
              </td>
              <td class="tl-invest">{{ formatKRW(seg.invest) }}</td>
              <td class="tl-need">
                <span class="tl-arrow">→</span>
                <template v-if="seg.last">
                  <span class="tl-need-sub">남은 돈 전액</span>
                </template>
                <template v-else>
                  <span class="tl-need-sub">{{ seg.months }}개월 ·</span>
                  <b>{{ formatKRW(seg.months * monthlyNeed) }}</b>
                </template>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="timeline.interest > 0" class="tl-gain">
          이자로 <b>{{ formatKRW(timeline.interest) }}</b>이 더 생겨,
          약 <b>{{ interestMonths }}개월치</b> 생활비를 더 씁니다.
        </p>

        <p v-if="underfunded" class="tl-warn">
          총 투자금이 모자라 일부 상품에는 배분되지 않았어요. 그만큼 뒤쪽 기간이 비어 있습니다.
        </p>

        <p class="footnote">
          예금·적금·만기매칭 ETF의 우대금리를 단리로 반영한 계산입니다.
          각 상품은 만기 시점에 해당 구간 생활비가 나오도록 투자금액을 역산했습니다.
          실제 수령액은 우대조건 충족 여부와 세금에 따라 달라질 수 있습니다.
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
  flex-wrap: wrap;
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

.pick-period {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  white-space: nowrap;
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
.tl-basis {
  font-size: 13px;
  color: var(--text-muted);
  margin: 14px 0 2px;
}

.tl-basis b { color: var(--text-dark); }

.tl-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 6px;
}

.tl-table th {
  padding: 8px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 12px;
  font-weight: 700;
  color: var(--text-muted);
  text-align: left;
}

.tl-table td {
  padding: 10px 0;
  border-bottom: 1px solid var(--card-border);
  font-size: 14px;
}

.tl-table th:not(:first-child),
.tl-table td:not(:first-child) {
  text-align: right;
  white-space: nowrap;
  padding-left: 12px;
}

/* 위치가 바뀌어도 스타일이 따라오도록 nth-child 대신 클래스로 지정 */
/* 결론 칸: 금액만 진하게, 개월수·화살표는 보조 정보로 눌러둔다 */
.tl-need {
  font-size: 14px;
  color: var(--text-dark);
}

.tl-need b { font-weight: 800; }

.tl-need-sub {
  color: var(--text-muted);
  font-size: 12.5px;
  font-weight: 400;
}

.tl-arrow {
  color: var(--text-muted);
  font-size: 12px;
  margin-right: 2px;
}

.tl-invest {
  font-weight: 800;
  color: var(--kb-yellow-deep);
}

.tl-rate {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}

.tl-gain {
  margin: 12px 0 0;
  padding: 10px 13px;
  border-radius: 8px;
  background: var(--kb-yellow-soft);
  font-size: 13.5px;
  color: var(--text-dark);
}

.tl-gain b { color: var(--kb-yellow-deep); font-weight: 800; }

.tl-warn {
  margin: 10px 0 0;
  padding: 10px 13px;
  border-radius: 8px;
  background: #ffe9e0;
  font-size: 13px;
  color: #9b3b3b;
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
