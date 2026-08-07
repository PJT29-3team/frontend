<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useRecommendationStore, RISK_OPTIONS } from '@/stores/recommendation';
import recommendationApi from '@/api/recommendation';
import { periodOf } from '@/utils/finance/portfolioAllocation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const route = useRoute();
const rec = useRecommendationStore();

const loading = ref(true);
const error = ref(null);
const detail = ref(null);

const productType = route.params.productType;
const kind = route.query.kind || 'account';

let enterTime = Date.now();
const isLiked = ref(false);

function checkIsFavorited() {
  return Object.values(rec.favorites).some((v) => v && v.productType === productType);
}


function toggleHeart(loc) {
  const dwellTimeSec = Math.max(0, Math.floor((Date.now() - enterTime) / 1000));
  
  if (detail.value) {
    const periodCode = periodOf(detail.value.termMonths).code;
    rec.toggleFavorite(periodCode, detail.value);
  }

  isLiked.value = checkIsFavorited();

  // 노이즈 방어: 상단에서 3초 미만 빠른 찜 해제는 전송 안 함
  if (loc === 'DETAIL_TOP' && dwellTimeSec < 3 && !isLiked.value) {
    return;
  }

  const actionType = isLiked.value ? 'LIKE' : 'UNLIKE';

  recommendationApi.logInteraction({
    productType,
    productKind: kind,
    actionType,
    location: loc,
    dwellTimeSec,
  }).catch(() => {});
}

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

function logoText(name) {
  return (name || '').replace(/\s/g, '').slice(0, 2);
}

const categoryLabel = {
  DEPOSIT: '예금',
  CMA: 'CMA',
  BOND_ETF: '만기 채권ETF',
  BOND: '채권',
  BOND_FUND: '펀드',
};

function getCategoryLabel(cat) {
  return categoryLabel[cat] ?? cat;
}

onMounted(async () => {
  enterTime = Date.now();
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
    isLiked.value = checkIsFavorited();

    // VIEW 로그 송신
    recommendationApi.logInteraction({
      productType,
      productKind: kind,
      actionType: 'VIEW',
      location: 'DETAIL_TOP',
      dwellTimeSec: 0,
    }).catch(() => {});
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
        <button
          type="button"
          class="top-heart-btn"
          :class="{ on: isLiked }"
          :aria-label="isLiked ? '관심 해제' : '관심 등록'"
          @click="toggleHeart('DETAIL_TOP')"
        >
          {{ isLiked ? '♥' : '♡' }}
        </button>
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
            <span class="ph-rate-label">{{ detail.kind === 'stock' ? '대표 수익률' : '최고 금리' }}</span>
            <span class="ph-rate-value">연 {{ formatPercent(detail.rate) }}%</span>
          </div>
        </div>

        <!-- 기본 정보 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">기본 정보</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">상품 코드</span>
              <span class="info-value">{{ detail.productType }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">상품 종류</span>
              <span class="info-value">{{ detail.kind === 'stock' ? '채권/ETF/펀드' : '예금/CMA' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">카테고리</span>
              <span class="info-value">{{ getCategoryLabel(detail.category) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">안전 등급</span>
              <span class="info-value" :class="`tone-${riskTone(detail.safetyLevel)}`">
                {{ riskBadge(detail.safetyLevel) }}
              </span>
            </div>
          </div>
        </section>

        <!-- 금리 및 수익률 정보 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">금리 및 수익률 정보</h2>
          <div class="info-table">
            <template v-if="detail.kind === 'account'">
              <div class="info-row">
                <span class="info-label">기본 금리</span>
                <span class="info-value">{{ formatPercent(detail.interestRate) }}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">최고 우대 금리</span>
                <span class="info-value tone-safe">{{ formatPercent(detail.maxInterestRate) }}%</span>
              </div>
            </template>
            <template v-else-if="detail.kind === 'stock'">
              <div class="info-row">
                <span class="info-label">3년 수익률</span>
                <span class="info-value">{{ formatPercent(detail.returnRate) }}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">과거 수익률</span>
                <span class="info-value">{{ formatPercent(detail.pastReturnRate) }}%</span>
              </div>
            </template>
          </div>
        </section>

        <!-- 기간 정보 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">기간 정보</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">예치 기간</span>
              <span class="info-value">{{ detail.termMonths ?? '-' }}개월</span>
            </div>
            <div v-if="detail.maturityDate" class="info-row">
              <span class="info-label">만기일</span>
              <span class="info-value">{{ formatDate(detail.maturityDate) }}</span>
            </div>
            <div v-if="detail.remainingMonths" class="info-row">
              <span class="info-label">남은 만기</span>
              <span class="info-value">{{ detail.remainingMonths }}개월</span>
            </div>
          </div>
        </section>

        <!-- 위험 지표 섹션 (stock 전용) -->
        <section v-if="detail.kind === 'stock'" class="pd-section">
          <h2 class="pd-section-title">위험 및 기초 지표</h2>
          <div class="info-table">
            <div class="info-row">
              <span class="info-label">최대 낙폭 (MDD)</span>
              <span class="info-value" style="text-align: left; width: 100%;">{{ evaluateMDD(detail.maxDrawdown) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">변동성</span>
              <span class="info-value" style="text-align: left; width: 100%;">{{ evaluateVolatility(detail.volatility) }}</span>
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

        <!-- 상품 상세 소개 섹션 -->
        <section class="pd-section">
          <h2 class="pd-section-title">상품 상세 소개</h2>
          <div class="info-table">
            <div class="info-row" style="flex-direction: column; align-items: flex-start; gap: 8px;">
              <span class="info-label" style="font-weight: 700;">상품 설명 및 가입 조건</span>
              <span class="info-value" style="text-align: left; white-space: pre-wrap; line-height: 1.6; font-size: 14px; width: 100%;">{{ detail.recommendReason ?? '-' }}</span>
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

        <!-- 하단 정독 후 신중한 관심 등록 안내 섹션 -->
        <section class="pd-section read-confirm-section">
          <div class="read-confirm-card">
            <h2 class="read-confirm-title">상품 안내를 모두 확인하셨나요?</h2>
            <p class="read-confirm-sub">
              위험도, 예상 금리, 주의사항까지 모두 확인하셨다면 관심 상품으로 등록해 보세요!
            </p>
            <button
              type="button"
              class="bottom-favorite-btn"
              :class="{ on: isLiked }"
              @click="toggleHeart('DETAIL_BOTTOM')"
            >
              <span class="heart-icon">{{ isLiked ? '♥' : '♡' }}</span>
              <span>{{ isLiked ? '관심 등록 완료 (클릭 시 해제)' : '이 상품 관심 등록하기' }}</span>
            </button>
          </div>
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

.top-heart-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #d1d5db;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: transform 0.15s, color 0.15s;
}
.top-heart-btn.on {
  color: #e11d48;
}
.top-heart-btn:active {
  transform: scale(1.2);
}

.read-confirm-section {
  margin-top: 24px;
}
.read-confirm-card {
  background: #fffcf0;
  border: 1.5px solid #ffe899;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
}
.read-confirm-title {
  font-size: 17px;
  font-weight: 800;
  color: #342e22;
  margin: 0 0 8px;
}
.read-confirm-sub {
  font-size: 13.5px;
  color: #6b6354;
  margin: 0 0 18px;
  line-height: 1.5;
}
.bottom-favorite-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 320px;
  min-height: 48px;
  border-radius: 12px;
  border: 1.5px solid #e5e7eb;
  background: #ffffff;
  color: #4b5563;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.bottom-favorite-btn.on {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #e11d48;
}
.bottom-favorite-btn:hover {
  border-color: #ffbb08;
}
.heart-icon {
  font-size: 18px;
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
