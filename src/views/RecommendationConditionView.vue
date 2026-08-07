<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  useRecommendationStore,
  RISK_OPTIONS,
  formatKRW,
} from '@/stores/recommendation'

const router = useRouter()
const rec = useRecommendationStore()

const welcomeHeroRef = ref(null)
const isDockedHeaderVisible = ref(false)
const didUserTouchStep2 = ref(false)

// 입력은 만원 단위, 저장은 원 단위(×10000)
const monthlyManwon = computed({
  get: () => Math.round((rec.monthlyNeed || 0) / 10000),
  set: (v) => rec.setMonthlyNeed((Number(v) || 0) * 10000),
})

const additionalManwon = computed({
  get: () => Math.round((rec.additionalDeposit || 0) / 10000),
  set: (v) => rec.setAdditionalDeposit((Number(v) || 0) * 10000),
})

const immediateManwon = computed({
  get: () => Math.round((rec.immediateExpense || 0) / 10000),
  set: (v) => rec.setImmediateExpense((Number(v) || 0) * 10000),
})

function addMonthly(manwon) {
  rec.setMonthlyNeed((rec.monthlyNeed || 0) + manwon * 10000)
}

function addAdditional(manwon) {
  rec.setAdditionalDeposit((rec.additionalDeposit || 0) + manwon * 10000)
}

function addImmediate(manwon) {
  rec.setImmediateExpense((rec.immediateExpense || 0) + manwon * 10000)
}

const step3BackText = computed(() => {
  return didUserTouchStep2.value ? '자금 조정 다시하기 ↑' : '생활비 설정으로 돌아가기 ↑'
})

function scrollToStep(stepNum, fromStep2) {
  if (stepNum === 2) didUserTouchStep2.value = true
  if (fromStep2 !== undefined && fromStep2) didUserTouchStep2.value = true

  const targetCard = document.getElementById(`stepCard${stepNum}`)
  if (!targetCard) return

  const stickyHeaderHeight = 90
  const targetY = targetCard.getBoundingClientRect().top + window.scrollY - stickyHeaderHeight

  window.scrollTo({ top: targetY, behavior: 'smooth' })
}

function handleStep3Back() {
  if (didUserTouchStep2.value) {
    scrollToStep(2)
  } else {
    scrollToStep(1)
  }
}

function submit() {
  router.push('/recommendation/result')
}

let observer = null

onMounted(() => {
  if (welcomeHeroRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isDockedHeaderVisible.value = !entry.isIntersecting
        })
      },
      { threshold: 0.1 }
    )
    observer.observe(welcomeHeroRef.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<template>
  <div class="rec-page">
    <!-- 1. 첫 진입 전면 웰컴 히어로 캔버스 (지표는 항상 ? 개월 고정) -->
    <div ref="welcomeHeroRef" class="hero-welcome-canvas">
      <div class="welcome-container">
        <span class="welcome-tag">✨ 시니어 매각 자금 맞춤 연계 서비스</span>
        <h1 class="welcome-title">내게 맞는 4단계 금융상품 찾기</h1>
        <p class="welcome-sub">
          선택하신 매물 거래 후 남은 여유자금을 <b>1~11개월 · 12~23개월 · 24~35개월 · 36개월 이상</b> 4개 만기 기간에 배치해 드립니다.
        </p>
        <p class="welcome-note">
          선택하신 위험도 위주로 추천하고 만기가 있는 상품만 보여드립니다.
        </p>

        <!-- 첫 장 전면 웰컴 히어로의 지표는 항상 ? 개월 고정 -->
        <div class="welcome-stats-bar">
          <div class="w-stat">
            <span class="w-stat-label">4단계 예치 시 생활비 충당 기간</span>
            <strong class="w-stat-val question">? 개월</strong>
            <span class="w-stat-subtext">(?년 ?개월)</span>
          </div>
          <div class="w-divider"></div>
          <div class="w-stat">
            <span class="w-stat-label">현금 단순 보유 충당 기간</span>
            <strong class="w-stat-val">? 개월</strong>
            <span class="w-stat-subtext">(?년 ?개월)</span>
          </div>
          <div class="w-divider"></div>
          <div class="w-stat">
            <span class="w-stat-label">실제 굴릴 투자금</span>
            <strong class="w-stat-val">{{ formatKRW(rec.fundingAmount) }}</strong>
            <span class="w-stat-subtext">(관심 매물 차액 연동)</span>
          </div>
        </div>

        <!-- 쉬운 연산 원리 설명 카드 (3단계 카피라이팅) -->
        <div class="easy-calc-explain-box">
          <div class="explain-title">💡 4단계 예치 수명 연산 원리 안내</div>
          <ul class="explain-steps">
            <li class="explain-step-item">
              <span class="explain-step-num">STEP 1</span>
              <p class="explain-step-text">집을 옮기고 남은 여유 자금에서 <b>매달 쓰실 생활비</b>를 나눕니다.</p>
            </li>
            <li class="explain-step-item">
              <span class="explain-step-num">STEP 2</span>
              <p class="explain-step-text">1년 미만·1~2년·2~3년·3년 이상 <b>4개 만기 금융상품</b>에 나누어 담아 수익을 더합니다.</p>
            </li>
            <li class="explain-step-item">
              <span class="explain-step-num">STEP 3</span>
              <p class="explain-step-text">만기 시점이 릴레이처럼 이어져 <b>생활비가 비지 않도록 안전하게 몇 개월 더 꺼내 쓰실 수 있는지</b> 계산합니다.</p>
            </li>
          </ul>
        </div>

        <!-- 히어로 진입 버튼 -->
        <button type="button" class="hero-enter-btn" @click="scrollToStep(1)">
          정보 입력 후 사용 가능 개월 수 확인하기 ↓
        </button>
      </div>
    </div>

    <!-- 2. 스크롤 시 상단에 고정되는 스티키 도킹 헤더 -->
    <div class="sticky-docked-bar" :class="{ 'is-visible': isDockedHeaderVisible }">
      <header class="r-head-docked">
        <div class="r-head-left">
          <h1 class="r-title-docked">내게 맞는 4단계 금융상품 찾기</h1>
          <p class="r-sub-docked">선택하신 여유자금을 4개 만기 기간에 나누어 배치해 드립니다.</p>
        </div>

        <div class="r-stats">
          <div class="stat">
            <span class="stat-label">4단계 예치 시 충당 기간</span>
            <strong class="stat-value invest">
              {{ rec.runwayAnalysis.appMonths }}개월
              <span class="stat-years-tag">({{ rec.runwayAnalysis.appYearsText }})</span>
              <span class="stat-value-sub">+{{ rec.runwayAnalysis.diffMonths }}개월 연장</span>
            </strong>
          </div>
          <div class="stat">
            <span class="stat-label">현금 보유 충당 기간</span>
            <strong class="stat-value">
              {{ rec.runwayAnalysis.cashMonths }}개월
              <span class="stat-years-tag">({{ rec.runwayAnalysis.cashYearsText }})</span>
            </strong>
          </div>
          <div class="stat">
            <span class="stat-label">실제 굴릴 투자금</span>
            <strong class="stat-value">{{ formatKRW(rec.investAmount) }}</strong>
          </div>
        </div>
      </header>
    </div>

    <!-- 3. 메인 1자 수직 쉘 -->
    <div class="rec-shell">
      <!-- STEP 1 카드: 생활비 설정 -->
      <div class="step-card" id="stepCard1">
        <span class="step-badge-chip">STEP 1</span>
        <h2 class="step-question-title">매달 꺼내 쓸 생활비 정하기</h2>
        <p class="step-question-desc">국민연금 등 고정 수입 외에, 이 목돈에서 매달 얼마씩 꺼내 쓰실 예정인가요?</p>

        <div class="base-funding-chip">
          <span class="base-funding-label">선택 매물 남은 여유 자금 (실연동)</span>
          <strong class="base-funding-val">{{ formatKRW(rec.fundingAmount) }}</strong>
        </div>

        <div class="toss-input-wrap">
          <span class="toss-prefix">매달</span>
          <input
            type="number"
            class="toss-amount-input"
            v-model.number="monthlyManwon"
            min="0"
            step="10"
            placeholder="0"
          />
          <span class="toss-amount-unit">만원 씩 꺼내 쓰기</span>
        </div>

        <div class="quick-chips">
          <button type="button" class="chip" @click="addMonthly(10)">+10만원</button>
          <button type="button" class="chip" @click="addMonthly(50)">+50만원</button>
          <button type="button" class="chip" @click="addMonthly(100)">+100만원</button>
        </div>

        <div class="adjust-question-wrap">
          <div class="adjust-question-text">당장 빠질 긴급 자금이나, 추가로 더 넣을 돈이 있으신가요?</div>
        </div>

        <div class="btn-row-step1">
          <button type="button" class="secondary-btn" @click="scrollToStep(2, true)">
            예, 자금 조정하기 (+/-) ↓
          </button>
          <button type="button" class="primary-btn" @click="scrollToStep(3, false)">
            아니오, 그대로 위험도 선택 ↓
          </button>
        </div>
      </div>

      <!-- STEP 2 카드: 자금 조정 -->
      <div class="step-card" id="stepCard2">
        <span class="step-badge-chip">STEP 2</span>
        <h2 class="step-question-title">자금 조정하기</h2>
        <p class="step-question-desc">선택 매물 남은 돈에서 더할 돈이나, 미리 뺄 지출이 있다면 입력해 주세요.</p>

        <div class="adjust-field-group">
          <label class="adjust-field-label plus-label">+ 추가로 합칠 돈 (퇴직금·적금 만기 등)</label>
          <div class="toss-input-wrap">
            <input
              type="number"
              class="toss-amount-input"
              v-model.number="additionalManwon"
              min="0"
              step="100"
              placeholder="0"
            />
            <span class="toss-amount-unit">만원</span>
          </div>
          <div class="quick-chips">
            <button type="button" class="chip" @click="addAdditional(100)">+100만원</button>
            <button type="button" class="chip" @click="addAdditional(500)">+500만원</button>
            <button type="button" class="chip" @click="addAdditional(1000)">+1000만원</button>
          </div>
        </div>

        <div class="adjust-field-group">
          <label class="adjust-field-label minus-label">− 당장 쓸 긴급 돈 (병원비·이사비 등)</label>
          <div class="toss-input-wrap">
            <input
              type="number"
              class="toss-amount-input"
              v-model.number="immediateManwon"
              min="0"
              step="100"
              placeholder="0"
            />
            <span class="toss-amount-unit">만원</span>
          </div>
          <div class="quick-chips">
            <button type="button" class="chip" @click="addImmediate(100)">+100만원</button>
            <button type="button" class="chip" @click="addImmediate(500)">+500만원</button>
            <button type="button" class="chip" @click="addImmediate(1000)">+1000만원</button>
          </div>
        </div>

        <div class="btn-row">
          <button type="button" class="secondary-btn" @click="scrollToStep(1, false)">
            월 사용 금액 다시하기 ↑
          </button>
          <button type="button" class="primary-btn" @click="scrollToStep(3, true)">
            위험도 선택 넘어가기 ↓
          </button>
        </div>
      </div>

      <!-- STEP 3 카드: 위험도 선택 -->
      <div class="step-card" id="stepCard3">
        <span class="step-badge-chip">STEP 3</span>
        <h2 class="step-question-title">위험도 선택하기</h2>
        <p class="step-question-desc">선택하신 위험도 위주로 4개 만기 기간에 배치해 드립니다.</p>

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

        <div v-if="rec.selectedRisk" class="risk-info-board" :class="'tone-' + rec.selectedRisk.tone">
          <div class="board-header">
            <strong class="board-title">{{ rec.selectedRisk.grade }}등급 {{ rec.selectedRisk.label }} 추천 안내</strong>
          </div>
          <p class="board-desc">{{ rec.selectedRisk.helperBody }}</p>
        </div>

        <div class="btn-row">
          <button type="button" class="secondary-btn" @click="handleStep3Back">
            {{ step3BackText }}
          </button>
          <button type="button" class="primary-btn submit-btn" @click="submit">
            4단계 만기 추천 상품 보기 →
          </button>
        </div>
      </div>
    </div>

    <!-- 푸터 -->
    <footer class="rec-footer">
      <div class="footer-inner">
        <div class="footer-col">
          <h4>투자 및 예금 관련 안내</h4>
          <ul>
            <li>본 서비스에서 제공하는 정보는 참고용 시뮬레이션입니다.</li>
            <li>금융상품 가입 전 반드시 상품설명서를 확인하시기 바랍니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>원금손실 가능성 안내</h4>
          <ul>
            <li>예금자보호 대상이 아닌 금융상품은 원금 손실이 발생할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.rec-page {
  font-family: "Pretendard", -apple-system, sans-serif;
  background: var(--bg-page, #f9f8f5);
  color: var(--text-dark, #2f2d29);
  line-height: 1.55;
}

/* 1. 전면 웰컴 히어로 캔버스 */
.hero-welcome-canvas {
  background: #fff;
  border-bottom: 1.5px solid #e9e6df;
  padding: 40px 0 32px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.03);
}
.welcome-container {
  max-width: 920px;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
}
.welcome-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #fffcf0;
  color: #8a6a20;
  border: 1.2px solid #ffe899;
  font-size: 13px;
  font-weight: 800;
  padding: 5px 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.welcome-title {
  font-size: 28px;
  font-weight: 900;
  color: #2f2d29;
  margin: 0 0 10px;
  letter-spacing: -0.5px;
}
.welcome-sub {
  font-size: 14.5px;
  color: #777267;
  margin: 0 0 8px;
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}
.welcome-sub b {
  color: #2f2d29;
  font-weight: 800;
}
.welcome-note {
  font-size: 12.5px;
  color: #888;
  margin: 0 0 24px;
}

.welcome-stats-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  background: #faf8f5;
  border: 1.5px solid #eae5db;
  border-radius: 18px;
  padding: 18px 32px;
  margin: 0 auto 24px;
  max-width: 820px;
}
.w-stat { text-align: center; }
.w-stat-label { font-size: 12.5px; color: #777267; font-weight: 700; display: block; margin-bottom: 4px; }
.w-stat-val { font-size: 24px; font-weight: 900; color: #2f2d29; }
.w-stat-val.question { color: #d4a000; }
.w-stat-subtext { font-size: 12px; color: #777; font-weight: 700; display: block; margin-top: 2px; }
.w-divider { width: 1px; height: 36px; background: #e0dad0; }

.easy-calc-explain-box {
  background: #fffcf0;
  border: 1.5px solid #ffe899;
  border-radius: 16px;
  padding: 18px 24px;
  max-width: 820px;
  margin: 0 auto 28px;
  text-align: left;
}
.explain-title { font-size: 14.5px; font-weight: 800; color: #8a6a20; margin: 0 0 10px; display: flex; align-items: center; gap: 6px; }
.explain-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 0; padding: 0; list-style: none; }
.explain-step-item { background: #ffffff; padding: 12px 14px; border-radius: 10px; border: 1px solid #f0e6c8; }
.explain-step-num { font-size: 11.5px; font-weight: 800; color: #d4a000; display: block; margin-bottom: 2px; }
.explain-step-text { font-size: 12.5px; color: #444; margin: 0; line-height: 1.45; font-weight: 600; }
.explain-step-text b { color: #2f2d29; font-weight: 800; }

.hero-enter-btn {
  padding: 16px 44px;
  border-radius: 14px;
  background: #fabb08;
  color: #342e22;
  font-size: 16.5px;
  font-weight: 900;
  border: none;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(250,187,8,0.3);
  transition: all 0.15s;
}
.hero-enter-btn:hover { background: #f0b000; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(250,187,8,0.4); }

/* 2. 스티키 도킹 헤더 */
.sticky-docked-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.97);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e9e6df;
  box-shadow: 0 4px 14px rgba(0,0,0,0.06);
  padding: 12px 0;
  opacity: 0;
  transform: translateY(-100%);
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.sticky-docked-bar.is-visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.r-head-docked {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.r-head-left { flex: 1; }
.r-title-docked { font-weight: 800; font-size: 19px; margin: 0 0 2px; color: #2f2d29; }
.r-sub-docked { font-size: 12px; color: #777267; margin: 0; }

.r-stats {
  display: flex;
  gap: 24px;
  border-left: 3.5px solid #fabb08;
  padding: 2px 0 2px 20px;
  white-space: nowrap;
  flex-shrink: 0;
}
.stat-label { display: block; font-size: 11.5px; color: #777267; margin-bottom: 2px; font-weight: 600; }
.stat-value { font-size: 19px; font-weight: 900; color: #2f2d29; }
.stat-value.invest { color: #d4a000; }
.stat-value-sub { font-size: 11.5px; font-weight: 800; color: #1e6434; background: #eef8f1; padding: 2px 6px; border-radius: 4px; margin-left: 4px; vertical-align: middle; }
.stat-years-tag { font-size: 12px; font-weight: 700; color: #555; margin-left: 3px; }

/* 3. 1자 수직 쉘 */
.rec-shell {
  max-width: 820px;
  margin: 32px auto 64px;
  padding: 0 20px;
}

.step-card {
  background: #fff;
  border: 1.5px solid #e2ded6;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 18px rgba(0,0,0,0.03);
  scroll-margin-top: 90px;
}

.step-badge-chip {
  background: #2f2d29; color: #fff; font-size: 12px; font-weight: 800; padding: 3px 9px; border-radius: 6px; display: inline-block; margin-bottom: 10px;
}
.step-question-title { font-size: 20px; font-weight: 800; margin: 0 0 6px; }
.step-question-desc { font-size: 13.5px; color: #777267; margin: 0 0 20px; }

.base-funding-chip {
  display: flex; justify-content: space-between; align-items: center;
  background: #faf8f5; border: 1.5px solid #eae5db; padding: 14px 18px; border-radius: 12px; margin-bottom: 18px;
}
.base-funding-label { font-weight: 700; font-size: 14px; color: #444; }
.base-funding-val { font-size: 18px; font-weight: 800; }

.adjust-field-group { margin-bottom: 16px; }
.adjust-field-label { font-size: 14.5px; font-weight: 800; display: block; margin-bottom: 6px; }
.adjust-field-label.plus-label { color: #2d7a44; }
.adjust-field-label.minus-label { color: #c0442e; }

.toss-prefix { font-weight: 700; font-size: 16.5px; color: #333; }
.toss-input-wrap {
  display: flex; align-items: center; justify-content: space-between;
  border: 1.5px solid #c9c3bc; border-radius: 14px; padding: 12px 18px; background: #fff;
}
.toss-input-wrap:focus-within { border-color: #d4a000; box-shadow: 0 0 0 3px rgba(250, 187, 8, 0.25); }
.toss-amount-input { flex: 1; font-size: 24px; font-weight: 800; color: #2f2d29; border: none; outline: none; text-align: right; }
.toss-amount-unit { font-size: 15px; font-weight: 700; color: #555; margin-left: 8px; }

.quick-chips { display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; }
.chip { padding: 7px 14px; border-radius: 8px; border: 1.4px solid #e2ded6; background: #fff; font-weight: 700; font-size: 13px; color: #777267; cursor: pointer; }
.chip:hover { background: #f5f3ee; color: #333; }

.adjust-question-wrap { margin-top: 24px; }
.adjust-question-text { font-size: 15px; font-weight: 800; color: #2c2a26; margin-bottom: 6px; }

.btn-row-step1 {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid #eee;
}

.btn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
.primary-btn {
  padding: 15px 32px;
  border-radius: 12px;
  background: #fabb08;
  color: #342e22;
  font-size: 15.5px;
  font-weight: 800;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  transition: background 0.15s, transform 0.15s;
}
.primary-btn:hover { background: #f0b000; transform: translateY(-1px); }

.secondary-btn {
  padding: 15px 24px;
  border-radius: 12px;
  background: #ffffff;
  border: 1.5px solid #d9d4cc;
  color: #555;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.secondary-btn:hover { background: #f7f5f0; }

.risk-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 12px; }
.risk-card { padding: 16px; border: 1.5px solid #e2ded6; border-radius: 16px; background: #fff; cursor: pointer; text-align: left; transition: all 0.15s; }
.risk-grade { font-size: 11.5px; font-weight: 700; color: #777267; display: block; }
.risk-label { font-size: 15.5px; font-weight: 800; margin-top: 2px; display: block; }
.risk-sub { font-size: 12px; color: #777267; display: block; margin-top: 2px; }
.risk-card.on.tone-safe { border-color: #2d7a44; background: #eef8f1; }
.risk-card.on.tone-caution { border-color: #b5760a; background: #fff6e6; }
.risk-card.on.tone-warn { border-color: #c0442e; background: #fdeeeb; }

.risk-info-board { margin-top: 16px; border-radius: 14px; padding: 16px 18px; border-left: 5px solid; }
.risk-info-board.tone-safe { background: #eef8f1; border-color: #2d7a44; color: #1e4d2b; }
.risk-info-board.tone-caution { background: #fff6e6; border-color: #b5760a; color: #694406; }
.risk-info-board.tone-warn { background: #fdeeeb; border-color: #c0442e; color: #722718; }
.board-header { font-size: 14.5px; font-weight: 800; margin-bottom: 4px; }
.board-desc { font-size: 13px; margin: 0; line-height: 1.5; }

.submit-btn { padding: 15px 36px; }

.rec-footer { background: #46413a; color: #cdc7bc; margin-top: 48px; }
.footer-inner { max-width: 1140px; margin: 0 auto; padding: 30px 32px 36px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.footer-col h4 { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
.footer-col ul { margin: 0; padding-left: 16px; font-size: 12.5px; line-height: 1.7; color: #b7b1a6; }

@media (max-width: 600px) {
  .welcome-stats-bar { flex-direction: column; gap: 16px; }
  .w-divider { width: 100%; height: 1px; }
  .explain-steps { grid-template-columns: 1fr; }
  .risk-cards { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 20px; }
}
</style>
