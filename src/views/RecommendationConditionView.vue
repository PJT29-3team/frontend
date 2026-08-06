<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFavoriteProperties } from '@/api/favoriteApi';
import {
  useRecommendationStore,
  RISK_OPTIONS,
  formatKRW,
} from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const rec = useRecommendationStore();

onMounted(async () => {
  if (rec.fundingAmount === 156_500_000 || rec.fundingAmount === 0) {
    try {
      const favorites = await getFavoriteProperties();
      const selectedHome = favorites.find(h => h.selected === 'Y') || favorites[0];
      if (selectedHome) {
        rec.setFundingAmount(selectedHome.remainingAmount);
      }
    } catch (e) {
      console.warn('Failed to fetch favorite properties', e);
    }
  }
});

// 입력은 만원 단위, 저장은 원 단위(×10000).
const immediateManwon = computed({
  get: () => Math.round(rec.immediateExpense / 10000),
  set: (v) => rec.setImmediateExpense((Number(v) || 0) * 10000),
});
const monthlyManwon = computed({
  get: () => Math.round(rec.monthlyNeed / 10000),
  set: (v) => rec.setMonthlyNeed((Number(v) || 0) * 10000),
});
function addImmediate(manwon) {
  rec.setImmediateExpense(rec.immediateExpense + manwon * 10000);
}
function addMonthly(manwon) {
  rec.setMonthlyNeed(rec.monthlyNeed + manwon * 10000);
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
          이사 후 남은 자금에서 당장 쓸 돈과 매달 쓸 돈만 정하면, 기간별로 어울리는 상품을 보여드립니다.
        </p>
      </header>

      <div class="survey-card">
        <div class="intro">
          <span class="intro-pill">투자 금액</span>
          <h2 class="intro-title">얼마를 굴릴지 정해주세요</h2>
          <p class="intro-sub">당장 쓸 돈을 빼면 나머지가 투자 금액이 됩니다.</p>
        </div>

        <!-- 당장 쓸 돈: 남은 돈 − 즉시지출 = 투자금액 (세로 뺄셈 계산식) -->
        <section class="block">
          <h3 class="block-title">당장 쓸 돈 빼두기</h3>
          <p class="block-desc">병원비나 대출 상환처럼 당장 반드시 지출해야 하는 <b>필수 자금</b>만 입력해 주세요. (없을 경우 0으로 둡니다)</p>

          <div class="calc-box">
            <div class="calc-row summary-row">
              <span class="calc-label">이사 후 남은 돈</span>
              <strong class="calc-amount">{{ formatKRW(rec.fundingAmount) }}</strong>
            </div>

            <div class="calc-input-section">
              <div class="calc-row">
                <span class="calc-label highlight">당장 쓸 돈</span>
                <div class="amount-input-row">
                  <input class="amount-input" type="number" min="0" step="10" v-model.number="immediateManwon" aria-label="당장 쓸 돈(만원)" />
                  <span class="amount-unit">만원</span>
                </div>
              </div>
              <div class="quick-row">
                <button v-for="q in [100, 500, 1000]" :key="q" type="button" class="quick-chip" @click="addImmediate(q)">+{{ q }}만원</button>
                <button type="button" class="quick-chip reset" @click="rec.setImmediateExpense(0)">초기화</button>
              </div>
              <div class="calc-sub-amount">
                <span class="minus-text">−{{ formatKRW(rec.immediateExpense) }} 빼기</span>
              </div>
            </div>

            <div class="calc-total">
              <span class="calc-total-label">최종 투자 금액</span>
              <strong class="calc-total-value">{{ formatKRW(rec.investAmount) }}</strong>
            </div>
          </div>
        </section>

        <hr class="divider" />

        <!-- 매달 쓸 돈 -->
        <section class="block">
          <h3 class="block-title">매달 쓸 돈</h3>
          <p class="block-desc">매달 얼마씩 꺼내 쓸지 정하면, 담은 상품으로 몇 달을 쓸 수 있는지 계산해 드립니다.</p>

          <div class="calc-input-section">
            <div class="calc-row">
              <span class="calc-label">매달 쓸 돈</span>
              <div class="amount-input-row">
                <input class="amount-input" type="number" min="0" step="10" v-model.number="monthlyManwon" aria-label="매달 쓸 돈(만원)" />
                <span class="amount-unit">만원</span>
              </div>
            </div>
            <div class="quick-row">
              <button v-for="q in [10, 50, 100]" :key="q" type="button" class="quick-chip" @click="addMonthly(q)">+{{ q }}만원</button>
              <button type="button" class="quick-chip reset" @click="rec.setMonthlyNeed(0)">초기화</button>
            </div>
            <div class="calc-sub-amount">
              <strong class="calc-amount">{{ formatKRW(rec.monthlyNeed) }}</strong>
            </div>
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

.calc-label { font-size: 14px; color: var(--text-muted); }

.divider { border: none; border-top: 1px solid var(--card-border); margin: 20px 0; }

.block-head { display: flex; justify-content: space-between; align-items: baseline; }
.block-title { font-weight: 800; font-size: 18px; margin: 0 0 4px; }
.block-desc { color: var(--text-muted); font-size: 13.5px; margin: 0 0 16px; }
.calc-row { display: flex; justify-content: space-between; align-items: center; }
.calc-box { background: #f9f9fa; border-radius: 12px; padding: 24px; border: 1px solid var(--card-border); }
.calc-row.summary-row { margin-bottom: 20px; }
.calc-input-section { background: #fff; border-radius: 10px; padding: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); border: 1px solid #eaeaea; }
.calc-sub-amount { text-align: right; margin-top: 14px; }
.minus-text { color: #c0442e; font-weight: 700; font-size: 15px; }

.amount-input-row { display: flex; align-items: center; gap: 8px; }
.amount-input { width: 140px; font-size: 18px; padding: 10px 12px; text-align: right; border: 1.5px solid var(--card-border); border-radius: 8px; font-weight: 800; color: var(--text-dark); transition: border-color .2s; }
.amount-input:focus { outline: none; border-color: var(--kb-yellow-deep); }
.amount-unit { font-size: 15px; font-weight: 700; color: var(--text-dark); }
.calc-amount { font-size: 19px; font-weight: 800; color: var(--text-dark); white-space: nowrap; }

.calc-total { display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 18px; border-top: 2px dashed #ccc; }
.calc-total-label { font-size: 16px; font-weight: 800; color: var(--text-dark); }
.calc-total-value { font-size: 26px; font-weight: 800; color: var(--kb-yellow-deep); }

.quick-row { display: flex; align-items: center; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
.quick-chip { padding: 9px 14px; border-radius: 8px; border: 1px solid var(--card-border); background: #fafafa; font-weight: 700; font-size: 13.5px; color: #555; cursor: pointer; transition: background .15s; }
.quick-chip:hover { background: #f0f0f0; }
.quick-chip.reset { color: #888; background: transparent; border-color: transparent; padding: 9px 8px; font-size: 13px; }
.quick-chip.reset:hover { background: #f5f5f5; }

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

.submit-row { display: flex; justify-content: flex-end; margin-top: 22px; }
.submit-row .primary-btn { width: auto; min-width: 240px; margin: 0; padding: 15px 32px; }

.rec-footer { background: #46413a; color: #cdc7bc; margin-top: 36px; }
.footer-inner { max-width: 1140px; margin: 0 auto; padding: 30px 32px 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.footer-col h4 { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
.footer-col ul { margin: 0; padding-left: 16px; }
.footer-col li { font-size: 12.5px; line-height: 1.7; color: #b7b1a6; }

@media (max-width: 600px) {
  .risk-cards { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 18px; }
  .submit-row .primary-btn { width: 100%; }
}
</style>
