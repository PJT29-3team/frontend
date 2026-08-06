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
    <section class="result-card">
      <h2 class="card-heading">선택결과 한눈에 보기</h2>

      <h3 class="card-subheading">매물 정리 결과</h3>
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
import { nextTick, onMounted, ref, reactive } from 'vue'
import PdfReport from './PdfReport.vue'
import { preparePdfCapture } from '@/utils/pdfCapture'
import { fitCanvasToA4 } from '@/utils/pdfLayout'
import { generateActionPlan } from '@/utils/openaiSummary'
import { fetchFavoriteProducts } from '@/api/financeApi'
import { useRecommendationStore } from '@/stores/recommendation'
import { authStore } from '@/stores/authStore'
import { termGroupOf } from '@/utils/finance/portfolioAllocation'
import { getFavoriteProperties } from '@/api/favoriteApi'
import surveyApi from '@/api/survey'
import { dummySummary as rawData } from '@/mock/dummySummary'
import { useSurveyStore } from '@/stores/survey'

const rec = useRecommendationStore()
const survey = useSurveyStore()
const TERM_LABELS = { UNDER_1Y: '단기', Y1_TO_3: '중기', OVER_3Y: '장기' }
const RISK_LABELS = { VERY_LOW: '매우 낮은 위험', LOW: '낮은 위험', MEDIUM: '보통 위험', HIGH: '높은 위험' }

const data = reactive(rawData)
const pr = data.propertyResult
const fp = data.financePlan

// Reset costs and immediateExpenses so dummy data doesn't leak
pr.costs = []
fp.immediateExpenses = []

const showPropertyDetail = ref(false)
const showExpenseDetail = ref(false)
const isPdfLoading = ref(false)
const pdfReportRef = ref(null)
const aiSummary = ref(null)
const aiLoading = ref(false)

// 포트폴리오 배분: DB에 저장된 관심상품 배분을 조회해서 구성
const portfolioItems = ref([])
const portfolioMonthlyNeed = ref(0)

onMounted(async () => {
  if (!authStore.state.user && authStore.state.accessToken) {
    try {
      await authStore.refresh()
    } catch (e) {
      console.warn('Failed to recover user state', e)
    }
  }
  const userId = authStore.state.user?.userId ?? 0

  data.userName = survey.displayName || authStore.state.user?.name || '고객'

  // 매물 정보 로드
  try {
    const favorites = await getFavoriteProperties()
    const selectedHome = favorites.find(h => h.selected === 'Y') || favorites[0]
    
    if (selectedHome) {
      pr.newHome = {
        name: selectedHome.houseName,
        pyeong: Math.round(selectedHome.houseSize / 3.3),
        fitScore: Math.round((selectedHome.safetyScore + selectedHome.convenienceScore + selectedHome.assetScore) / 3),
        purchasePrice: selectedHome.housePrice
      }
      pr.netFund = selectedHome.remainingAmount
      fp.netFund = selectedHome.remainingAmount
    }
  } catch (e) {
    console.warn('관심 매물 조회 실패', e)
  }

  pr.currentHome.name = survey.currentAddress || '기존 주택'
  pr.currentHome.pyeong = survey.currentPyeong || survey.residenceSize || '기존'
  pr.currentHome.estimatedSalePrice = survey.expectedSalePrice || 0
  
  let taxAmount = survey.taxResult?.amount ?? survey.taxResult ?? 0
  let brokerAmount = survey.brokerage?.amount ?? survey.brokerage ?? 0
  let mortgageAmt = survey.mortgageBalance || 0

  let activeSurveyId = survey.surveyId

  // 만약 새로고침으로 값이 없다면 백엔드에서 조회
  if (taxAmount === 0 && brokerAmount === 0 && userId) {
    try {
      const latest = await surveyApi.findLatest(userId)
      if (latest && latest.survey) {
        activeSurveyId = latest.survey.surveyId
        taxAmount = latest.survey.capitalGainsTaxAmount || 0
        brokerAmount = latest.survey.brokerageFeeAmount || 0
        mortgageAmt = latest.survey.mortgageBalanceAmount || 0
        if (!pr.currentHome.estimatedSalePrice) {
          pr.currentHome.estimatedSalePrice = latest.survey.transferPriceAmount || 0
        }
      }
    } catch (e) {
      console.warn('설문 내역 조회 실패', e)
    }
  }

  const costs = []
  costs.push({ label: '양도소득세 예상액', amount: taxAmount })
  costs.push({ label: '중개수수료 예상액', amount: brokerAmount })
  if (mortgageAmt > 0) {
    costs.push({ label: '주택담보대출 상환', amount: mortgageAmt })
  }
  pr.costs = costs

  const immediateExp = rec.immediateExpense || 0
  fp.investable = fp.netFund ? Math.max(0, fp.netFund - immediateExp) : rec.investAmount
  fp.monthlyNeed = rec.monthlyNeed
  fp.immediateExpenses = [{ label: '당장 쓸 돈', amount: immediateExp }]

  const covMonths = rec.coveredMonths
  if (covMonths === Infinity || covMonths === 0) {
    fp.fundedMonths = '평생'
  } else {
    fp.fundedMonths = `${Math.floor(covMonths / 12)}년 ${covMonths % 12}개월`
  }

  try {
    const favorites = await fetchFavoriteProducts(userId || activeSurveyId)
    const totalFund = fp.investable
    if (rec.monthlyNeed) portfolioMonthlyNeed.value = rec.monthlyNeed

    const allocated = favorites
      .filter((f) => f.amount != null)
      .map((f) => ({
        name: f.productName,
        tag: `${TERM_LABELS[termGroupOf(f.termMonths || 0)]} · ${RISK_LABELS[f.productRiskGrade] || f.productRiskGrade || ''}`,
        description: `${f.termMonths}개월 · 기본금리 연 ${Number(f.annualRate).toFixed(1)}%`,
        maturityMonths: f.termMonths || 0,
        invest: Number(f.amount),
        percent: Math.round(Number(f.percent)),
      }))
      .sort((a, b) => a.maturityMonths - b.maturityMonths)

    const parking = totalFund - allocated.reduce((s, it) => s + it.invest, 0)
    portfolioItems.value = parking > 0
      ? [{
          name: '파킹통장·CMA',
          tag: '즉시 인출',
          description: '첫 상품 만기 전 생활비 커버',
          maturityMonths: 0,
          invest: parking,
          percent: Math.round((parking / totalFund) * 100),
        }, ...allocated]
      : allocated
    
    // 💡 목업 대신 실제 배분 데이터를 PDF/보고서 데이터에 연결
    fp.items = portfolioItems.value
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

const GROUP_COLOR = { UNDER_1Y: 'short', Y1_TO_3: 'mid', OVER_3Y: 'long' }
function dotColor(item) {
  if (!item || item.maturityMonths === 0) return 'park'
  return GROUP_COLOR[termGroupOf(item.maturityMonths)] || 'long'
}

// 타임라인 바 각 세그먼트의 상대 너비 계산
function tlWidth(item, i) {
  const items = fp.items
  const from = item.maturityMonths || 0
  const next = items[i + 1]
  const to = next ? (next.maturityMonths || 0) : from + 30
  return Math.max(to - from, 4)
}

function periodLabel(item, i) {
  const items = fp.items
  const from = item.maturityMonths
  const next = items[i + 1]
  if (!next) return `${from}개월차~`
  return `${from}~${next.maturityMonths}개월차`
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
    const userAge = authStore.state.user?.birthYear ? Math.floor((new Date().getFullYear() - authStore.state.user.birthYear) / 10) * 10 : 60;
    const profileCode = rec.riskLevel || 'MEDIUM';

    const currentNet = formatKRW(survey.afterMortgage || pr.currentHome.estimatedSalePrice);
    const newNet = formatKRW(pr.netFund);
    const itemNames = fp.items.map(i => i.name).join(', ');
    const itemAmounts = fp.items.map(i => formatKRW(i.invest)).join(', ');
    
    const dataTemplateText = `현재 살고 계신 ${pr.currentHome.name}을(를) 팔고 관련 세금 및 주택담보 대출을 갚고 나면 ${currentNet}이 남고, ${pr.newHome.name}으(로) 이사를 가신다면 ${newNet}이 남습니다. 남는 돈을 ${itemNames}에 각각 ${itemAmounts}씩 투자하신다면, 매달 추가로 ${formatKRW(fp.monthlyNeed)}씩을 ${fp.fundedMonths} 동안 사용 가능합니다.`;

    // 1단계: OpenAI로 행동 지침 JSON 생성
    const generated = await generateActionPlan({
      investable: fp.investable,
      monthlyNeed: fp.monthlyNeed,
      fundedMonths: fp.fundedMonths,
      items: fp.items,
      propertyResult: pr,
      userAge,
      profileCode,
      dataTemplateText,
    });
    
    aiSummary.value = {
      ...generated,
      dataTemplateText,
    };
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

.card-subheading {
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
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

/* ── 포트폴리오 섹션 ── */
.pf-section { margin-top: 0; }

.pf-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.pf-meta-label { font-size: 13px; font-weight: 700; color: #6b7280; }
.pf-meta-monthly { font-size: 12px; color: #9ca3af; }
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
.pf-item-name { font-size: 13.5px; font-weight: 700; color: #1f2937; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pf-item-tag { font-size: 11px; color: #9ca3af; }

.pf-item-right { flex-shrink: 0; text-align: right; min-width: 130px; }
.pf-item-bar-wrap { background: #e5e7eb; border-radius: 4px; height: 5px; margin-bottom: 5px; overflow: hidden; }
.pf-item-bar { height: 100%; border-radius: 4px; transition: width 0.4s ease; }
.pf-item-nums { display: flex; justify-content: flex-end; align-items: baseline; gap: 6px; }
.pf-item-amount { font-size: 14px; font-weight: 700; color: #1f2937; }
.pf-item-pct { font-size: 11.5px; font-weight: 700; color: #f59e0b; }

/* 타임라인 바 */
.pf-timeline {
  background: #f8f7f3;
  border-radius: 12px;
  padding: 12px 14px;
  border: 1px solid #eeebe4;
}
.pf-tl-title { font-size: 11px; font-weight: 700; color: #9ca3af; margin-bottom: 8px; letter-spacing: 0.03em; text-transform: uppercase; }
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
.seg-park, .dot-park { background: #0d9488; }
.seg-short, .dot-short { background: #2563eb; }
.seg-mid, .dot-mid { background: #4f46e5; }
.seg-long, .dot-long { background: #1e1b4b; }

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
