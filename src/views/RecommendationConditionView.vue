<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  useRecommendationStore,
  RISK_OPTIONS,
  RATIO_MIN,
  RATIO_MAX,
  formatKRW,
} from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const rec = useRecommendationStore();

const QUICK_RATIOS = [10, 15, 20];

const ratioFill = computed(
  () => ((rec.ratioPercent - RATIO_MIN) / (RATIO_MAX - RATIO_MIN)) * 100,
);

function onSlider(e) {
  rec.setRatio(e.target.valueAsNumber);
}
function submit() {
  router.push('/recommendation/result');
}
</script>

<template>
  <div class="rec-page">
    <div class="rec-shell">
      <header class="rec-head">
        <h1 class="rec-title">내게 맞는 금융상품 찾기</h1>
        <p class="rec-sub">
          이사 후 남은 자금 중 투자에 쓸 비율만 정하면, 기간별로 어울리는 상품을 보여드립니다.
        </p>
      </header>

      <div class="survey-card">
        <div class="intro">
          <span class="intro-pill">투자 금액</span>
          <h2 class="intro-title">투자할 비율만 정해주세요</h2>
          <p class="intro-sub">움직일 때마다 투자 금액이 바로 바뀝니다.</p>
        </div>

        <!-- 남은 돈 -->
        <div class="amount-line">
          <span class="amount-label">이사 후 남은 돈</span>
          <strong class="amount-value">{{ formatKRW(rec.fundingAmount) }}</strong>
        </div>

        <hr class="divider" />

        <!-- 투자 비율 -->
        <section class="block">
          <div class="block-head">
            <h3 class="block-title">투자 비율 정하기</h3>
            <span class="ratio-value">{{ rec.ratioPercent }}%</span>
          </div>
          <p class="block-desc">생활에 필요한 현금을 남길 수 있도록 2~30% 안에서 선택합니다.</p>

          <div class="slider-row">
            <button class="step-round" type="button" aria-label="비율 낮추기" @click="rec.setRatio(rec.ratioPercent - 1)">−</button>
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
            <button class="step-round" type="button" aria-label="비율 높이기" @click="rec.setRatio(rec.ratioPercent + 1)">+</button>
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
            >{{ q }}%</button>
          </div>
        </section>

        <hr class="divider" />

        <!-- 위험도 선택 -->
        <section class="block">
          <div class="block-head">
            <h3 class="block-title">위험도 선택하기</h3>
          </div>
          <p class="block-desc">
            감수할 수 있는 위험 수준을 골라주세요. 선택한 위험도 위주로 추천하고,
            해당 기간에 맞는 상품이 없으면 가까운 등급으로 채워드립니다.
          </p>

          <div class="risk-cards">
            <button
              v-for="opt in RISK_OPTIONS"
              :key="opt.code"
              type="button"
              class="risk-card"
              :class="[{ on: rec.riskLevel === opt.code }, 'tone-' + opt.tone]"
              @click="rec.setRisk(opt.code)"
            >
              <span class="risk-grade">{{ opt.grade }}등급</span>
              <strong class="risk-label">{{ opt.label }}</strong>
              <span class="risk-sub">{{ opt.subtitle }}</span>
            </button>
          </div>

          <div v-if="rec.selectedRisk" class="risk-helper" :class="'tone-' + rec.selectedRisk.tone">
            <strong class="rh-title">{{ rec.selectedRisk.helperTitle }}</strong>
            <p class="rh-body">{{ rec.selectedRisk.helperBody }}</p>
          </div>
        </section>

        <!-- 결과 금액 -->
        <div class="result-box">
          <div class="result-cell">
            <span class="rc-label">투자 금액</span>
            <strong class="rc-value invest">{{ formatKRW(rec.investAmount) }}</strong>
          </div>
          <div class="result-cell">
            <span class="rc-label">남길 현금</span>
            <strong class="rc-value">{{ formatKRW(rec.remainingCash) }}</strong>
          </div>
        </div>
      </div>

      <div class="submit-row">
        <button class="primary-btn" @click="submit">기간별 추천 상품 보기 →</button>
      </div>
    </div>

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
          <h4>원금손실 가능성 / 예금자보호 안내</h4>
          <ul>
            <li>예금자보호 대상이 아닌 금융상품은 원금 손실이 발생할 수 있습니다.</li>
            <li>예금자보호 대상 상품은 「예금자보호법」에 따라 1인당 최고 5천만원까지 보호됩니다.</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.rec-page { font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif; color: var(--text-dark); }
.rec-shell { max-width: 760px; margin: 0 auto; padding: 28px 20px 48px; font-size: 16px; line-height: 1.55; }
.rec-head { margin-bottom: 22px; }
.rec-title { font-weight: 800; font-size: 26px; margin: 0 0 8px; }
.rec-sub { color: var(--text-muted); font-size: 14px; margin: 0; max-width: 560px; }

.intro { margin-bottom: 20px; }
.intro-pill { display: inline-block; background: var(--card-selected-bg); color: var(--kb-yellow-deep); font-size: 12.5px; font-weight: 700; padding: 5px 12px; border-radius: 999px; }
.intro-title { font-weight: 800; font-size: 22px; margin: 12px 0 6px; }
.intro-sub { color: var(--text-muted); font-size: 14px; margin: 0; }

.amount-line { display: flex; justify-content: space-between; align-items: baseline; padding: 6px 0; }
.amount-label { color: var(--text-muted); font-size: 14px; }
.amount-value { font-size: 20px; font-weight: 800; }

.divider { border: none; border-top: 1px solid var(--card-border); margin: 20px 0; }

.block-head { display: flex; justify-content: space-between; align-items: baseline; }
.block-title { font-weight: 800; font-size: 18px; margin: 0 0 4px; }
.block-desc { color: var(--text-muted); font-size: 13.5px; margin: 0 0 16px; }
.ratio-value { font-weight: 800; font-size: 24px; }

.slider-row { display: flex; align-items: center; gap: 14px; }
.step-round { width: 44px; height: 44px; flex: none; border-radius: 50%; border: 1.5px solid var(--card-border); background: #fff; font-size: 22px; line-height: 1; cursor: pointer; }
.slider-wrap { flex: 1; }
.ratio-slider { width: 100%; -webkit-appearance: none; appearance: none; height: 8px; border-radius: 6px;
  background: linear-gradient(to right, var(--kb-yellow) 0%, var(--kb-yellow) var(--fill,0%), #2f2b26 var(--fill,0%), #2f2b26 100%); outline: none; }
.ratio-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; border-radius: 50%; background: #e3a500; border: 2px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.28); cursor: pointer; }
.ratio-slider::-moz-range-thumb { width: 22px; height: 22px; border-radius: 50%; background: #e3a500; border: 2px solid #fff; cursor: pointer; }
.slider-scale { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); margin-top: 8px; }

.quick-row { display: flex; align-items: center; gap: 8px; margin-top: 18px; }
.quick-label { font-size: 13px; color: var(--text-muted); margin-right: 4px; }
.quick-chip { padding: 9px 20px; border-radius: 10px; border: 1.4px solid var(--card-border); background: #fff; font-weight: 700; font-size: 14px; color: var(--text-muted); cursor: pointer; }
.quick-chip.on { background: var(--text-dark); border-color: var(--text-dark); color: #fff; }

.risk-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.risk-card { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; padding: 14px; border: 1.5px solid var(--card-border); border-radius: 14px; background: #fff; cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }
.risk-card .risk-grade { font-size: 11.5px; font-weight: 700; color: var(--text-muted); }
.risk-card .risk-label { font-size: 15.5px; font-weight: 800; }
.risk-card .risk-sub { font-size: 12px; color: var(--text-muted); }
.risk-card.on.tone-safe { border-color: #2d7a44; background: #eef8f1; }
.risk-card.on.tone-caution { border-color: #b5760a; background: #fff6e6; }
.risk-card.on.tone-warn { border-color: #c0442e; background: #fdeeeb; }

.risk-helper { margin-top: 14px; border-radius: 12px; padding: 14px 16px; border-left: 4px solid; }
.risk-helper .rh-title { display: block; font-size: 14px; font-weight: 800; margin-bottom: 4px; }
.risk-helper .rh-body { font-size: 13px; margin: 0; line-height: 1.55; }
.risk-helper.tone-safe { background: #eef8f1; border-color: #2d7a44; color: #245c36; }
.risk-helper.tone-caution { background: #fff6e6; border-color: #b5760a; color: #8a5a08; }
.risk-helper.tone-warn { background: #fdeeeb; border-color: #c0442e; color: #93331f; }

.result-box { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 24px; }
.result-cell { background: #fbf6e4; border-radius: 14px; padding: 16px 18px; }
.rc-label { display: block; font-size: 13px; color: var(--text-muted); margin-bottom: 6px; }
.rc-value { font-size: 22px; font-weight: 800; }
.rc-value.invest { color: var(--kb-yellow-deep); }

.submit-row { display: flex; justify-content: flex-end; margin-top: 22px; }
.submit-row .primary-btn { width: auto; min-width: 240px; margin: 0; padding: 15px 32px; }

.rec-footer { background: #46413a; color: #cdc7bc; margin-top: 36px; }
.footer-inner { max-width: 1140px; margin: 0 auto; padding: 30px 32px 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.footer-col h4 { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
.footer-col ul { margin: 0; padding-left: 16px; }
.footer-col li { font-size: 12.5px; line-height: 1.7; color: #b7b1a6; }

@media (max-width: 600px) {
  .risk-cards { grid-template-columns: 1fr; }
  .result-box { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 18px; }
  .submit-row .primary-btn { width: 100%; }
}
</style>
