<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecommendationStore, RISK_OPTIONS, formatKRW } from '@/stores/recommendation';
import recommendationApi from '@/api/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const route = useRoute();
const rec = useRecommendationStore();

const loading = ref(true);
const error = ref(null);
const detail = ref(null);

const productType = route.params.productType;
const kind = route.query.kind || 'account';

function riskBadge(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.label ?? code;
}

function riskTone(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.tone ?? 'safe';
}

function formatPercent(val) {
  return val == null ? '-' : Number(val).toFixed(2);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function logoText(name) {
  return (name || '').replace(/\s/g, '').slice(0, 2);
}

const categoryLabel = {
  DEPOSIT: '예금',
  SAVINGS: '적금',
  CMA: 'CMA',
  BOND_ETF: '만기 채권ETF',
  BOND: '채권',
  BOND_FUND: '펀드',
};

function getCategoryLabel(cat) {
  return categoryLabel[cat] ?? cat;
}

onMounted(async () => {
  try {
    // 캐시 확인
    let cached = rec.getCachedDetail(kind, productType);
    if (cached) {
      detail.value = cached;
    } else {
      // API 호출
      const res = await recommendationApi.getProductDetail(productType, kind);
      detail.value = res;
      rec.setCachedDetail(kind, productType, res);
    }
  } catch (e) {
    console.error('Failed to load product detail:', e);
    error.value = '상세정보를 불러오지 못했어요.';
  } finally {
    loading.value = false;
  }
});

function goBack() {
  router.back();
}
</script>

<template>
  <div class="product-detail-page">
    <div class="pd-shell">
      <!-- 헤더 -->
      <header class="pd-header">
        <button type="button" class="back-btn" @click="goBack">← 뒤로</button>
        <h1 class="pd-title">상품 정보</h1>
        <div style="width: 40px"></div>
      </header>

      <!-- 로딩 상태 -->
      <p v-if="loading" class="state-msg">상세정보를 불러오는 중…</p>

      <!-- 에러 상태 -->
      <p v-else-if="error" class="state-msg error">{{ error }}</p>

      <!-- 상세정보 -->
      <div v-else-if="detail" class="pd-content">
        <!-- 상품 헤더 카드 -->
        <div class="product-header-card">
          <div class="ph-left">
            <span class="ph-logo">{{ logoText(detail.institution) }}</span>
            <div>
              <span class="ph-inst">{{ detail.institution }}</span>
              <strong class="ph-name">{{ detail.name }}</strong>
            </div>
          </div>
          <div class="ph-rate">
            <span class="ph-rate-label">금리</span>
            <strong class="ph-rate-value">{{ formatPercent(detail.rate) }}%</strong>
          </div>
        </div>

        <!-- 기본정보 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">기본정보</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">카테고리</span>
              <span class="info-value">{{ getCategoryLabel(detail.category) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">위험도</span>
              <span class="info-value" :class="'tone-' + riskTone(detail.safetyLevel)">
                {{ riskBadge(detail.safetyLevel) }}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">예치기간</span>
              <span class="info-value">{{ detail.termMonths ?? '-' }}개월</span>
            </div>
            <div class="info-row">
              <span class="info-label">만기일</span>
              <span class="info-value">{{ formatDate(detail.maturityDate) }}</span>
            </div>
          </div>
        </section>

        <!-- 수익률/금리 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">수익률 · 금리</h2>
          <div class="info-table">
            <!-- Account 타입 -->
            <template v-if="detail.kind === 'account'">
              <div class="info-row">
                <span class="info-label">기본금리</span>
                <span class="info-value">{{ formatPercent(detail.interestRate) }}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">최고우대금리</span>
                <span class="info-value">{{ formatPercent(detail.maxInterestRate) }}%</span>
              </div>
            </template>
            <!-- Stock 타입 -->
            <template v-else-if="detail.kind === 'stock'">
              <div class="info-row">
                <span class="info-label">3년 수익률(연환산)</span>
                <span class="info-value">{{ formatPercent(detail.returnRate) }}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">과거 수익률</span>
                <span class="info-value">{{ formatPercent(detail.pastReturnRate) }}%</span>
              </div>
            </template>
          </div>
        </section>

        <!-- 위험 지표 (Stock only) -->
        <section v-if="detail.kind === 'stock'" class="pd-section">
          <h2 class="pd-section-title">위험 지표</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">최대낙폭(MDD)</span>
              <span class="info-value">{{ formatPercent(detail.maxDrawdown) }}%</span>
            </div>
            <div class="info-row">
              <span class="info-label">변동성</span>
              <span class="info-value">{{ formatPercent(detail.volatility) }}%</span>
            </div>
            <div class="info-row">
              <span class="info-label">원금손실 가능성</span>
              <span class="info-value">{{ detail.lossRisk === 'Y' ? '있음' : '없음' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">기초지수</span>
              <span class="info-value">{{ detail.underlyingIndex ?? '-' }}</span>
            </div>
          </div>
        </section>

        <!-- 추천정보 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">추천정보</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">추천 이유</span>
              <span class="info-value">{{ detail.recommendReason ?? '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">추천 비중</span>
              <span class="info-value">{{ formatPercent(detail.recommendedWeight) }}%</span>
            </div>
          </div>
        </section>

        <!-- 주의사항 섹션 -->
        <section class="pd-section notice">
          <h2 class="pd-section-title">주의사항</h2>
          <ul class="notice-list">
            <li>금융상품 가입 전 반드시 상품설명서와 약관을 확인하시기 바랍니다.</li>
            <li>본 서비스에서 제공하는 정보는 참고용이며, 투자의 최종 결정과 그 결과에 대한 책임은 이용자 본인에게 있습니다.</li>
            <li v-if="detail.lossRisk === 'Y'" class="important">원금 손실이 발생할 수 있으므로 신중하게 선택해주세요.</li>
          </ul>
        </section>
      </div>

      <!-- 하단 버튼 -->
      <div v-if="!loading && !error" class="pd-footer">
        <button type="button" class="primary-btn" @click="goBack">상품 선택으로 돌아가기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-detail-page {
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark, #1f2937);
  background: #fafafa;
  min-height: 100vh;
}

.pd-shell {
  max-width: 600px;
  margin: 0 auto;
  background: white;
}

.pd-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  position: sticky;
  top: 0;
  background: white;
  z-index: 100;
}

.back-btn {
  background: none;
  border: none;
  color: #374151;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
}

.pd-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.state-msg {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
  font-size: 15px;
}

.state-msg.error {
  color: #dc2626;
}

.pd-content {
  padding: 20px;
}

.product-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 32px;
  border: 1px solid #e5e5e5;
}

.ph-left {
  display: flex;
  gap: 12px;
  flex: 1;
}

.ph-logo {
  width: 56px;
  height: 56px;
  background: #9ca3af;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
}

.ph-left div {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.ph-inst {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.ph-name {
  font-size: 16px;
  color: #1f2937;
  line-height: 1.4;
}

.ph-rate {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.ph-rate-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.ph-rate-value {
  font-size: 20px;
  font-weight: 600;
  color: #059669;
}

.pd-section {
  margin-bottom: 32px;
}

.pd-section.notice {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 0;
}

.pd-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px;
}

.info-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 0;
  border-bottom: 1px solid #f3f4f6;
  gap: 16px;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
  min-width: 100px;
  flex-shrink: 0;
}

.info-value {
  font-size: 15px;
  color: #1f2937;
  font-weight: 500;
  text-align: right;
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

.notice-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.notice-list li {
  font-size: 14px;
  color: #92400e;
  line-height: 1.6;
  margin-bottom: 12px;
  position: relative;
  padding-left: 16px;
}

.notice-list li:before {
  content: '•';
  position: absolute;
  left: 0;
}

.notice-list li.important {
  color: #dc2626;
  font-weight: 500;
}

.pd-footer {
  padding: 20px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  gap: 12px;
  background: white;
}

.primary-btn {
  flex: 1;
  padding: 12px 20px;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.primary-btn:hover {
  background: #111827;
}

@media (max-width: 640px) {
  .pd-shell {
    min-height: 100vh;
  }

  .product-header-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .ph-rate {
    align-items: flex-start;
    width: 100%;
  }
}
</style>
