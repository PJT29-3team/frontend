<template>
  <div ref="pdfRoot" class="pdf-page" aria-hidden="true">

    <!-- 헤더 -->
    <div class="pdf-header">
      <div class="pdf-header-left">
        <div class="pdf-title">다운사이징 보고서</div>
        <div class="pdf-subtitle">보고서 한눈에 보기</div>
      </div>
      <div class="pdf-header-right">
        <div class="pdf-date-label">작성일</div>
        <div class="pdf-date">{{ today }}</div>
      </div>
    </div>
    <div class="pdf-header-line"></div>

    <!-- ① AI 행동 지침 -->
    <div v-if="aiSummary" class="pdf-section pdf-ai-section">
      <div class="pdf-section-num">① 보고서 AI 요약</div>

      <!-- 시뮬레이션 결과 (요약 문장) -->
      <div class="pdf-ai-insight">
        <span class="pdf-ai-insight-label">시뮬레이션 결과</span>
        <div class="pdf-ai-insight-text"><strong>{{ aiSummary.dataTemplateText }}</strong></div>
      </div>

      <!-- 전문가 조언 (AI Insight) -->
      <div class="pdf-ai-insight">
        <span class="pdf-ai-insight-label">전문가의 조언</span>
        <div class="pdf-ai-insight-text">{{ aiSummary.ai_insight }}</div>
      </div>
    </div>
    <div v-else-if="aiLoading" class="pdf-section pdf-ai-section">
      <div class="pdf-section-num">① 보고서 AI 요약</div>
      <div class="pdf-ai-placeholder">AI가 행동 지침을 분석하고 있습니다…</div>
    </div>

    <!-- ② 옮길 집 -->
    <div class="pdf-section">
      <div class="pdf-section-num">② 옮길 집</div>
      <div class="pdf-sec1-row">
        <div class="pdf-sec1-left">
          <div class="pdf-home-name">{{ pr.newHome.name }}</div>
          <div class="pdf-home-meta">{{ pr.newHome.location }} · {{ pr.newHome.pyeong }}평</div>
          <div class="pdf-grades">
            <span
              v-for="g in (pr.newHome.grades || [])"
              :key="g.label"
              :class="['pdf-grade', gradeClass(g.score)]"
            ><i></i>{{ g.label }} {{ grade(g.score) }}</span>
          </div>
          <div v-if="pr.newHome.memo" class="pdf-home-memo">{{ pr.newHome.memo }}</div>
        </div>
        <div class="pdf-sec1-right">
          <div class="pdf-label-sm">매수 금액(세금 포함)</div>
          <div class="pdf-amount-lg">{{ formatKRW(pr.newHome.purchasePrice) }}</div>
        </div>
      </div>
    </div>

    <!-- ③ 남는 돈 -->
    <div class="pdf-section">
      <div class="pdf-section-num">③ 남는 돈</div>
      <div class="pdf-sec2-row">
        <div class="pdf-label-sm">손에 쥐는 돈</div>
        <div class="pdf-highlight">{{ formatKRW(pr.netFund) }}</div>
      </div>
      <div class="pdf-cost-row">
        <span>현재 집 매도 예상가</span>
        <span>{{ formatKRW(pr.currentHome.estimatedSalePrice) }}</span>
      </div>
      <div class="pdf-cost-row">
        <span>새 집 매수가</span>
        <span class="pdf-neg">- {{ formatKRW(pr.newHome.purchasePrice) }}</span>
      </div>
      <div v-for="cost in pr.costs" :key="cost.label" class="pdf-cost-row">
        <span>{{ cost.label }}<template v-if="cost.note"> ({{ cost.note }})</template></span>
        <span :class="{ 'pdf-neg': cost.amount > 0 }">
          <template v-if="cost.amount > 0">- {{ formatKRW(cost.amount) }}</template>
          <template v-else>0원</template>
        </span>
      </div>
      <div class="pdf-cost-note">실제 거래가·세금에 따라 달라질 수 있어요</div>
    </div>

    <!-- ④ 굴리는 돈 -->
    <div class="pdf-section">
      <div class="pdf-section-num">④ 굴리는 돈</div>

      <div class="pdf-sec3-top">
        <span class="pdf-invest-amount">{{ formatKRW(fp.investable) }}</span>
        <span class="pdf-invest-sub">관심 금융상품 {{ fp.items.length }}개에 배분</span>
      </div>

      <!-- 배분 바 -->
      <div class="pdf-alloc-bar">
        <div
          v-for="(item, i) in fp.items"
          :key="'ab'+i"
          :class="['pdf-alloc-seg', 'pdf-seg-' + dotColor(item)]"
          :style="{ flex: item.percent }"
        ></div>
      </div>

      <!-- 상품 목록 -->
      <div class="pdf-products">
        <div v-for="(item, i) in fp.items" :key="'pr'+i" class="pdf-product-row">
          <div class="pdf-product-left">
            <span :class="['pdf-product-dot', 'pdf-dot-' + dotColor(item)]"></span>
            <div>
              <div class="pdf-product-name">{{ item.name }}</div>
              <span :class="['pdf-product-badge', badgeClass(item.tag)]">{{ riskLabel(item.tag) }}</span>
            </div>
          </div>
          <div class="pdf-product-right">
            <div class="pdf-product-amount">{{ formatKRW(item.invest) }}</div>
            <div class="pdf-product-pct">{{ item.percent }}%</div>
          </div>
        </div>
      </div>

      <!-- 타임라인 — 상품별 담당 구간 간트차트. 가로축이 시간(개월), 행 하나가 상품 하나 -->
      <div v-if="timeline.segs.length" class="pdf-timeline-wrap">
        <div class="pdf-tl-label">시기별 자금 흐름</div>
        <div class="pdf-gantt">
          <div v-for="(seg, i) in timeline.segs" :key="'g'+i" class="pdf-gantt-row">
            <div class="pdf-gantt-name">
              <span class="pdf-gantt-name-main">{{ seg.name }}</span>
              <span class="pdf-gantt-name-sub">{{ seg.from }}~{{ seg.to }}개월차</span>
            </div>
            <div class="pdf-gantt-track">
              <div
                :class="['pdf-gantt-bar', 'pdf-seg-' + seg.type]"
                :style="{ left: pctOf(seg.from - 1) + '%', width: pctOf(seg.months) + '%' }"
              ></div>
            </div>
          </div>
          <div class="pdf-gantt-axis">
            <div class="pdf-gantt-axis-track">
              <span
                v-for="(t, i) in ticks"
                :key="'t'+i"
                :class="['pdf-gantt-tick', { last: i === ticks.length - 1 }]"
                :style="{ left: pctOf(t) + '%' }"
              >{{ t }}개월</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { periodOf } from '@/utils/finance/portfolioAllocation'
import { buildTimeline } from '@/utils/finance/horizonTimeline'

const props = defineProps({
  report: {
    type: Object,
    required: true,
  },
  aiSummary: {
    type: Object,
    default: null,
  },
  aiLoading: {
    type: Boolean,
    default: false,
  },
})

// report는 부모의 computed라 값이 갱신될 때마다 새 객체가 온다.
// setup에서 한 번 꺼내 두면 관심매물·배분 결과가 도착해도 옛 객체를 계속 그린다.
const pr = computed(() => props.report.propertyResult)
const fp = computed(() => props.report.financePlan)
const pdfRoot = ref(null)

const today = computed(() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}. ${m}. ${day}`
})

function formatKRW(value) {
  const eok = Math.floor(value / 100000000)
  const man = Math.round((value % 100000000) / 10000)
  if (eok && man) return `${eok}억 ${man.toLocaleString()}만원`
  if (eok) return `${eok}억원`
  return `${man.toLocaleString()}만원`
}

// 등급 기준은 관심매물 비교표(favorite/MainView.vue)와 동일하게 유지할 것
function grade(score) {
  if (score >= 61) return '우수'
  if (score >= 41) return '보통'
  return '미흡'
}

function gradeClass(score) {
  const label = grade(score)
  if (label === '우수') return 'grade--good'
  if (label === '보통') return 'grade--normal'
  return 'grade--weak'
}

function dotColor(item) {
  if (!item || item.maturityMonths === 0) return 'park'
  return periodOf(item.maturityMonths).css
}

// 간트 데이터. horizon 화면과 같은 buildTimeline을 써서 두 화면의 구간이 어긋나지 않게 한다.
const timeline = computed(() =>
  buildTimeline(
    (fp.value.items || []).map((it) => ({
      name: it.name,
      maturity: it.maturityMonths,
      rate: it.rate,
      afterTaxRate: it.afterTaxRate,
      fixed: it.fixed,
      invest: it.invest,
      cssType: dotColor(it),
    })),
    fp.value.monthlyNeed,
  ),
)

// 개월 수 → 전체 기간 대비 가로 비율(%)
function pctOf(months) {
  const span = timeline.value.span
  return span === 0 ? 0 : (months / span) * 100
}

// 축 눈금: 0개월 + 각 구간이 끝나는 시점. 라벨이 겹치지 않게 너무 촘촘한 것은 솎아낸다.
const MIN_TICK_GAP = 0.07 // 전체 기간 대비
const ticks = computed(() => {
  const { segs, span } = timeline.value
  if (!span) return []
  const all = [0, ...segs.map((s) => s.to)]
  const last = all[all.length - 1]
  const out = []
  for (const t of all) {
    const far = out.length === 0 || (t - out[out.length - 1]) / span >= MIN_TICK_GAP
    if (t === last || far) out.push(t)
  }
  // 끝 눈금과 그 앞이 붙어 있으면 앞엣것을 버린다
  if (out.length >= 2 && (last - out[out.length - 2]) / span < MIN_TICK_GAP) {
    out.splice(out.length - 2, 1)
  }
  return out
})

function riskLabel(tag) {
  if (!tag) return ''
  if (tag.includes('즉시')) return '수시입출금'
  if (tag.includes('매우 낮은')) return '원금보장'
  if (tag.includes('낮은') || tag.includes('보통')) return '원금손실가능'
  const parts = tag.split('·')
  return parts[1] ? parts[1].trim() : tag
}

function badgeClass(tag) {
  if (!tag) return 'badge-safe'
  if (tag.includes('매우 낮은') || tag.includes('즉시')) return 'badge-safe'
  return 'badge-risk'
}

defineExpose({ pdfRoot })
</script>

<style scoped>
.pdf-page {
  position: fixed;
  top: -9999px;
  left: -9999px;
  width: 794px;
  background: #fff;
  padding: 48px 52px 52px;
  font-family: Pretendard, 'Noto Sans KR', Arial, sans-serif;
  color: #1f2937;
  box-sizing: border-box;
  font-size: 14px;
  line-height: 1.5;
}
.pdf-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; }
.pdf-title { font-size: 30px; font-weight: 800; margin-bottom: 2px; }
.pdf-subtitle { font-size: 16px; font-weight: 700; color: #f5c518; }
.pdf-date-label { font-size: 11px; color: var(--text-faint); text-align: right; }
.pdf-date { font-size: 15px; font-weight: 700; text-align: right; }
.pdf-header-line { height: 2px; background: #f5c518; margin-bottom: 20px; }
.pdf-section { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
.pdf-section-num { font-size: 11px; font-weight: 700; color: #b79a25; background: #fefce8; border-radius: 99px; display: inline-block; padding: 2px 10px; margin-bottom: 10px; }
.pdf-sec1-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.pdf-sec1-left { min-width: 0; flex: 1; }
.pdf-home-name { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
.pdf-home-meta { font-size: 12px; color: var(--text-faint); margin-bottom: 8px; }
/* 등급 배지 — /favorite-home 비교표의 .grade 스타일을 PDF 크기에 맞춰 옮긴 것 */
.pdf-grades { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.pdf-grade { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.pdf-grade i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.grade--good { background: #e5f5d9; color: #468733; }
.grade--normal { background: #fff0c9; color: #a37113; }
.grade--weak { background: #efeeec; color: #918d87; }
.pdf-home-memo { font-size: 11.5px; color: #6b7280; background: #fefce8; border-radius: 8px; padding: 6px 10px; }
.pdf-sec1-right { text-align: right; flex-shrink: 0; }
.pdf-label-sm { font-size: 11px; color: var(--text-faint); margin-bottom: 3px; }
.pdf-amount-lg { font-size: 18px; font-weight: 800; }
.pdf-sec2-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.pdf-highlight { font-size: 26px; font-weight: 800; color: #f59e0b; }
.pdf-cost-row { display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; padding: 3px 0; border-bottom: 1px solid #f3f4f6; }
.pdf-neg { color: #ef4444; }
.pdf-cost-note { font-size: 11px; color: var(--text-faint); margin-top: 5px; }
.pdf-sec3-top { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.pdf-invest-amount { font-size: 22px; font-weight: 800; }
.pdf-invest-sub { font-size: 12px; color: var(--text-faint); margin-left: auto; }
.pdf-alloc-bar { display: flex; height: 8px; border-radius: 99px; overflow: hidden; gap: 2px; margin-bottom: 12px; }
.pdf-alloc-seg { border-radius: 2px; min-width: 2px; }
.pdf-products { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.pdf-product-row { display: flex; justify-content: space-between; align-items: center; background: #fafaf8; border-radius: 8px; border: 1px solid #f0ede8; padding: 9px 12px; }
.pdf-product-left { display: flex; align-items: center; gap: 8px; }
.pdf-product-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; display: inline-block; }
.pdf-product-name { font-size: 13px; font-weight: 700; }
.pdf-product-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 1px 7px; border-radius: 99px; margin-top: 2px; }
.badge-safe { background: #d1fae5; color: #065f46; }
.badge-risk { background: #fee2e2; color: #991b1b; }
.pdf-product-right { text-align: right; }
.pdf-product-amount { font-size: 13px; font-weight: 700; }
.pdf-product-pct { font-size: 11px; color: #f59e0b; font-weight: 700; }
.pdf-timeline-wrap { background: #f8f7f3; border-radius: 10px; padding: 10px 13px; border: 1px solid #eeebe4; margin-bottom: 12px; }
.pdf-tl-label { font-size: 10px; font-weight: 700; color: var(--text-faint); margin-bottom: 7px; }
/* 간트차트 — horizon 화면(.gantt)을 PDF 폭·글자크기에 맞춰 옮긴 것 */
.pdf-gantt-row { display: grid; grid-template-columns: 150px 1fr; align-items: center; gap: 10px; padding: 3px 0; }
.pdf-gantt-name { display: flex; flex-direction: column; min-width: 0; text-align: right; }
.pdf-gantt-name-main { font-size: 11px; font-weight: 700; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.pdf-gantt-name-sub { font-size: 9px; color: #b0ab9f; }
.pdf-gantt-track { position: relative; height: 12px; }
/* 담당하지 않는 기간도 자리를 보이게 하는 바탕선 */
.pdf-gantt-track::before { content: ""; position: absolute; inset: 5px 0; background: #eae7e0; border-radius: 99px; }
.pdf-gantt-bar { position: absolute; top: 0; height: 12px; min-width: 3px; border-radius: 99px; }
.pdf-gantt-axis { display: grid; grid-template-columns: 150px 1fr; gap: 10px; margin-top: 3px; }
.pdf-gantt-axis-track { grid-column: 2; position: relative; height: 16px; border-top: 1px solid #ddd8cf; }
.pdf-gantt-tick { position: absolute; top: 5px; font-size: 9px; color: #b0ab9f; white-space: nowrap; }
.pdf-gantt-tick::before { content: ""; position: absolute; top: -5px; left: 0; width: 1px; height: 4px; background: #ddd8cf; }
/* 마지막 눈금은 오른쪽 끝이라 라벨을 왼쪽으로 당긴다 */
.pdf-gantt-tick.last { transform: translateX(-100%); }
.pdf-gantt-tick.last::before { left: auto; right: 0; }
.pdf-conclusion { background: #1f2937; color: #fff; border-radius: 10px; padding: 16px 20px; text-align: center; }
.pdf-conclusion-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 3px; }
.pdf-conclusion-value { font-size: 24px; font-weight: 800; color: #f5c518; }
.pdf-conclusion-tail { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.pdf-seg-park, .pdf-dot-park { background: var(--period-park); }
.pdf-seg-short, .pdf-dot-short { background: var(--period-short); }
.pdf-seg-mid, .pdf-dot-mid { background: var(--period-mid); }
.pdf-seg-mid2, .pdf-dot-mid2 { background: var(--period-mid2); }
.pdf-seg-long, .pdf-dot-long { background: var(--period-long); }

/* ④ AI 행동 지침 섹션 */
.pdf-ai-section { margin-top: 0; }
.pdf-ai-insight {
  margin-bottom: 16px;
  padding: 0 4px;
}
.pdf-ai-insight-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  color: #b79a25;
  background: #fefce8;
  padding: 2px 10px;
  border-radius: 99px;
  margin-bottom: 6px;
}
.pdf-ai-insight-text {
  font-size: 12.5px;
  line-height: 1.7;
  color: #4b5563;
}
.pdf-ai-placeholder {
  font-size: 12px;
  color: var(--text-faint);
  padding: 12px 16px;
  background: #fafaf8;
  border-radius: 8px;
}
</style>
