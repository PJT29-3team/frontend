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

    <!-- ━━━ 선택결과 한눈에 보기 (매물 정리 결과 + 자금 운용 계획) ━━━ -->
    <section class="summary-card">
      <h2 class="card-heading">선택결과 한눈에 보기</h2>

      <p v-if="loadError" class="load-error">{{ loadError }}</p>

      <h3 class="card-subheading">매물 정리 결과</h3>
      <div class="row-between">
        <span class="row-label">새 집</span>
        <div class="row-value-group">
          <strong v-if="pr.newHome.name">
            {{ pr.newHome.name }}<template v-if="pr.newHome.pyeong"> · {{ pr.newHome.pyeong }}평</template>
          </strong>
          <strong v-else class="row-empty">관심 매물에서 집을 고르면 표시됩니다</strong>
          <span v-if="pr.newHome.fitScore != null" class="row-sub">{{ pr.newHome.fitScore }}점</span>
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
            <span v-if="pr.currentHome.name" class="row-sub">
              {{ pr.currentHome.name }}<template v-if="pr.currentHome.pyeong"> · {{ pr.currentHome.pyeong }}평</template>
            </span>
          </div>
        </div>
        <div class="row-between">
          <span class="row-label">새 집 매수가</span>
          <strong class="negative">-{{ formatKRW(pr.newHome.purchasePrice) }}</strong>
        </div>
        <div v-for="cost in pr.costs" :key="cost.label" class="row-between cost-row">
          <span class="row-label">
            {{ cost.label }}
            <span v-if="cost.note" class="cost-note">{{ cost.note }}</span>
          </span>
          <strong v-if="cost.amount > 0" class="negative">-{{ formatKRW(cost.amount) }}</strong>
          <strong v-else class="cost-zero">0원</strong>
        </div>
      </div>
      <hr class="divider" />

      <h3 class="card-subheading">자금 운용 계획</h3>
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

      <!-- ── 포트폴리오 + 타임라인 ── -->
      <div class="pf-section">
        <!-- 헤더: 매달 인출 기준 -->
        <div class="pf-meta-row">
          <span class="pf-meta-label">포트폴리오 배분</span>
          <span class="pf-meta-monthly">매달 <b>{{ formatKRW(portfolioMonthlyNeed) }}</b> 인출 기준</span>
        </div>

        <!-- 배분 비율 바 -->
        <div class="pf-alloc-bar">
          <div
            v-for="(item, i) in portfolioItems"
            :key="i"
            class="pf-alloc-seg"
            :class="'seg-' + dotColor(item)"
            :style="{ flex: item.percent }"
            :title="item.name + ' ' + item.percent + '%'"
          ></div>
        </div>

        <!-- 상품 목록 -->
        <div class="pf-items">
          <div v-for="(item, i) in portfolioItems" :key="i" class="pf-item">
            <div class="pf-item-left">
              <span class="pf-color-dot" :class="'dot-' + dotColor(item)"></span>
              <div class="pf-item-info">
                <div class="pf-item-name">{{ item.name }}</div>
                <span class="pf-item-tag">{{ item.tag }}</span>
              </div>
            </div>
            <div class="pf-item-right">
              <div class="pf-item-bar-wrap">
                <div class="pf-item-bar" :class="'seg-' + dotColor(item)" :style="{ width: item.percent + '%' }"></div>
              </div>
              <div class="pf-item-nums">
                <span class="pf-item-amount">{{ formatKRW(item.invest) }}</span>
                <span class="pf-item-pct">{{ item.percent }}%</span>
              </div>
            </div>
          </div>
        </div>
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

    <button class="pdf-btn" :disabled="isPdfLoading" @click="downloadPdf">
      <span v-if="isPdfLoading">PDF 생성 중…</span>
      <span v-else>상세 보고서 PDF 다운로드</span>
    </button>
    <p class="pdf-hint">저장된 보고서는 마이페이지에서 언제든 다시 볼 수 있어요</p>
  </div>

  <!-- PDF 캡처 전용 숨김 컴포넌트 -->
  <PdfReport
    ref="pdfReportRef"
    :report="data"
    :ai-summary="aiSummary"
    :ai-loading="aiLoading"
  />
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import PdfReport from './PdfReport.vue'
import { preparePdfCapture } from '@/utils/pdfCapture'
import { fitCanvasToA4 } from '@/utils/pdfLayout'
import { generateActionPlan } from '@/utils/openaiSummary'
import { fetchFavoriteProducts } from '@/api/financeApi'
import { getFavoriteProperties } from '@/api/favoriteApi'
import { useRecommendationStore } from '@/stores/recommendation'
import { useSurveyStore } from '@/stores/survey'
import { authStore } from '@/stores/authStore'
import { periodOf } from '@/utils/finance/portfolioAllocation'
import { buildTimeline, dur } from '@/utils/finance/horizonTimeline'
import { purchaseSummary } from '@/utils/house/purchaseCost'
import '@/styles/survey-tokens.css'

const rec = useRecommendationStore()
const survey = useSurveyStore()
const RISK_LABELS = { VERY_LOW: '매우 낮은 위험', LOW: '낮은 위험', MEDIUM: '보통 위험', HIGH: '높은 위험' }

// 선택한 관심매물. 서버가 selected='Y'로 표시해 준다.
const selectedHome = ref(null)

// 매물 정리 결과 — 설문(현재 집 매도)과 선택 매물(새 집 매수)에서 만든다.
const propertyResult = computed(() => {
  const home = selectedHome.value
  const buy = purchaseSummary(home)
  // 양도소득세는 0원이어도 숨기지 않는다. 안 보이면 계산이 빠진 건지 비과세인지 알 수 없다.
  const tax = survey.taxResult ?? { amount: 0, exempt: false }
  let taxNote = ''
  if (tax.exempt) taxNote = '1세대 1주택 비과세'
  else if (tax.amount === 0 && (survey.expectedSalePrice ?? 0) > 0) taxNote = '양도차익 없음'

  const costs = [
    // 매도 쪽 — 서버가 net_proceeds_amount를 낼 때 이미 뺀 항목들이다.
    { label: '양도소득세', amount: tax.amount, note: taxNote },
    { label: '현재 집 중개수수료', amount: survey.brokerage?.amount ?? 0, note: '' },
    { label: '주택담보대출 상환', amount: survey.mortgageRepayment ?? 0, note: '' },
    // 매수 쪽
    { label: '새 집 취득세', amount: buy.purchaseCost.totalTax, note: '' },
    { label: '새 집 중개수수료', amount: buy.brokerage.brokerageFee + buy.brokerage.vat, note: '' },
  ].filter((c) => c.amount > 0 || c.note)

  return {
    // 설문은 금액만 받고 현재 집의 이름·평수는 저장하지 않는다. 지어내지 않고 비워 둔다.
    currentHome: { name: '', pyeong: null, estimatedSalePrice: survey.expectedSalePrice ?? 0 },
    newHome: {
      name: home?.houseName ?? '',
      pyeong: home?.houseSize == null ? null : Math.round(Number(home.houseSize) / 3.3058),
      fitScore: home?.totalScore ?? null,
      purchasePrice: buy.buyPrice,
    },
    costs,
    // 새 집까지 사고 남는 돈. 관심매물 화면이 금융 추천으로 넘기는 값과 같은 계산이다.
    netFund: buy.remainingAfterPurchase,
  }
})

// 자금 운용 계획 — 금융 추천 조건 입력에서 받은 값.
const financePlan = ref({
  netFund: 0,
  immediateExpenses: [],
  investable: 0,
  monthlyNeed: 0,
  items: [],
})

const data = computed(() => ({
  userName: authStore.state.user?.name ?? '',
  propertyResult: propertyResult.value,
  financePlan: financePlan.value,
  completedSteps: COMPLETED_STEPS,
}))
const pr = propertyResult
const fp = financePlan

const COMPLETED_STEPS = [
  { key: 'survey', label: '설문 조사' },
  { key: 'recommend-property', label: '추천 매물 확인' },
  { key: 'favorite', label: '관심 매물 비교' },
  { key: 'recommend', label: '금융상품 추천' },
  { key: 'finance-manage', label: '금융상품 관리' },
  { key: 'result', label: '최종 선택' },
]

const showPropertyDetail = ref(false)
const showExpenseDetail = ref(false)
const isPdfLoading = ref(false)
const pdfReportRef = ref(null)
const aiSummary = ref(null)
const aiLoading = ref(false)

// 포트폴리오 배분: DB에 저장된 관심상품 배분(금액/비율)을 조회해서 구성
const portfolioItems = ref([])
const portfolioMonthlyNeed = ref(0)
// 이자 반영 기준 지속 기간 — horizon과 같은 buildTimeline으로 계산해 숫자가 어긋나지 않게 한다
const fundedMonths = ref('')
const loadError = ref('')

// 관심매물 목록에서 사용자가 고른 집. 없으면 매물 정리 결과를 채울 수 없다.
async function loadSelectedHome() {
  const homes = await getFavoriteProperties()
  selectedHome.value = homes.find((h) => h.selected === 'Y') ?? homes[0] ?? null
}

// 금융 추천 조건 입력에서 받은 금액들. 즉시지출은 항목별 내역 없이 총액만 받는다.
function buildFinancePlan() {
  financePlan.value = {
    netFund: propertyResult.value.netFund,
    immediateExpenses: rec.immediateExpense > 0
      ? [{ label: '즉시 지출', amount: rec.immediateExpense }]
      : [],
    investable: rec.investAmount,
    monthlyNeed: rec.monthlyNeed,
    items: [],
  }
  portfolioMonthlyNeed.value = rec.monthlyNeed
}

onMounted(async () => {
  // 새로고침으로 들어오면 설문 스토어가 비어 있다. 매도 금액은 서버에서 복원한다.
  if (!survey.calculation && !survey.expectedSalePrice) {
    try {
      await survey.restoreLatest()
    } catch {
      // 복원 실패는 매도 관련 금액만 비게 만든다. 나머지는 그대로 보여준다.
    }
  }
  try {
    await loadSelectedHome()
  } catch (e) {
    loadError.value = '관심 매물을 불러오지 못했습니다.'
  }
  buildFinancePlan()

  try {
    const favorites = await fetchFavoriteProducts()
    const totalFund = rec.investAmount
    if (totalFund <= 0) return

    const allocated = favorites
      .filter((f) => f.amount != null)
      .map((f) => {
        // horizon과 동일하게 서버가 정한 대표금리·세후금리를 그대로 쓴다
        const rate = Number(f.rate)
        const afterTax = f.afterTaxRate == null ? null : Number(f.afterTaxRate)
        return {
          name: f.productName,
          tag: `${periodOf(f.termMonths).short} · ${RISK_LABELS[f.productRiskGrade] || f.productRiskGrade || ''}`,
          description:
            `${f.termMonths}개월 · 연 ${rate.toFixed(1)}%` +
            (afterTax == null ? '' : ` (세후 ${afterTax.toFixed(2)}%)`),
          maturityMonths: f.termMonths || 0,
          rate: rate / 100,
          afterTaxRate: afterTax == null ? null : afterTax / 100,
          fixed: !!f.fixed,
          invest: Number(f.amount),
          percent: Math.round(Number(f.percent)),
        }
      })
      .sort((a, b) => a.maturityMonths - b.maturityMonths)

    const parking = totalFund - allocated.reduce((s, it) => s + it.invest, 0)
    portfolioItems.value = parking > 0
      ? [{
          name: '파킹통장·CMA',
          tag: '즉시 인출',
          description: '첫 상품 만기 전 생활비 커버',
          maturityMonths: 0,
          rate: 0,
          fixed: false,
          invest: parking,
          percent: Math.round((parking / totalFund) * 100),
        }, ...allocated]
      : allocated

    const { funded } = buildTimeline(
      portfolioItems.value.map((it) => ({
        maturity: it.maturityMonths,
        rate: it.rate,
        afterTaxRate: it.afterTaxRate,
        fixed: it.fixed,
        invest: it.invest,
      })),
      portfolioMonthlyNeed.value,
    )
    fundedMonths.value = dur(funded)

    // PDF도 화면과 같은 실제 배분 결과를 그리도록 연결
    if (portfolioItems.value.length) financePlan.value.items = portfolioItems.value
  } catch (e) {
    console.warn('포트폴리오 배분 조회 실패', e)
  }
})

function formatKRW(value) {
  const eok = Math.floor(value / 1_0000_0000)
  const man = Math.round((value % 1_0000_0000) / 1_0000)
  if (eok && man) return `${eok}억 ${man.toLocaleString()}만원`
  if (eok) return `${eok}억원`
  return `${man.toLocaleString()}만원`
}

function dotColor(item) {
  if (!item || item.maturityMonths === 0) return 'park'
  return periodOf(item.maturityMonths).css
}

async function downloadPdf() {
  if (!pdfReportRef.value) return
  const el = pdfReportRef.value.pdfRoot
  if (!el) return

  isPdfLoading.value = true
  aiLoading.value = true
  aiSummary.value = null
  let restoreCaptureStyle = () => {}
  try {
    // 1단계: 요약 문장을 먼저 만들고, OpenAI에는 그 문장에 대한 전문가 조언만 요청
    const items = portfolioItems.value.length ? portfolioItems.value : fp.items
    const birthYear = authStore.state.user?.birthYear
    const userAge = birthYear
      ? Math.floor((new Date().getFullYear() - birthYear) / 10) * 10
      : 60
    const itemNames = items.map((i) => i.name).join(', ')
    const itemAmounts = items.map((i) => formatKRW(i.invest)).join(', ')
    const dataTemplateText =
      `현재 살고 계신 ${pr.currentHome.name}을(를) 팔고 관련 세금 및 주택담보 대출을 갚고 나면 ` +
      `${formatKRW(pr.currentHome.estimatedSalePrice)}이 남고, ${pr.newHome.name}으(로) 이사를 가신다면 ` +
      `${formatKRW(pr.netFund)}이 남습니다. 남는 돈을 ${itemNames}에 각각 ${itemAmounts}씩 투자하신다면, ` +
      `매달 추가로 ${formatKRW(portfolioMonthlyNeed.value)}씩을 ${fundedMonths.value} 동안 사용 가능합니다.`

    const generated = await generateActionPlan({
      investable: fp.investable,
      monthlyNeed: portfolioMonthlyNeed.value,
      fundedMonths: fundedMonths.value,
      items,
      propertyResult: pr,
      userAge,
      profileCode: rec.riskLevel,
      dataTemplateText,
    })
    aiSummary.value = { ...generated, dataTemplateText }
    aiLoading.value = false

    // 2단계: Vue가 aiSummary를 PdfReport에 반영할 때까지 대기
    await nextTick()
    await nextTick()

    // 3단계: 캡처
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ])

    restoreCaptureStyle = preparePdfCapture(el)
    el.style.top = '0'
    el.style.left = '0'
    await nextTick()
    await document.fonts?.ready

    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const { x, y, width, height } = fitCanvasToA4(canvas)
    pdf.addImage(imgData, 'PNG', x, y, width, height)
    pdf.save('다운사이징_보고서.pdf')
  } catch (error) {
    console.error('PDF generation failed:', error)
    window.alert('PDF 생성에 실패했습니다. 다시 시도해 주세요.')
  } finally {
    aiLoading.value = false
    restoreCaptureStyle()
    isPdfLoading.value = false
  }
}
</script>

<style scoped>
.summary-shell {
  max-width: 640px;
  margin: 0 auto;
  padding: 48px 20px 60px;
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}

.done-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  border-radius: 50%;
  background: var(--kb-yellow);
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
  color: var(--text-muted);
  margin: 0 0 4px;
}

.done-hint {
  text-align: center;
  font-size: 13px;
  color: var(--text-faint);
  margin: 0 0 32px;
}

/* ── 결과 카드 공통 ── */
.summary-card {
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

.card-subheading {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-muted);
  margin: 0 0 12px;
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
  color: var(--text-muted);
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
  color: var(--text-faint);
}

/* 0원인 항목의 사유(비과세 등). 숨기면 계산이 빠진 것처럼 보인다 */
.cost-note {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #eef2f7;
  color: var(--text-muted);
  font-size: 11.5px;
}

.cost-zero {
  font-size: 17px;
  color: var(--text-faint);
}

/* 아직 채워지지 않은 값 — 숫자 자리에 안내 문구가 들어간다 */
.row-empty {
  font-size: 13px !important;
  font-weight: 500;
  color: var(--text-faint);
}

.load-error {
  margin: 0 0 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #fdeceb;
  color: #a3352c;
  font-size: 13.5px;
}

.sub-label {
  font-size: 12px;
  color: var(--text-faint);
}

.negative {
  color: var(--jh-danger);
}

.highlight-value {
  font-size: 20px;
  color: var(--kb-yellow-deep);
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
  background: var(--kb-yellow-soft);
  border: 1px solid var(--card-selected-border);
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
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.detail-toggle:hover {
  color: var(--text-dark);
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

/* ── 포트폴리오 섹션 ── */
.pf-section { margin-top: 0; }

.pf-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pf-meta-label { font-size: 13px; font-weight: 700; color: var(--text-muted); }
.pf-meta-monthly { font-size: 12px; color: var(--text-faint); }
.pf-meta-monthly b { color: #374151; font-weight: 700; }

/* 배분 비율 바 */
.pf-alloc-bar {
  display: flex;
  height: 8px;
  border-radius: 99px;
  overflow: hidden;
  gap: 2px;
  margin-bottom: 14px;
}
.pf-alloc-seg { border-radius: 2px; min-width: 2px; }

/* 상품 목록 */
.pf-items { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.pf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  background: #fafaf8;
  border-radius: 10px;
  border: 1px solid #f0ede8;
}
.pf-item-left { display: flex; align-items: center; gap: 9px; min-width: 0; }
.pf-color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pf-item-info { min-width: 0; }
.pf-item-name { font-size: 13.5px; font-weight: 700; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pf-item-tag { font-size: 11px; color: var(--text-faint); }

.pf-item-right { flex-shrink: 0; text-align: right; min-width: 130px; }
.pf-item-bar-wrap { background: var(--card-border); border-radius: 4px; height: 5px; margin-bottom: 5px; overflow: hidden; }
.pf-item-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.pf-item-nums { display: flex; justify-content: flex-end; align-items: baseline; gap: 6px; }
.pf-item-amount { font-size: 14px; font-weight: 700; color: var(--text-dark); }
.pf-item-pct { font-size: 11.5px; font-weight: 700; color: var(--kb-yellow-deep); }

/* 타임라인 바 */
.pf-timeline {
  background: #f8f7f3;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #eeebe4;
}
.pf-tl-title { font-size: 11px; font-weight: 700; color: var(--text-faint); margin-bottom: 8px; letter-spacing: 0.03em; text-transform: uppercase; }
.pf-tl-bar {
  display: flex;
  height: 32px;
  border-radius: 7px;
  overflow: hidden;
  gap: 2px;
}
.pf-tl-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2px;
  border-radius: 4px;
  overflow: hidden;
}
.pf-tl-seg-name {
  font-size: 10px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
}
.pf-tl-axis {
  display: flex;
  margin-top: 5px;
}
.pf-tl-tick {
  font-size: 10px;
  color: #b0ab9f;
  min-width: 0;
  overflow: hidden;
}
.pf-tl-tick span { white-space: nowrap; }

/* 색상 토큰 */
.seg-park, .dot-park { background: var(--period-park); }
.seg-short, .dot-short { background: var(--period-short); }
.seg-mid, .dot-mid { background: var(--period-mid); }
.seg-mid2, .dot-mid2 { background: var(--period-mid2); }
.seg-long, .dot-long { background: var(--period-long); }

/* ── 세로 타임라인 (기존, 미사용 가능) ── */
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

.tl-dot.park { background: var(--period-park); box-shadow: 0 0 0 2px var(--period-park); }
.tl-dot.short { background: var(--period-short); box-shadow: 0 0 0 2px var(--period-short); }
.tl-dot.mid { background: var(--period-mid); box-shadow: 0 0 0 2px var(--period-mid); }
.tl-dot.mid2 { background: var(--period-mid2); box-shadow: 0 0 0 2px var(--period-mid2); }
.tl-dot.long { background: var(--period-long); box-shadow: 0 0 0 2px var(--period-long); }

.tl-line {
  width: 2px;
  flex: 1;
  background: var(--card-border);
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
  color: var(--text-muted);
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
  color: var(--kb-yellow-deep);
  background: var(--kb-yellow-soft);
  border: 1px solid var(--kb-yellow);
  border-radius: 10px;
  padding: 1px 8px;
  width: fit-content;
}

.product-name {
  font-size: 15px;
}

.product-desc {
  font-size: 12px;
  color: var(--text-faint);
}

.product-percent {
  font-size: 13px;
  color: var(--kb-yellow-deep);
  font-weight: 700;
}

/* ── 최종 결론 ── */
.conclusion-box {
  background: var(--text-dark);
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
  color: var(--kb-yellow);
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
  color: var(--text-faint);
}

.disclaimer-text strong {
  color: var(--text-muted);
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
  color: var(--text-faint);
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
  border: 1px solid var(--card-border);
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-dark);
  cursor: pointer;
}

.step-chip:hover {
  background: var(--kb-yellow-soft);
}

.step-check {
  color: var(--kb-yellow);
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
  border: 1px solid var(--card-border);
  border-radius: 14px;
  cursor: pointer;
}

.action-card:hover {
  background: var(--kb-yellow-soft);
}

.action-icon {
  font-size: 24px;
}

.action-card strong {
  font-size: 14px;
}

.action-sub {
  font-size: 12px;
  color: var(--text-faint);
}

.pdf-btn {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 14px;
  background: var(--kb-yellow);
  color: #3a3326;
  font-size: 17px;
  font-weight: 800;
  box-shadow: 0 12px 22px -8px rgba(140, 90, 27, 0.55);
  cursor: pointer;
}

.pdf-hint {
  text-align: center;
  font-size: 12px;
  color: var(--text-faint);
  margin-top: 10px;
}

@media (max-width: 480px) {
  .steps-grid,
  .action-cards {
    grid-template-columns: 1fr;
  }
}
</style>
