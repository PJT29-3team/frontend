<script setup>
import { computed } from 'vue';
import { formatKRW, RISK_OPTIONS } from '@/stores/recommendation';

const props = defineProps({
  product: Object, // 기본정보 (추천 결과 카드)
  detail: Object,  // 상세정보 (API 응답)
  loading: Boolean, // API 로딩 중
});

const emit = defineEmits(['close']);

function riskBadge(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.label ?? code;
}

function riskTone(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.tone ?? 'safe';
}

function formatPercent(val) {
  return val == null ? '-' : Number(val).toFixed(2);
}

function evaluateVolatility(val) {
  if (val == null) return '-';
  const num = Number(val);
  if (num === 0.0) return '0.00% (원금 안심형 - 시세 변동 없음)';
  if (num < 5.0) return `${num.toFixed(2)}% (매우 안정적 - 예금 수준)`;
  if (num < 15.0) return `${num.toFixed(2)}% (보통 수준 - 완만한 가격 움직임)`;
  return `${num.toFixed(2)}% (높은 흔들림 - 가격 변동폭이 큼)`;
}

function evaluateMDD(val) {
  if (val == null) return '-';
  const num = Math.abs(Number(val));
  if (num === 0.0) return '0.00% (원금 보존형 - 하락 이력 없음)';
  if (num < 3.0) return `-${num.toFixed(2)}% (매우 안전 - 하락 위험이 매우 적음)`;
  if (num < 8.0) return `-${num.toFixed(2)}% (소폭 하락 경험 - 하락 후 빠르게 회복함)`;
  return `-${num.toFixed(2)}% (큰 하락 경험 - 자산 가치가 눈에 띄게 떨어진 적 있음)`;
}


function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

const logoText = computed(() => {
  return (props.product?.institution || '').replace(/\s/g, '').slice(0, 2);
});

const categoryLabel = computed(() => {
  const labels = {
    DEPOSIT: '예금',
    CMA: 'CMA',
    BOND_ETF: '만기 채권ETF',
    BOND: '채권',
    BOND_FUND: '펀드',
  };
  return labels[props.detail?.category] ?? props.detail?.category ?? '';
});
</script>

<template>
  <div class="modal-overlay" @click="emit('close')">
    <div class="modal-panel" @click.stop>
      <!-- 헤더 -->
      <div class="modal-header">
        <div class="modal-header-content">
          <span class="p-logo">{{ logoText }}</span>
          <div>
            <span class="p-inst">{{ detail?.institution ?? '-' }}</span>
            <strong class="p-name">{{ detail?.name ?? '-' }}</strong>
          </div>
        </div>
        <button type="button" class="modal-close" @click="emit('close')">✕</button>
      </div>

      <!-- 로딩 상태 -->
      <div v-if="loading" class="modal-body">
        <p class="loading-msg">상세정보를 불러오는 중…</p>
      </div>

      <!-- 상세정보 -->
      <div v-else-if="detail" class="modal-body">
        <!-- 기본정보 섹션 -->
        <section class="detail-section">
          <h3 class="section-title">기본정보</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">카테고리</span>
              <span class="info-value">{{ categoryLabel }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">위험도</span>
              <span class="info-value" :class="'tone-' + riskTone(detail.safetyLevel)">
                {{ riskBadge(detail.safetyLevel) }}
              </span>
            </div>
            <div class="info-item">
              <span class="info-label">예치기간</span>
              <span class="info-value">{{ detail.termMonths ?? '-' }}개월</span>
            </div>
            <div class="info-item">
              <span class="info-label">만기일</span>
              <span class="info-value">{{ formatDate(detail.maturityDate) }}</span>
            </div>
          </div>
        </section>

        <!-- 수익률/금리 섹션 -->
        <section class="detail-section">
          <h3 class="section-title">수익률 · 금리</h3>
          <div class="info-grid">
            <!-- Account 타입 -->
            <template v-if="detail.kind === 'account'">
              <div class="info-item">
                <span class="info-label">기본금리</span>
                <span class="info-value">{{ formatPercent(detail.interestRate) }}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">최고우대금리</span>
                <span class="info-value">{{ formatPercent(detail.maxInterestRate) }}%</span>
              </div>
            </template>
            <!-- Stock 타입 -->
            <template v-else-if="detail.kind === 'stock'">
              <div class="info-item">
                <span class="info-label">최근 3년 평균 수익률 (연복리)</span>
                <span class="info-value">{{ formatPercent(detail.returnRate) }}%</span>
              </div>
              <div class="info-item">
                <span class="info-label">과거 수익률</span>
                <span class="info-value">{{ formatPercent(detail.pastReturnRate) }}%</span>
              </div>
            </template>
          </div>
        </section>

        <!-- 위험 지표 (Stock only) -->
        <section v-if="detail.kind === 'stock'" class="detail-section">
          <h3 class="section-title">위험 지표</h3>
          <div class="info-grid">
            <div class="info-item" style="flex-direction: column; align-items: flex-start; gap: 6px; grid-column: span 2;">
              <span class="info-label" style="font-weight: 700;">최근 1년 최대 하락폭 (가장 많이 떨어진 비율)</span>
              <span class="info-value" style="text-align: left; width: 100%;">{{ evaluateMDD(detail.maxDrawdown) }}</span>
            </div>
            <div class="info-item" style="flex-direction: column; align-items: flex-start; gap: 6px; grid-column: span 2;">
              <span class="info-label" style="font-weight: 700;">최근 1개월 변동성 (가격 흔들림)</span>
              <span class="info-value" style="text-align: left; width: 100%;">{{ evaluateVolatility(detail.volatility) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">원금손실 가능성</span>
              <span class="info-value">{{ detail.lossRisk === 'Y' ? '있음' : '없음' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">기초지수</span>
              <span class="info-value">{{ detail.underlyingIndex ?? '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 상품 상세 소개 -->
        <section class="detail-section">
          <h3 class="section-title">상품 상세 소개</h3>
          <div class="info-block">
            <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
              <span class="info-label" style="font-weight: 700;">상품 설명 및 가입 조건</span>
              <span class="info-value" style="text-align: left; white-space: pre-wrap; line-height: 1.6; font-size: 14px; width: 100%;">{{ detail.recommendReason ?? '-' }}</span>
            </div>
          </div>
        </section>


        <!-- 안내문 -->
        <section class="detail-section notice">
          <p>금융상품 가입 전 반드시 상품설명서와 약관을 확인하시기 바랍니다.</p>
        </section>
      </div>

      <!-- 닫기 버튼 -->
      <div class="modal-footer">
        <button type="button" class="secondary-btn" @click="emit('close')">닫기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
  padding: 0 20px 20px;
}

.modal-panel {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 20px;
  border-bottom: 1px solid #e5e5e5;
  gap: 12px;
  position: sticky;
  top: 0;
  background: white;
}

.modal-header-content {
  display: flex;
  gap: 12px;
  flex: 1;
}

.p-logo {
  width: 56px;
  height: 56px;
  background: #9ca3af;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.modal-header-content div {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.p-inst {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.p-name {
  font-size: 16px;
  color: #1f2937;
  line-height: 1.4;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  color: #1f2937;
}

.modal-body {
  padding: 24px 20px;
  max-width: 100%;
}

.loading-msg {
  text-align: center;
  color: #9ca3af;
  padding: 40px 20px;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section.notice {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 0;
}

.detail-section.notice p {
  margin: 0;
  font-size: 14px;
  color: #92400e;
  line-height: 1.5;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
  word-break: break-word;
}

.info-value.tone-safe {
  color: #059669;
}

.info-value.tone-caution {
  color: #d97706;
}

.info-value.tone-warn {
  color: #dc2626;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .info-label {
  min-width: 100px;
  color: #6b7280;
}

.info-row .info-value {
  text-align: right;
  flex: 1;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
}

.secondary-btn {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.secondary-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .modal-panel {
    border-radius: 16px;
  }
}
</style>
