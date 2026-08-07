<script setup>
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import {
  useRecommendationStore,
  RISK_OPTIONS,
  formatKRW,
} from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const rec = useRecommendationStore();

// 자금 조정 계산기 펼침/접힘 상태 (기본 접힘: false)
const showAdjustForm = ref(false);
const adjustSectionRef = ref(null);
const riskSectionRef = ref(null);

// 입력은 만원 단위, 저장은 원 단위(×10000).
const additionalManwon = computed({
  get: () => Math.round((rec.additionalDeposit || 0) / 10000),
  set: (v) => rec.setAdditionalDeposit((Number(v) || 0) * 10000),
});
const immediateManwon = computed({
  get: () => Math.round((rec.immediateExpense || 0) / 10000),
  set: (v) => rec.setImmediateExpense((Number(v) || 0) * 10000),
});
const monthlyManwon = computed({
  get: () => Math.round((rec.monthlyNeed || 0) / 10000),
  set: (v) => rec.setMonthlyNeed((Number(v) || 0) * 10000),
});

function addAdditional(manwon) {
  rec.setAdditionalDeposit((rec.additionalDeposit || 0) + manwon * 10000);
}
function addImmediate(manwon) {
  rec.setImmediateExpense((rec.immediateExpense || 0) + manwon * 10000);
}
function addMonthly(manwon) {
  rec.setMonthlyNeed((rec.monthlyNeed || 0) + manwon * 10000);
}

function openAdjustForm() {
  showAdjustForm.value = true;
  nextTick(() => {
    if (adjustSectionRef.value) {
      adjustSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function skipAdjust() {
  rec.setAdditionalDeposit(0);
  rec.setImmediateExpense(0);
  scrollToRisk();
}

function scrollToRisk() {
  nextTick(() => {
    if (riskSectionRef.value) {
      riskSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function submit() {
  router.push('/recommendation/result');
}
</script>

<template>
  <div class="rec-page">
    <div class="rec-shell">
      <header class="rec-head">
        <h1 class="rec-title">내게 맞는 4단계 금융상품 찾기</h1>
        <p class="rec-sub">
          이사 후 남은 자금을 4개 만기 기간(1~11개월, 12~23개월, 24~35개월, 36개월 이상)에 나누어 가장 안전하게 배치해 드립니다.
        </p>
      </header>

      <div class="survey-card">
        <!-- Step 1: 매달 꺼내 쓸 생활비 정하기 -->
        <section class="block step-block">
          <div class="block-head-wrap">
            <span class="step-badge">Step 1</span>
            <h2 class="block-title">매달 꺼내 쓸 생활비 정하기</h2>
          </div>
          <p class="block-desc">
            국민연금 등 고정 수입 외에, <strong>이 목돈에서 매달 얼마씩 꺼내 쓰실 예정인가요?</strong>
          </p>

          <!-- 전폭(Full Width) 대형 금액 입력 박스 -->
          <div class="full-input-card">
            <div class="full-input-wrap">
              <input class="full-amount-input" type="number" min="0" step="10" v-model.number="monthlyManwon" aria-label="매달 꺼내 쓸 생활비(만원)" placeholder="0" />
              <span class="full-amount-unit">만원 / 월</span>
            </div>
            <!-- 퀵 추가 버튼 + 재설정 버튼 -->
            <div class="quick-row full-quick-row">
              <div class="chips-left">
                <button v-for="q in [10, 50, 100]" :key="q" type="button" class="quick-chip" @click="addMonthly(q)">+{{ q }}만원</button>
              </div>
              <button type="button" class="quick-chip reset-btn" @click="rec.setMonthlyNeed(0)">재설정</button>
            </div>
          </div>

          <!-- 주식 평가손익 스타일 버팀 수명 요약 카드 -->
          <div class="runway-stock-card">
            <div class="stock-main-row">
              <span class="stock-label">기간별 나눠 담으면</span>
              <div class="stock-months-wrap">
                <strong class="stock-months">{{ rec.runwayAnalysis.appMonths }}개월</strong>
                <span class="stock-diff-pill">(+{{ rec.runwayAnalysis.diffMonths }}개월 연장!)</span>
              </div>
            </div>
            <div class="stock-sub-row">
              <span class="stock-sub-text">총 약 {{ rec.runwayAnalysis.appYearsText }} (현금 단순 보유 시 {{ rec.runwayAnalysis.cashYearsText }})</span>
            </div>
          </div>
        </section>

        <!-- 자금 조정 질문 & 분기 버튼 2개 (예/아니오 관습 준수, 아니오 노란색 메인 유지) -->
        <div class="adjust-decision-box">
          <p class="adjust-question">당장 빠질 긴급 자금이나, 추가로 더 넣을 돈이 있으신가요?</p>
          <div class="adjust-buttons">
            <button type="button" class="btn-decision secondary" @click="openAdjustForm">
              예, 조정할 자금 입력 (+/-)
            </button>
            <button type="button" class="btn-decision primary" @click="skipAdjust">
              ⚡ 아니오, 남은 돈 그대로 전액 굴리기
            </button>
          </div>
        </div>

        <!-- Step 2: 자금 조정 3단 계산기 (기본 접힘/Hidden) -->
        <section v-if="showAdjustForm" ref="adjustSectionRef" class="block step-block adjust-section">
          <div class="block-head-wrap">
            <span class="step-badge">Step 2</span>
            <h2 class="block-title">자금 조정하기</h2>
          </div>
          <p class="block-desc">이사 후 남은 돈에서 추가로 더할 돈이나, 미리 뺄 긴급 지출이 있다면 입력해 주세요.</p>

          <div class="subtraction-calc-box">
            <!-- 기본: 이사 후 남은 돈 -->
            <div class="calc-row base">
              <span class="calc-label">이사 후 남은 돈</span>
              <span class="calc-amount">{{ formatKRW(rec.fundingAmount) }}</span>
            </div>

            <!-- 추가로 합칠 돈 + -->
            <div class="calc-row plus-row">
              <span class="calc-label">+ 추가로 합칠 돈 (퇴직금·적금 만기 등)</span>
              <div class="amount-input-row">
                <input class="amount-input" type="number" min="0" step="10" v-model.number="additionalManwon" aria-label="추가로 합칠 돈(만원)" />
                <span class="amount-unit">만원</span>
              </div>
            </div>
            <div class="quick-row">
              <button v-for="q in [100, 500, 1000]" :key="q" type="button" class="quick-chip" @click="addAdditional(q)">+{{ q }}만원</button>
              <button type="button" class="quick-chip reset" @click="rec.setAdditionalDeposit(0)">다시 입력</button>
            </div>

            <!-- 당장 쓸 긴급 돈 - -->
            <div class="calc-row minus-row">
              <span class="calc-label">− 당장 쓸 긴급 돈 (병원비·이사비 등)</span>
              <div class="amount-input-row">
                <input class="amount-input" type="number" min="0" step="10" v-model.number="immediateManwon" aria-label="당장 쓸 긴급 돈(만원)" />
                <span class="amount-unit">만원</span>
              </div>
            </div>
            <div class="quick-row">
              <button v-for="q in [100, 500, 1000]" :key="q" type="button" class="quick-chip" @click="addImmediate(q)">+{{ q }}만원</button>
              <button type="button" class="quick-chip reset" @click="rec.setImmediateExpense(0)">다시 입력</button>
            </div>

            <!-- 최종 투자금 -->
            <div class="calc-total">
              <span class="calc-total-label">실제 굴릴 총 투자금</span>
              <strong class="calc-total-value">{{ formatKRW(rec.investAmount) }}</strong>
            </div>
          </div>

          <button type="button" class="btn-to-risk" @click="scrollToRisk">
            다음: 위험도 선택하기 ↓
          </button>
        </section>

        <hr class="divider" />

        <!-- Step 3: 위험도 선택 & 맞춤 상품 특징 -->
        <section ref="riskSectionRef" class="block step-block">
          <div class="block-head-wrap">
            <span class="step-badge">Step 3</span>
            <h2 class="block-title">위험도 선택하기</h2>
          </div>
          <p class="block-desc">
            감수할 수 있는 위험 수준을 골라주세요. 선택한 위험도 위주로 4개 만기 상품을 추천해 드립니다.
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

          <!-- 윤리적 상품 특징 정보 카드 -->
          <div v-if="rec.selectedRisk" class="risk-info-board" :class="'tone-' + rec.selectedRisk.tone">
            <div class="board-header">
              <span class="board-grade">{{ rec.selectedRisk.grade }}등급</span>
              <strong class="board-title">{{ rec.selectedRisk.label }} 추천 안내</strong>
            </div>
            <p class="board-desc">{{ rec.selectedRisk.helperBody }}</p>
            <div class="board-features">
              <span class="feat-tag">포함되는 주요 상품 성격:</span>
              <strong v-if="rec.riskLevel === 'VERY_LOW'" class="feat-name">시중/저축은행 정기예금·적금 (원금 100% 보존)</strong>
              <strong v-else-if="rec.riskLevel === 'LOW'" class="feat-name">단기채·국공채 ETF / 펀드 (원금손실 최소화)</strong>
              <strong v-else class="feat-name">회사채·만기매칭형 ETF / 펀드 (수익과 위험의 균형)</strong>
            </div>
          </div>
        </section>

        <!-- 4개 만기 기간 안내 팁 박스 -->
        <div class="period-notice-tip">
          <p class="tip-text">
            추천 상품은 <strong>1~11개월 / 12~23개월 / 24~35개월 / 36개월 이상</strong> 4개 만기 구간으로 나누어 제공되며, 결과 페이지에서 <strong>각 구간별로 상품을 1개씩(총 4개) 모두 선택</strong>해 주셔야 합니다.
          </p>
        </div>

      </div>

      <div class="submit-row">
        <button class="primary-btn" @click="submit">4단계 만기 추천 상품 보기 →</button>
      </div>
    </div>

    <footer class="rec-footer">
      <div class="footer-inner">
        <div class="footer-col">
          <h4>투자 및 예금 관련 안내</h4>
          <ul>
            <li>본 서비스에서 제공하는 정보는 참고용 시뮬레이션이며, 특정 금융상품의 가입을 강제 권유하지 않습니다.</li>
            <li>금융상품 가입 전 상품설명서 및 약관을 반드시 확인하시기 바랍니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>원금손실 가능성 / 예금자보호 안내</h4>
          <ul>
            <li>예금자보호 대상이 아닌 금융상품(채권 ETF 등)은 원금 손실이 발생할 수 있습니다.</li>
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
.rec-sub { color: var(--text-muted); font-size: 14px; margin: 0; max-width: 600px; }

/* 단계별 인포그래픽 배지 및 헤더 */
.step-block { margin-bottom: 24px; }
.block-head-wrap { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.step-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  background: var(--text-dark);
  color: #ffffff;
  font-size: 12px;
  font-weight: 800;
  border-radius: 6px;
}
.block-title { font-weight: 800; font-size: 20px; margin: 0; }
.block-desc { color: var(--text-muted); font-size: 14px; margin: 0 0 16px; }

/* 계산기 행 스타일 */
.calc-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.amount-input-row { display: flex; align-items: center; gap: 10px; }
.amount-input { width: 160px; font-size: 20px; padding: 10px 12px; text-align: right; border: 1.5px solid var(--card-border); border-radius: 10px; font-weight: 800; color: var(--text-dark); }
.amount-unit { font-size: 15px; font-weight: 600; color: var(--text-muted); }
.calc-amount { font-size: 19px; font-weight: 800; color: var(--text-dark); white-space: nowrap; }

.quick-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.quick-chip { padding: 8px 16px; border-radius: 10px; border: 1.4px solid var(--card-border); background: #fff; font-weight: 700; font-size: 13.5px; color: var(--text-muted); cursor: pointer; }
.quick-chip.reset { color: #999; }

/* 전폭(Full Width) 대형 금액 입력 박스 */
.full-input-card {
  padding: 20px 24px;
  background: #ffffff;
  border: 1.5px solid var(--card-border);
  border-radius: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.03);
}
.full-input-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #faf8f5;
  border: 1.5px solid #d4cecb;
  border-radius: 12px;
  padding: 10px 18px;
}
.full-amount-input {
  flex: 1;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-dark);
  border: none;
  background: transparent;
  outline: none;
}
.full-amount-unit {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-dark);
  white-space: nowrap;
}

.full-quick-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
}
.chips-left {
  display: flex;
  gap: 10px;
}
.quick-chip {
  min-height: 44px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1.4px solid var(--card-border);
  background: #fff;
  font-weight: 700;
  font-size: 14.5px;
  color: var(--text-dark);
  cursor: pointer;
}
.quick-chip.reset-btn {
  background: #ece8e1;
  border-color: #dcd6cb;
  color: #555;
  font-weight: 700;
}
.quick-chip.reset-btn:hover {
  background: #e0dad0;
  color: #111;
}

/* 주식 평가손익 스타일 버팀 수명 요약 카드 */
.runway-stock-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 24px;
  background: #faf8f5;
  border: 1.5px solid #eae5db;
  border-radius: 16px;
}
.stock-main-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stock-label {
  font-size: 14.5px;
  color: #666;
  font-weight: 600;
}
.stock-months-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.stock-months {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-dark);
}
.stock-diff-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #eef8f1;
  color: #1e6434;
  border: 1px solid #c3e6cb;
  font-size: 14.5px;
  font-weight: 800;
  border-radius: 8px;
}
.stock-sub-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px dashed #e4dfd4;
}
.stock-sub-text {
  font-size: 14.5px;
  color: #666;
  font-weight: 600;
}

/* 자금 조정 안내 박스 & 분기 버튼 */
.adjust-decision-box {
  margin: 28px 0;
  padding: 22px 24px;
  background: #f5f3ee;
  border-radius: 16px;
  text-align: center;
}
.adjust-question { font-size: 15.5px; font-weight: 800; color: #2c2a26; margin: 0 0 16px; }
.adjust-buttons { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.btn-decision {
  padding: 13px 22px;
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  border: none;
}
.btn-decision.primary { background: var(--kb-yellow); color: #3d3519; box-shadow: 0 4px 10px rgba(0,0,0,0.08); }
.btn-decision.primary:hover { background: #ffbe00; transform: translateY(-1px); }
.btn-decision.secondary { background: #ffffff; color: #555; border: 1.5px solid #d4cecb; }
.btn-decision.secondary:hover { background: #fafafa; color: #222; }

/* 3단 자금 조정 계산기 */
.adjust-section {
  padding: 20px;
  background: #fff;
  border: 1.5px solid #e5e1d8;
  border-radius: 16px;
  margin-bottom: 28px;
  animation: fadeIn 0.3s ease-in;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

.subtraction-calc-box { display: flex; flex-direction: column; gap: 12px; background: #faf8f5; padding: 20px; border-radius: 14px; margin-top: 12px; }
.calc-row.base .calc-amount { font-size: 20px; color: var(--kb-yellow-deep); }
.calc-row.plus-row .calc-label { color: #2d7a44; font-weight: 700; }
.calc-row.minus-row .calc-label { color: #c0442e; font-weight: 700; }
.btn-to-risk { width: 100%; margin-top: 16px; padding: 12px; border-radius: 10px; background: #ece8df; border: none; font-weight: 700; font-size: 14px; color: #4a453c; cursor: pointer; }

.calc-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; padding-top: 14px; border-top: 2px solid var(--text-dark); }
.calc-total-label { font-size: 15px; font-weight: 700; }
.calc-total-value { font-size: 24px; font-weight: 800; color: var(--kb-yellow-deep); }

.divider { border: none; border-top: 1px solid #cdd2d8; margin: 24px 0; }

/* 위험도 선택 칩 & 안내 보드 */
.risk-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
.risk-card { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; padding: 14px; border: 1.5px solid var(--card-border); border-radius: 14px; background: #fff; cursor: pointer; text-align: left; transition: border-color .15s, background .15s; }
.risk-card .risk-grade { font-size: 11.5px; font-weight: 700; color: var(--text-muted); }
.risk-card .risk-label { font-size: 15.5px; font-weight: 800; }
.risk-card .risk-sub { font-size: 12px; color: var(--text-muted); }
.risk-card.on.tone-safe { border-color: #2d7a44; background: #eef8f1; }
.risk-card.on.tone-caution { border-color: #b5760a; background: #fff6e6; }
.risk-card.on.tone-warn { border-color: #c0442e; background: #fdeeeb; }

.risk-info-board { margin-top: 16px; border-radius: 14px; padding: 18px 20px; border-left: 5px solid; }
.risk-info-board.tone-safe { background: #eef8f1; border-color: #2d7a44; color: #1e4d2b; }
.risk-info-board.tone-caution { background: #fff6e6; border-color: #b5760a; color: #694406; }
.risk-info-board.tone-warn { background: #fdeeeb; border-color: #c0442e; color: #722718; }
.board-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.board-grade { font-size: 12px; font-weight: 800; padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,0.06); }
.board-title { font-size: 15px; font-weight: 800; }
.board-desc { font-size: 13.5px; margin: 0 0 10px; line-height: 1.5; }
.board-features { display: flex; align-items: center; gap: 8px; font-size: 13.5px; border-top: 1px solid rgba(0,0,0,0.08); padding-top: 10px; flex-wrap: wrap; }
.feat-tag { font-weight: 700; opacity: 0.8; }
.feat-name { font-weight: 800; }

.period-notice-tip {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 28px;
  padding: 16px 20px;
  background: #fffcf0;
  border: 1.5px solid #ffe899;
  border-radius: 12px;
}
.period-notice-tip .tip-icon { font-size: 18px; flex-shrink: 0; }
.period-notice-tip .tip-text { margin: 0; font-size: 13.5px; color: #4b4435; line-height: 1.55; }

.submit-row { display: flex; justify-content: flex-end; margin-top: 26px; }
.submit-row .primary-btn { width: auto; min-width: 260px; margin: 0; padding: 16px 36px; font-size: 16px; font-weight: 800; }

.rec-footer { background: #46413a; color: #cdc7bc; margin-top: 40px; }
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
