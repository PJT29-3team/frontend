<template>
  <div class="summary-shell">
    <!-- 완료 아이콘 -->
    <div class="done-icon">✓</div>
    <h1 class="done-title">모든 준비가 끝났어요</h1>
    <p class="done-sub">
      설문부터 자금 계획까지, {{ data.userName }}님의 다운사이징 여정을 정리했어요
    </p>
    <p class="done-hint">
      아래 내용이 맞는지 한번 확인해보세요.
      바꿀 게 있으면 '완료한 단계' 및 '해당 단계로 돌아가기'로 다시 설정할 수 있어요.
    </p>

    <!-- ━━━ 카드1: 매물 정리 결과 ━━━ -->
    <section class="result-card">
      <h2 class="card-heading">매물 정리 결과</h2>

      <div class="row-between">
        <span class="row-label">새 집</span>
        <div class="row-value-group">
          <strong>{{ pr.newHome.name }} · {{ pr.newHome.pyeong }}평</strong>
          <span class="row-sub">적합도 {{ pr.newHome.fitScore }}점</span>
        </div>
      </div>

      <div class="net-fund-box">
        <span>순 여유자금</span>
        <strong class="highlight-value">{{ formatKRW(pr.netFund) }}</strong>
      </div>

      <button class="detail-toggle" @click="showPropertyDetail = !showPropertyDetail">
        {{ showPropertyDetail ? '상세 내역 접기 ▲' : '상세 내역 보기 ▼' }}
      </button>

      <div v-if="showPropertyDetail" class="detail-section">
        <div class="row-between">
          <span class="row-label">현재 집 매도 예상가</span>
          <div class="row-value-group">
            <strong>{{ formatKRW(pr.currentHome.estimatedSalePrice) }}</strong>
            <span class="row-sub">{{ pr.currentHome.name }} · {{ pr.currentHome.pyeong }}평</span>
          </div>
        </div>
        <div class="row-between">
          <span class="row-label">새 집 매수가</span>
          <strong class="negative">-{{ formatKRW(pr.newHome.purchasePrice) }}</strong>
        </div>
        <div v-for="cost in pr.costs" :key="cost.label" class="row-between cost-row">
          <span class="row-label">{{ cost.label }}</span>
          <strong class="negative">-{{ formatKRW(cost.amount) }}</strong>
        </div>
      </div>
    </section>

    <!-- ━━━ 카드2: 자금 운용 계획 ━━━ -->
    <section class="result-card">
      <h2 class="card-heading">자금 운용 계획</h2>

      <div class="net-fund-box">
        <span>투자 가능 금액</span>
        <strong>{{ formatKRW(fp.investable) }}</strong>
      </div>

      <button class="detail-toggle" @click="showExpenseDetail = !showExpenseDetail">
        {{ showExpenseDetail ? '즉시 지출 내역 접기 ▲' : '즉시 지출 내역 보기 ▼' }}
      </button>

      <div v-if="showExpenseDetail" class="detail-section">
        <div class="row-between">
          <span class="row-label">순 여유자금</span>
          <strong>{{ formatKRW(fp.netFund) }}</strong>
        </div>
        <div v-for="exp in fp.immediateExpenses" :key="exp.label" class="row-between cost-row">
          <span class="row-label">{{ exp.label }}</span>
          <strong class="negative">-{{ formatKRW(exp.amount) }}</strong>
        </div>
      </div>

      <hr class="divider" />

      <!-- 만기 사다리 타임라인 -->
      <div class="plan-meta">
        <div class="plan-meta-item">
          <span class="sub-label">매달 더 필요한 돈</span>
          <strong>{{ formatKRW(fp.monthlyNeed) }}</strong>
        </div>
      </div>

      <div class="timeline">
        <div v-for="(item, i) in fp.items" :key="i" class="tl-node">
          <div class="tl-rail">
            <div class="tl-dot" :class="dotColor(i)" />
            <div v-if="i < fp.items.length - 1" class="tl-line" />
          </div>
          <div class="tl-card">
            <div class="tl-card-head">
              <span class="product-tag">{{ item.tag }}</span>
              <span class="tl-period">{{ periodLabel(item, i) }}</span>
            </div>
            <strong class="product-name">{{ item.name }}</strong>
            <span class="product-desc">{{ item.description }}</span>
            <div class="tl-card-foot">
              <span>{{ formatKRW(item.invest) }}</span>
              <span class="product-percent">{{ item.percent }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 최종 결론 -->
      <div class="conclusion-box">
        <span class="conclusion-label">매달 {{ formatKRW(fp.monthlyNeed) }}씩</span>
        <strong class="conclusion-value">{{ fp.fundedMonths }}</strong>
        <span class="conclusion-tail">사용 가능</span>
      </div>
    </section>

    <!-- 면책 문구 -->
    <p class="disclaimer-text">
      <strong>확인해 주세요.</strong>
      금리와 과거 수익률은 기준일 이후 달라질 수 있습니다.
      예상 금액은 이해를 돕기 위한 계산값이며 실제 수행액을 보장하지 않습니다.
    </p>

    <!-- 완료한 단계 -->
    <section class="completed-steps">
      <h2 class="steps-heading">완료한 단계</h2>
      <p class="steps-sub">항목을 눌러서 그 단계로 돌아가 수정할 수 있어요</p>
      <div class="steps-grid">
        <button v-for="step in data.completedSteps" :key="step.key" class="step-chip">
          <span class="step-check">✓</span>
          {{ step.label }}
          <span class="step-arrow">›</span>
        </button>
      </div>
    </section>

    <!-- 하단 액션 -->
    <div class="action-cards">
      <button class="action-card">
        <span class="action-icon">🔊</span>
        <strong>보고서 요약 듣기</strong>
        <span class="action-sub">1분 음성 요약</span>
      </button>
      <button class="action-card">
        <span class="action-icon">👨‍👩‍👧</span>
        <strong>가족과 공유하기</strong>
        <span class="action-sub">문자·카카오톡으로 전송</span>
      </button>
    </div>

    <button class="pdf-btn" @click="downloadPdf">
      상세 보고서 PDF 다운로드
    </button>
    <p class="pdf-hint">저장된 보고서는 마이페이지에서 언제든 다시 볼 수 있어요</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// TODO: 목업 import — 실제 API 연동 후 삭제
import { dummySummary as data } from '@/mock/dummySummary'

const pr = data.propertyResult
const fp = data.financePlan
const showPropertyDetail = ref(false)
const showExpenseDetail = ref(false)

function formatKRW(value) {
  const eok = Math.floor(value / 1_0000_0000)
  const man = Math.round((value % 1_0000_0000) / 1_0000)
  if (eok && man) return `${eok}억 ${man.toLocaleString()}만원`
  if (eok) return `${eok}억원`
  return `${man.toLocaleString()}만원`
}

const DOT_COLORS = ['park', 'short', 'mid', 'long']
function dotColor(i) { return DOT_COLORS[i] || 'long' }

function periodLabel(item, i) {
  const items = fp.items
  const from = item.maturityMonths
  const next = items[i + 1]
  if (!next) return `${from}개월차~`
  return `${from}~${next.maturityMonths}개월차`
}

function downloadPdf() {
  // TODO: 실제 PDF 생성/다운로드 연동
  alert('PDF 다운로드 기능은 추후 연동 예정입니다.')
}
</script>

<style scoped>
.summary-shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 20px 60px;
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: #1f2937;
}

.done-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: #f5c518;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 800;
}

.done-title {
  text-align: center;
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 8px;
}

.done-sub {
  text-align: center;
  font-size: 15px;
  color: #6b7280;
  margin: 0 0 4px;
}

.done-hint {
  text-align: center;
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 32px;
}

/* ── 결과 카드 공통 ── */
.result-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.card-heading {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 20px;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
}

.row-label {
  font-size: 15px;
  color: #6b7280;
  flex-shrink: 0;
}

.row-value-group {
  text-align: right;
}

.row-value-group strong {
  display: block;
  font-size: 17px;
}

.row-sub {
  font-size: 12px;
  color: #9ca3af;
}

.sub-label {
  font-size: 12px;
  color: #9ca3af;
}

.negative {
  color: #ef4444;
}

.highlight-value {
  font-size: 20px;
  color: #f59e0b;
}

.divider {
  border: none;
  border-top: 1px solid #f3f4f6;
  margin: 12px 0;
}

.cost-row {
  padding: 4px 0;
}

.cost-row .row-label {
  font-size: 14px;
}

/* ── 순 여유자금 / 투자 가능 금액 박스 ── */
.net-fund-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 14px;
  font-weight: 700;
  font-size: 16px;
}

/* ── 상세 토글 ── */
.detail-toggle {
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 8px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.detail-toggle:hover {
  color: #1f2937;
}

.detail-section {
  margin-top: 8px;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 10px;
}

.detail-section .row-between {
  padding: 4px 0;
}

/* ── 자금 계획 메타 ── */
.plan-meta {
  display: flex;
  gap: 16px;
  padding: 10px 16px;
  background: #fafafa;
  border-radius: 10px;
  margin: 8px 0 16px;
}

.plan-meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.plan-meta-item strong {
  font-size: 15px;
}

/* ── 세로 타임라인 ── */
.timeline {
  margin-top: 4px;
}

.tl-node {
  display: flex;
  gap: 14px;
}

.tl-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18px;
  flex-shrink: 0;
  padding-top: 6px;
}

.tl-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #d1d5db;
}

.tl-dot.park { background: #0d9488; box-shadow: 0 0 0 2px #0d9488; }
.tl-dot.short { background: #2563eb; box-shadow: 0 0 0 2px #2563eb; }
.tl-dot.mid { background: #4f46e5; box-shadow: 0 0 0 2px #4f46e5; }
.tl-dot.long { background: #1e1b4b; box-shadow: 0 0 0 2px #1e1b4b; }

.tl-line {
  width: 2px;
  flex: 1;
  background: #e5e7eb;
  min-height: 20px;
}

.tl-card {
  flex: 1;
  padding: 10px 14px 14px;
  background: #fafafa;
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tl-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.tl-period {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.tl-card-foot {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-top: 6px;
  font-weight: 700;
  font-size: 15px;
}

.product-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #8c5a1b;
  background: #fbead0;
  border: 1px solid #ffcc00;
  border-radius: 10px;
  padding: 1px 8px;
  width: fit-content;
}

.product-name {
  font-size: 15px;
}

.product-desc {
  font-size: 12px;
  color: #9ca3af;
}

.product-percent {
  font-size: 13px;
  color: #f59e0b;
  font-weight: 700;
}

/* ── 최종 결론 ── */
.conclusion-box {
  background: #1f2937;
  color: #fff;
  border-radius: 14px;
  padding: 22px 24px;
  margin-top: 16px;
  text-align: center;
}

.conclusion-label {
  display: block;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.conclusion-value {
  display: block;
  font-size: 28px;
  font-weight: 800;
  color: #f5c518;
  margin: 6px 0 2px;
}

.conclusion-tail {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
}

/* ── 면책 ── */
.disclaimer-text {
  margin: 20px 0 32px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #9ca3af;
}

.disclaimer-text strong {
  color: #6b7280;
}

/* ── 완료 단계 ── */
.completed-steps {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 24px;
}

.steps-heading {
  font-size: 17px;
  font-weight: 800;
  margin: 0 0 4px;
}

.steps-sub {
  font-size: 13px;
  color: #9ca3af;
  margin: 0 0 16px;
}

.steps-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.step-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
}

.step-chip:hover {
  background: #fefce8;
}

.step-check {
  color: #f5c518;
  font-weight: 800;
}

.step-arrow {
  margin-left: auto;
  color: #d1d5db;
}

/* ── 하단 액션 ── */
.action-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 20px 12px;
  background: #f9f8f5;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  cursor: pointer;
}

.action-card:hover {
  background: #fefce8;
}

.action-icon {
  font-size: 24px;
}

.action-card strong {
  font-size: 14px;
}

.action-sub {
  font-size: 12px;
  color: #9ca3af;
}

.pdf-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 14px;
  background: #f5c518;
  color: #3a3326;
  font-size: 17px;
  font-weight: 800;
  box-shadow: 0 12px 22px -8px rgba(140, 90, 27, 0.55);
  cursor: pointer;
}

.pdf-hint {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 10px;
}

@media (max-width: 480px) {
  .steps-grid,
  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
