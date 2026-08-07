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
          <div class="pdf-home-meta">{{ pr.newHome.area }} · {{ pr.newHome.pyeong }}평</div>
          <div class="pdf-tags">
            <span v-for="tag in (pr.newHome.tags || [])" :key="tag" class="pdf-tag">● {{ tag }}</span>
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
        <span>내 집 팔고 대출 갚고 남는 돈</span>
        <span>{{ formatKRW(pr.currentHome.estimatedSalePrice) }}</span>
      </div>
      <div class="pdf-cost-row">
        <span>이 집 가격</span>
        <span class="pdf-neg">- {{ formatKRW(pr.newHome.purchasePrice) }}</span>
      </div>
      <div v-for="cost in pr.costs" :key="cost.label" class="pdf-cost-row">
        <span>{{ cost.label }}</span>
        <span class="pdf-neg">- {{ formatKRW(cost.amount) }}</span>
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

      <!-- 타임라인 -->
      <div class="pdf-timeline-wrap">
        <div class="pdf-tl-label">시기별 자금 흐름</div>
        <div class="pdf-tl-bar">
          <div
            v-for="(item, i) in fp.items"
            :key="'tl'+i"
            :class="['pdf-tl-seg', 'pdf-seg-' + dotColor(item)]"
            :style="{ flex: tlWidth(item, i) }"
          >
            <span class="pdf-tl-seg-text">{{ item.name.length > 8 ? item.name.slice(0, 8) + '…' : item.name }}</span>
          </div>
        </div>
        <div class="pdf-tl-axis">
          <div
            v-for="(item, i) in fp.items"
            :key="'ax'+i"
            class="pdf-tl-tick"
            :style="{ flex: tlWidth(item, i) }"
          >{{ item.maturityMonths === 0 ? '즉시' : item.maturityMonths + '개월' }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { periodOf } from '@/utils/finance/portfolioAllocation'

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

const pr = props.report.propertyResult
const fp = props.report.financePlan
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

function dotColor(item) {
  if (!item || item.maturityMonths === 0) return 'park'
  return periodOf(item.maturityMonths).css
}

function tlWidth(item, i) {
  const items = fp.items
  const from = item.maturityMonths || 0
  const next = items[i + 1]
  const to = next ? (next.maturityMonths || 0) : from + 30
  return Math.max(to - from, 4)
}

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
.pdf-date-label { font-size: 11px; color: #9ca3af; text-align: right; }
.pdf-date { font-size: 15px; font-weight: 700; text-align: right; }
.pdf-header-line { height: 2px; background: #f5c518; margin-bottom: 20px; }
.pdf-section { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px 20px; margin-bottom: 12px; }
.pdf-section-num { font-size: 11px; font-weight: 700; color: #b79a25; background: #fefce8; border-radius: 99px; display: inline-block; padding: 2px 10px; margin-bottom: 10px; }
.pdf-sec1-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.pdf-sec1-left { min-width: 0; flex: 1; }
.pdf-home-name { font-size: 18px; font-weight: 800; margin-bottom: 2px; }
.pdf-home-meta { font-size: 12px; color: #9ca3af; margin-bottom: 8px; }
.pdf-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.pdf-tag { font-size: 11px; color: #065f46; background: #d1fae5; border-radius: 99px; padding: 2px 9px; font-weight: 600; }
.pdf-home-memo { font-size: 11.5px; color: #6b7280; background: #fefce8; border-radius: 8px; padding: 6px 10px; }
.pdf-sec1-right { text-align: right; flex-shrink: 0; }
.pdf-label-sm { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
.pdf-amount-lg { font-size: 18px; font-weight: 800; }
.pdf-sec2-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.pdf-highlight { font-size: 26px; font-weight: 800; color: #f59e0b; }
.pdf-cost-row { display: flex; justify-content: space-between; font-size: 12px; color: #4b5563; padding: 3px 0; border-bottom: 1px solid #f3f4f6; }
.pdf-neg { color: #ef4444; }
.pdf-cost-note { font-size: 11px; color: #9ca3af; margin-top: 5px; }
.pdf-sec3-top { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; }
.pdf-invest-amount { font-size: 22px; font-weight: 800; }
.pdf-invest-sub { font-size: 12px; color: #9ca3af; margin-left: auto; }
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
.pdf-tl-label { font-size: 10px; font-weight: 700; color: #9ca3af; margin-bottom: 7px; }
.pdf-tl-bar { display: flex; height: 26px; border-radius: 6px; overflow: hidden; gap: 2px; }
.pdf-tl-seg { display: flex; align-items: center; justify-content: center; border-radius: 3px; min-width: 2px; overflow: hidden; }
.pdf-tl-seg-text { font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 0 4px; }
.pdf-tl-axis { display: flex; margin-top: 4px; }
.pdf-tl-tick { font-size: 9px; color: #b0ab9f; min-width: 0; overflow: hidden; white-space: nowrap; }
.pdf-conclusion { background: #1f2937; color: #fff; border-radius: 10px; padding: 16px 20px; text-align: center; }
.pdf-conclusion-label { font-size: 12px; color: rgba(255,255,255,0.6); margin-bottom: 3px; }
.pdf-conclusion-value { font-size: 24px; font-weight: 800; color: #f5c518; }
.pdf-conclusion-tail { font-size: 12px; color: rgba(255,255,255,0.6); margin-top: 2px; }
.pdf-seg-park, .pdf-dot-park { background: #4F9A91; }
.pdf-seg-short, .pdf-dot-short { background: #3B82F6; }
.pdf-seg-mid, .pdf-dot-mid { background: #7C3AED; }
.pdf-seg-mid2, .pdf-dot-mid2 { background: #D97706; }
.pdf-seg-long, .pdf-dot-long { background: #1E1B4B; }

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
  color: #9ca3af;
  padding: 12px 16px;
  background: #fafaf8;
  border-radius: 8px;
}
</style>
