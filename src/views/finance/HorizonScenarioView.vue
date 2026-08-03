<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { fetchFavoriteProducts } from "@/api/financeApi";
import { buildTimeline } from "@/utils/finance/horizonTimeline";
import { termGroupOf } from "@/utils/finance/portfolioAllocation";
import "@/styles/survey-tokens.css";

const router = useRouter();

const TERM_LABELS = { UNDER_1Y: "단기", Y1_TO_3: "중기", OVER_3Y: "장기" };

const products = ref([]);
const monthlyNeed = ref(100);
const optimistic = ref(false);
const loadError = ref("");

onMounted(async () => {
  try {
    const items = await fetchFavoriteProducts();
    products.value = items
      .filter((item) => item.amount > 0)
      .map((item) => ({
        name: item.productName,
        invest: Math.round(item.amount / 10_000),
        maturity: item.termMonths || 0,
        rate: Number(item.annualRate) / 100,
        fixed:
          item.maxAnnualRate == null ||
          Number(item.annualRate) === Number(item.maxAnnualRate),
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

const timeline = computed(() => {
  if (!products.value.length || monthlyNeed.value <= 0) return null;
  return buildTimeline(products.value, monthlyNeed.value, optimistic.value);
});

function dur(m) {
  if (m >= 600) return "50년 이상";
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo}개월`;
  if (mo === 0) return `${y}년`;
  return `${y}년 ${mo}개월`;
}

function fmt(v) {
  return Math.round(v).toLocaleString("ko-KR") + "만원";
}

function segPct(seg) {
  if (!timeline.value || timeline.value.span === 0) return 0;
  return Math.max(2, Math.round((seg.months / timeline.value.span) * 100));
}
</script>

<template>
  <div class="hz-shell">
    <button class="link-back" type="button" @click="router.push('/recommendation/result')">
      ← 추천 결과로 돌아가기
    </button>

    <p v-if="loadError" class="notice error">{{ loadError }}</p>

    <template v-if="products.length">
      <!-- 선택 상품 요약 -->
      <div class="survey-card">
        <h1 class="step-title" style="text-align:left;margin-top:0">선택하신 금융상품</h1>
        <p class="step-desc" style="text-align:left">
          관심 등록한 {{ products.length }}개 상품을 기준으로 계산합니다.
        </p>
        <div class="picks">
          <div v-for="p in products" :key="p.name" class="pick">
            <div>
              <span class="pick-tag">{{ p.tag }}</span>
              <span class="pick-name">{{ p.name }}</span>
              <div class="pick-meta">{{ p.meta }}</div>
            </div>
            <div class="pick-amt">{{ fmt(p.invest) }}</div>
          </div>
        </div>

        <div class="input-row">
          <label for="need">매달 쓸 돈</label>
          <input
            id="need"
            v-model.number="monthlyNeed"
            type="number"
            min="10"
            step="10"
          />
          <span>만원</span>
        </div>
      </div>

      <!-- 헤드라인 -->
      <div v-if="timeline" class="headline-card">
        <div class="hl-label">이 돈으로 쓸 수 있는 기간</div>
        <div class="hl-big">{{ dur(timeline.funded) }} 사용 가능</div>
        <div class="toggle-row">
          <button
            class="toggle"
            :class="{ active: !optimistic }"
            @click="optimistic = false"
          >
            일반적으로 계산
          </button>
          <button
            class="toggle"
            :class="{ active: optimistic }"
            @click="optimistic = true"
          >
            이자까지 반영하면
          </button>
        </div>
      </div>

      <!-- 타임라인 -->
      <div v-if="timeline" class="survey-card">
        <h2 class="tl-title">시기별로 어디서 돈이 나오는지</h2>
        <div class="legend">
          <span class="l-short">단기(CMA)</span>
          <span class="l-mid">중기(적금)</span>
          <span class="l-long">장기(채권)</span>
          <span class="l-gap">돈이 없는 구간</span>
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
              <td>돈이 없는 구간 ({{ seg.from }}~{{ seg.to }}개월차)</td>
              <td class="gap-cell">0원</td>
            </template>
            <template v-else>
              <td>{{ seg.name }} ({{ seg.from }}~{{ seg.to }}개월차)</td>
              <td>{{ fmt(seg.amount) }}</td>
            </template>
          </tr>
        </table>

        <div v-if="timeline.gap > 0" class="info-box warn">
          총 <b>{{ timeline.gap }}개월</b>은 만기 전이라 쓸 수 있는 돈이 없습니다.
          다음 상품 만기를 앞당기거나, 배분 금액을 조정하시는 게 좋습니다.
        </div>
        <div v-else class="info-box">
          상품이 바뀌는 시점마다 <b>끊기지 않고</b> 이어집니다.
        </div>

        <p class="footnote">
          {{
            optimistic
              ? "예금·CMA 등 확정금리 상품에 기본금리를 반영한 낙관적 계산입니다. 변동금리 상품은 원금 그대로 계산했습니다."
              : "이자 없이 원금만 쓴다고 가정한 일반적인(보수적) 계산입니다."
          }}
        </p>
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

.pick-amt {
  font-weight: 800;
  color: var(--kb-yellow-deep);
  font-size: 15px;
  white-space: nowrap;
}

/* 입력 */
.input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

.input-row label {
  font-size: 14px;
  font-weight: 600;
}

.input-row input {
  width: 100px;
  font-size: 15px;
  padding: 8px 10px;
  text-align: right;
  border: 1.5px solid var(--card-border);
  border-radius: 8px;
  font-weight: 700;
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

.toggle-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 14px;
}

.toggle {
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
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

.seg.short {
  background: var(--text-dark);
}

.seg.mid {
  background: var(--kb-yellow-deep);
}

.seg.long {
  background: var(--kb-yellow);
  color: var(--text-dark);
}

.seg.gap {
  background: repeating-linear-gradient(
    45deg,
    var(--kb-yellow-deep),
    var(--kb-yellow-deep) 6px,
    var(--kb-yellow-soft) 6px,
    var(--kb-yellow-soft) 12px
  );
  color: #fff;
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

.l-short::before { background: var(--text-dark); }
.l-mid::before { background: var(--kb-yellow-deep); }
.l-long::before { background: var(--kb-yellow); }
.l-gap::before { background: var(--kb-yellow-deep); }

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
  color: var(--kb-yellow-deep);
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
  border-left-color: var(--kb-yellow-deep);
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
</style>
