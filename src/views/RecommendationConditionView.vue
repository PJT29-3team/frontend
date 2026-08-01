<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useRecommendationStore,
  RISK_OPTIONS,
  PERIOD_OPTIONS,
  RATIO_MIN,
  RATIO_MAX,
  formatKRW,
} from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const rec = useRecommendationStore();

// 상단 여정 진행바는 공용 App.vue가 렌더한다.

const QUICK_RATIOS = [10, 15, 20];

// 안전도/기간 카드 아이콘 (인라인 SVG, 신뢰된 상수).
const RISK_ICONS = {
  VERY_LOW:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  LOW:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V6z"/></svg>',
  MEDIUM:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 12 7 12 10 5 14 19 17 12 21 12"/></svg>',
};
const CALENDAR_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="2"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="2.5" x2="8" y2="6.5"/><line x1="16" y1="2.5" x2="16" y2="6.5"/></svg>';

const ratioFill = computed(
  () => ((rec.ratioPercent - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100,
);
const canSubmit = computed(
  () => !!rec.riskLevel && !!rec.periodCode && rec.ratioPercent >= RATIO_MIN,
);

function onSlider(e) {
  rec.setRatio(e.target.valueAsNumber);
}
function submit() {
  if (!canSubmit.value) return;
  router.push('/recommendation/result');
}
</script>

<template>
  <div class="rec-page">
    <div class="rec-shell">
      <!-- 헤더 -->
      <header class="rec-head">
        <div>
          <h1 class="rec-title">내게 맞는 금융상품 찾기</h1>
          <p class="rec-sub">
            이사 후 남은 자금 중 투자할 비율과 원하는 안정성, 기간을 선택하면 조건에
            맞는 상품을 보여드립니다.
          </p>
        </div>
        <div class="funding">
          <span class="funding-label">이사 후 여유자금</span>
          <strong class="funding-value">약 {{ formatKRW(rec.fundingAmount) }}</strong>
        </div>
      </header>

      <div class="survey-card">
        <!-- 추천 조건 인트로 -->
        <div class="intro">
          <span class="intro-pill">추천 조건</span>
          <h2 class="intro-title">세 가지만 선택해주세요</h2>
          <p class="intro-sub">선택할 때마다 추천 금액과 상품이 바로 바뀝니다.</p>
        </div>

        <!-- 1. 투자 비율 -->
        <section class="block">
          <div class="block-head">
            <h3 class="block-title"><span class="num">1.</span> 투자 비율 정하기</h3>
            <span class="ratio-value">{{ rec.ratioPercent }}%</span>
          </div>
          <p class="block-desc">생활에 필요한 현금을 남길 수 있도록 2~30% 안에서 선택합니다.</p>

          <div class="slider-row">
            <button
              class="step-round"
              type="button"
              aria-label="비율 낮추기"
              @click="rec.setRatio(rec.ratioPercent - 1)"
            >
              −
            </button>
            <div class="slider-wrap">
              <input
                class="ratio-slider"
                type="range"
                :min="RATIO_MIN"
                :max="RATIO_MAX"
                :value="rec.ratioPercent"
                :style="{ '--fill': ratioFill + '%' }"
                aria-label="투자 비율"
                @input="onSlider"
              />
              <div class="slider-scale">
                <span>{{ RATIO_MIN }}%</span>
                <span>추천 범위</span>
                <span>{{ RATIO_MAX }}%</span>
              </div>
            </div>
            <button
              class="step-round"
              type="button"
              aria-label="비율 높이기"
              @click="rec.setRatio(rec.ratioPercent + 1)"
            >
              +
            </button>
          </div>

          <div class="quick-row">
            <span class="quick-label">빠른 선택</span>
            <button
              v-for="q in QUICK_RATIOS"
              :key="q"
              type="button"
              class="quick-chip"
              :class="{ on: rec.ratioPercent === q }"
              @click="rec.setRatio(q)"
            >
              {{ q }}%
            </button>
          </div>
        </section>

        <hr class="divider" />

        <!-- 2. 안전도 -->
        <section class="block">
          <h3 class="block-title"><span class="num">2.</span> 안전도 선택하기</h3>
          <div class="option-grid">
            <button
              v-for="opt in RISK_OPTIONS"
              :key="opt.code"
              type="button"
              class="option-card"
              :class="{ on: rec.riskLevel === opt.code }"
              @click="rec.setRisk(opt.code)"
            >
              <span class="option-check" v-if="rec.riskLevel === opt.code">✓</span>
              <span class="option-icon" v-html="RISK_ICONS[opt.code]"></span>
              <span class="option-text">
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-desc">{{ opt.subtitle }}</span>
              </span>
            </button>
          </div>

          <div
            v-if="rec.selectedRisk"
            class="helper-box"
            :class="rec.selectedRisk.tone"
          >
            <strong>{{ rec.selectedRisk.helperTitle }}</strong>
            <p>{{ rec.selectedRisk.helperBody }}</p>
          </div>
        </section>

        <hr class="divider" />

        <!-- 3. 투자 기간 -->
        <section class="block">
          <h3 class="block-title"><span class="num">3.</span> 투자 기간 선택하기</h3>
          <div class="option-grid">
            <button
              v-for="opt in PERIOD_OPTIONS"
              :key="opt.code"
              type="button"
              class="option-card"
              :class="{ on: rec.periodCode === opt.code }"
              @click="rec.setPeriod(opt.code)"
            >
              <span class="option-check" v-if="rec.periodCode === opt.code">✓</span>
              <span class="option-icon" v-html="CALENDAR_ICON"></span>
              <span class="option-text">
                <span class="option-label">{{ opt.label }}</span>
                <span class="option-desc">{{ opt.desc }}</span>
              </span>
            </button>
          </div>
        </section>
      </div>

      <!-- 제출 (카드 밖, 우측 정렬) -->
      <div class="submit-row">
        <button class="primary-btn" :disabled="!canSubmit" @click="submit">
          내게 맞는 금융상품 찾기 →
        </button>
      </div>
    </div>

    <!-- 하단 안내 푸터 -->
    <footer class="rec-footer">
      <div class="footer-inner">
        <div class="footer-col">
          <h4>투자 및 예금 관련 안내</h4>
          <ul>
            <li>본 서비스에서 제공하는 정보는 참고용이며, 투자 또는 금융상품 가입을 권유하는 것이 아닙니다.</li>
            <li>금융상품 가입 전 상품설명서 및 약관을 반드시 확인하시기 바랍니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>원금손실 가능성</h4>
          <ul>
            <li>예금자보호 대상이 아닌 금융상품은 원금 손실이 발생할 수 있습니다.</li>
            <li>투자 성과는 시장 상황에 따라 변동될 수 있으며, 과거 수익률이 미래 수익을 보장하지 않습니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>예금자보호 안내</h4>
          <ul>
            <li>예금자보호 대상 상품은 「예금자보호법」에 따라 금융회사별 원금과 소정의 이자를 합하여 1인당 최고 1억 원까지 보호됩니다.</li>
            <li>보호 여부는 상품마다 다르므로 가입 전 확인이 필요합니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>정보 제공 기준</h4>
          <ul>
            <li>상품 정보와 금리는 조회 시점 기준으로 제공되며, 실제 가입 시 변경될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.rec-page {
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}
.rec-shell {
  max-width: 900px;
  margin: 0 auto;
  padding: 28px 20px 48px;
  font-size: 16px;
  line-height: 1.55;
}

/* 헤더 */
.rec-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 22px;
}
.rec-title {
  font-weight: 800;
  font-size: 26px;
  margin: 0 0 8px;
}
.rec-sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
  max-width: 520px;
}
.funding {
  border-left: 3px solid var(--kb-yellow);
  padding-left: 14px;
  text-align: right;
  white-space: nowrap;
}
.funding-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
}
.funding-value {
  font-size: 22px;
  color: var(--text-dark);
}

/* 추천 조건 인트로 */
.intro {
  margin-bottom: 24px;
}
.intro-pill {
  display: inline-block;
  background: var(--card-selected-bg);
  color: var(--kb-yellow-deep);
  font-size: 12.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}
.intro-title {
  font-weight: 800;
  font-size: 22px;
  margin: 12px 0 6px;
}
.intro-sub {
  color: var(--text-muted);
  font-size: 14px;
  margin: 0;
}

/* 섹션 */
.block {
  margin-bottom: 4px;
}
.block-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.block-title {
  font-weight: 800;
  font-size: 18px;
  margin: 0 0 4px;
}
.block-title .num {
  color: var(--kb-yellow-deep);
  margin-right: 4px;
}
.block-desc {
  color: var(--text-muted);
  font-size: 13.5px;
  margin: 0 0 16px;
}
.ratio-value {
  font-weight: 800;
  font-size: 24px;
  color: var(--text-dark);
}
.divider {
  border: none;
  border-top: 1px solid var(--card-border);
  margin: 26px 0;
}

/* 슬라이더 */
.slider-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.step-round {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 50%;
  border: 1.5px solid var(--card-border);
  background: #fff;
  font-size: 22px;
  line-height: 1;
  color: var(--text-dark);
  cursor: pointer;
}
.slider-wrap {
  flex: 1;
}
.ratio-slider {
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 6px;
  background: linear-gradient(
    to right,
    var(--kb-yellow) 0%,
    var(--kb-yellow) var(--fill, 0%),
    #2f2b26 var(--fill, 0%),
    #2f2b26 100%
  );
  outline: none;
}
.ratio-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e3a500;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);
  cursor: pointer;
}
.ratio-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e3a500;
  border: 2px solid #fff;
  cursor: pointer;
}
.slider-scale {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* 빠른 선택 */
.quick-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}
.quick-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-right: 4px;
}
.quick-chip {
  padding: 9px 20px;
  border-radius: 10px;
  border: 1.4px solid var(--card-border);
  background: #fff;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
}
.quick-chip.on {
  background: var(--text-dark);
  border-color: var(--text-dark);
  color: #fff;
}

/* 선택 카드 그리드 */
.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.option-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px solid var(--card-border);
  border-radius: 16px;
  padding: 18px 16px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  min-height: 78px;
}
.option-card.on {
  background: var(--card-selected-bg);
  border-color: var(--card-selected-border);
}
.option-icon {
  flex: none;
  width: 26px;
  height: 26px;
  color: var(--text-dark);
}
.option-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.option-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.option-label {
  font-weight: 800;
  font-size: 15.5px;
}
.option-desc {
  font-size: 12.5px;
  color: var(--text-muted);
}
.option-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--card-selected-border);
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 안내 박스 (안전도별 색) */
.helper-box {
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 16px;
  border-left: 5px solid transparent;
}
.helper-box strong {
  display: block;
  font-size: 14.5px;
  margin-bottom: 4px;
}
.helper-box p {
  margin: 0;
  font-size: 13px;
  line-height: 1.55;
}
.helper-box.safe {
  background: #eef7ee;
  border-left-color: #5aa469;
  color: #276749;
}
.helper-box.caution {
  background: #fbf4e2;
  border-left-color: #d9a441;
  color: #8a6a20;
}
.helper-box.warn {
  background: #fdeeee;
  border-left-color: #cf7676;
  color: #9b3b3b;
}

/* 제출 버튼 (카드 밖, 우측 정렬) */
.submit-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 22px;
}
.submit-row .primary-btn {
  width: auto;
  min-width: 240px;
  margin: 0;
  padding: 15px 32px;
}

/* 하단 안내 푸터 */
.rec-footer {
  background: #46413a;
  color: #cdc7bc;
  margin-top: 36px;
}
.footer-inner {
  max-width: 1140px;
  margin: 0 auto;
  padding: 34px 32px 40px;
}
.footer-col {
  margin-bottom: 20px;
}
.footer-col:last-child {
  margin-bottom: 0;
}
.footer-col h4 {
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
}
.footer-col ul {
  margin: 0;
  padding-left: 16px;
}
.footer-col li {
  font-size: 12.5px;
  line-height: 1.7;
  color: #b7b1a6;
}

@media (max-width: 600px) {
  .rec-head {
    flex-direction: column;
  }
  .funding {
    text-align: left;
  }
  .option-grid {
    grid-template-columns: 1fr;
  }
  .submit-row .primary-btn {
    width: 100%;
  }
}
</style>
