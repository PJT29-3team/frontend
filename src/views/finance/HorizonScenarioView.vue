<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetchFavoriteProducts, saveAllocations } from "@/api/financeApi";
import { allocate, buildTimeline } from "@/utils/finance/horizonTimeline";
import { termGroupOf } from "@/utils/finance/portfolioAllocation";
import { formatKRW } from "@/stores/survey";
import { useRecommendationStore } from "@/stores/recommendation";
import "@/styles/survey-tokens.css";

const router = useRouter();
const rec = useRecommendationStore();

const TERM_LABELS = { UNDER_1Y: "단기", Y1_TO_3: "중기", OVER_3Y: "장기" };

const products = ref([]);
const loadError = ref("");
// ponytail: 총 투자금액은 앞 페이지(DB)에서 넘어올 예정. 지금은 스토어 목업.
const totalFund = computed(() => rec.investAmount || 50_000_000);
const monthlyNeedMan = ref(100);
const optimistic = ref(false);

const monthlyNeed = computed(() => (monthlyNeedMan.value || 0) * 10_000);

onMounted(async () => {
  try {
    // ponytail: surveyId는 나중에 스토어/DB에서. 목업은 무시함.
    const items = await fetchFavoriteProducts(null);
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
          (item.productRiskGrade || ""),
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

function dur(m) {
  if (m >= 600) return "50년 이상";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}개월`;
  if (mo === 0) return `${y}년`;
  return `${y}년 ${mo}개월`;
}

function segPct(seg) {
  if (!timeline.value || timeline.value.span === 0) return 0;
  return Math.max(2, Math.round((seg.months / timeline.value.span) * 100));
}

const saving = ref(false);
const saveMsg = ref("");

async function handleSave() {
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
    saveMsg.value = "저장되었습니다.";
  } catch {
    saveMsg.value = "저장에 실패했습니다.";
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="hz-shell">
    <button class="link-back" type="button" @click="router.push('/recommendation/result')">
      ← 추천 결과로 돌아가기
    </button>

    <p v-if="loadError" class="notice error">{{ loadError }}</p>

    <template v-if="products.length">
      <!-- 선택 상품 + 입력 -->
      <div class="survey-card">
        <h1 class="step-title" style="text-align:left;margin-top:0">관심 금융상품 자금 계획</h1>
        <p class="step-desc" style="text-align:left">
          관심 등록한 {{ products.length }}개 상품의 만기에 맞춰 자금을 자동 배분합니다.
        </p>
        <div class="picks">
          <div v-for="p in products" :key="p.favoriteId" class="pick">
            <div>
              <span class="pick-tag">{{ p.tag }}</span>
              <span class="pick-name">{{ p.name }}</span>
              <div class="pick-meta">{{ p.meta }}</div>
            </div>
            <div class="pick-mat">만기 {{ p.maturity }}개월</div>
          </div>
        </div>

        <div class="input-grid">
          <div class="input-row">
            <span>총 투자금액</span>
            <span class="fund-display">{{ formatKRW(totalFund) }}</span>
          </div>
          <label class="input-row">
            <span>매달 더 필요한 돈</span>
            <span class="input-wrap">
              <input v-model.number="monthlyNeedMan" type="number" min="10" step="10" />
              <em>만원</em>
            </span>
          </label>
        </div>
      </div>

      <!-- 헤드라인 -->
      <div v-if="timelineBase && timelineOpt" class="headline-card">
        <div class="hl-label">이 돈으로 쓸 수 있는 기간</div>
        <div v-if="timelineBase.funded === timelineOpt.funded" class="hl-big">
          {{ dur(timelineBase.funded) }} 사용 가능
        </div>
        <div v-else class="hl-big">
          {{ dur(timelineBase.funded) }} ~ {{ dur(timelineOpt.funded) }}
        </div>
        <div class="hl-sub">보수적 기준 ~ 이자 반영 기준</div>
      </div>

      <!-- 파킹/CMA 안내 -->
      <div v-if="parking" class="survey-card park-card">
        <div class="park-head">
          <span class="park-badge">즉시 인출</span>
          <b>파킹통장·CMA</b>
        </div>
        <p class="park-body">
          첫 상품 만기({{ products[0].maturity }}개월) 전까지 쓸 돈은
          입출금이 자유로운 <b>파킹통장·CMA</b>에 넣어두는 것을 추천합니다.
        </p>
        <div class="park-amt">{{ formatKRW(parking.invest) }}</div>
      </div>

      <!-- 타임라인 -->
      <div v-if="timeline" class="survey-card">
        <h2 class="tl-title">시기별로 어디서 돈이 나오는지</h2>
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
          <span class="l-gap">자금 공백 구간</span>
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
            <template v-if="seg.type === 'gap'">
              <td>자금 공백 구간 ({{ seg.from }}~{{ seg.to }}개월차)</td>
              <td class="gap-cell">0원</td>
            </template>
            <template v-else>
              <td>{{ seg.name }} ({{ seg.from }}~{{ seg.to }}개월차)</td>
              <td>{{ formatKRW(seg.amount) }}</td>
            </template>
          </tr>
        </table>

        <div v-if="timeline.gap > 0" class="info-box warn">
          총 <b>{{ timeline.gap }}개월</b>은 상품 만기가 이어지지 않아 자금 공백이 생깁니다.
          총 투자금액을 늘리거나, 만기가 더 짧은 상품을 추가하면 공백을 줄일 수 있습니다.
        </div>
        <div v-else class="info-box">
          상품이 바뀌는 시점마다 <b>끊기지 않고</b> 이어집니다.
        </div>

        <p class="footnote">
          {{
            optimistic
              ? "예금·적금 등 확정금리 상품에 기본금리를 반영한 낙관적 계산입니다. 변동금리 상품은 원금 그대로 계산했습니다."
              : "이자 없이 원금만 쓴다고 가정한 일반적인(보수적) 계산입니다."
          }}
        </p>
      </div>

      <!-- 저장 -->
      <div class="save-row">
        <button class="btn-save" :disabled="saving || !allocation" @click="handleSave">
          {{ saving ? "저장 중..." : "배분 결과 저장" }}
        </button>
        <span v-if="saveMsg" class="save-msg">{{ saveMsg }}</span>
      </div>
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

.link-back {
  border: none;
  background: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
  cursor: pointer;
}

/* 상품 요약 */
.picks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pick {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1.5px solid var(--card-border);
  border-radius: 14px;
  padding: 14px 16px;
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

.pick-mat {
  font-weight: 800;
  color: var(--text-dark);
  font-size: 14px;
  white-space: nowrap;
}

/* 입력 */
.input-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
}

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

.fund-display {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
  padding: 8px 0;
}

/* 헤드라인 */
.headline-card {
  background: var(--text-dark);
  color: #fff;
  text-align: center;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  padding: 28px;
  margin-bottom: 14px;
}

.hl-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.hl-big {
  font-size: 34px;
  font-weight: 800;
  color: var(--kb-yellow);
  margin: 6px 0;
}

.hl-sub {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  margin-top: 4px;
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

/* 파킹/CMA 카드 */
.park-card {
  border-left: 4px solid #0d9488;
}

.park-head {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.park-badge {
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  background: #0d9488;
  border-radius: 10px;
  padding: 2px 8px;
}

.park-body {
  color: var(--text-muted);
  font-size: 13.5px;
  margin: 8px 0 6px;
  line-height: 1.5;
}

.park-amt {
  font-weight: 800;
  font-size: 18px;
  color: #0d9488;
  text-align: right;
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

.seg.park { background: #0d9488; }
.seg.short { background: #2563eb; }
.seg.mid { background: #4f46e5; }
.seg.long { background: #1e1b4b; }

.seg.gap {
  background: repeating-linear-gradient(
    45deg,
    #e5e7eb,
    #e5e7eb 6px,
    #f3f4f6 6px,
    #f3f4f6 12px
  );
  color: var(--text-muted);
}

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

.l-park::before { background: #0d9488; }
.l-short::before { background: #2563eb; }
.l-mid::before { background: #4f46e5; }
.l-long::before { background: #1e1b4b; }
.l-gap::before { background: #e5e7eb; border: 1px solid #d1d5db; }

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

.gap-cell {
  color: #b7853e;
}

/* 안내 박스 */
.info-box {
  background: var(--kb-yellow-soft);
  border-left: 4px solid var(--kb-yellow);
  padding: 14px 16px;
  font-size: 14.5px;
  margin-top: 10px;
  border-radius: 0 8px 8px 0;
}

.info-box b {
  color: var(--kb-yellow-deep);
}

.info-box.warn {
  border-left-color: #b7853e;
  background: #fbf1dc;
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

.save-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
}

.btn-save {
  background: var(--kb-yellow);
  color: var(--btn-text);
  border: none;
  font-size: 16px;
  font-weight: 800;
  padding: 14px 32px;
  border-radius: 14px;
  cursor: pointer;
  width: 100%;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.save-msg {
  font-size: 14px;
  font-weight: 700;
  color: var(--kb-yellow-deep);
  white-space: nowrap;
}

@media (max-width: 560px) {
  .input-grid {
    grid-template-columns: 1fr;
  }
}
</style>
