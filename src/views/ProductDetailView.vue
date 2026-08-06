<script setup>
import { ref, onMounted, computed } from 'vue';
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

let enterTime = Date.now();
const isLiked = ref(false);

function checkIsFavorited() {
  return Object.values(rec.favorites).some((v) => v && v.productType === productType);
}

function toggleHeart(loc) {
  const dwellTimeSec = Math.max(0, Math.floor((Date.now() - enterTime) / 1000));
  
  // 추천 스토어 찜 상태 연동
  if (detail.value) {
    const periodCode = termCodeOf(detail.value.termMonths || 0);
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

function termCodeOf(months) {
  if (months < 12) return 'SHORT';
  if (months < 36) return 'MEDIUM';
  return 'LONG';
}

function termText(months) {
  const m = months || 0;
  if (m < 12) return `단기 · ${m}개월`;
  if (m < 36) return `중기 · ${m}개월`;
  return `장기 · ${m}개월`;
}

function riskBadge(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.label ?? code;
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

// 계산값 (4열 주요 수치 바용)
const totalInvest = computed(() => rec.investAmount || 8_100_000);

const monthlyPayEstimate = computed(() => {
  const t = detail.value?.termMonths || 12;
  return Math.round(totalInvest.value / t);
});

const estimatedInterest = computed(() => {
  const rate = Number(detail.value?.maxInterestRate || detail.value?.rate || 3.8);
  const t = detail.value?.termMonths || 12;
  return Math.round((totalInvest.value * (rate / 100) * t) / 12);
});

const estimatedMaturityTotal = computed(() => {
  return totalInvest.value + estimatedInterest.value;
});

onMounted(async () => {
  enterTime = Date.now();
  try {
    let cached = rec.getCachedDetail(kind, productType);
    if (cached) {
      detail.value = cached;
    } else {
      const res = await recommendationApi.getProductDetail(productType, kind);
      detail.value = res;
      rec.setCachedDetail(kind, productType, res);
    }
    isLiked.value = checkIsFavorited();

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
      <!-- 1. 헤더 바 (뒤로가기 & 상단 관심 상품 담기) -->
      <header class="pd-top-bar">
        <button type="button" class="btn-back" @click="goBack" aria-label="뒤로가기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <button
          type="button"
          class="btn-top-favorite"
          :class="{ on: isLiked }"
          @click="toggleHeart('DETAIL_TOP')"
        >
          <span class="heart-symbol">{{ isLiked ? '♥' : '♡' }}</span>
          <span>{{ isLiked ? '관심 상품 담김' : '관심 상품 담기' }}</span>
        </button>
      </header>

      <!-- 로딩 및 에러 -->
      <div v-if="loading" class="pd-state">상세 정보를 불러오는 중입니다...</div>
      <div v-else-if="error" class="pd-state error">{{ error }}</div>

      <!-- 2. 본문 내용 -->
      <main v-else-if="detail" class="pd-body">

        <!-- 2-1. 상단 안내 배너 (원금 손실 경고 OR 예적금 안내) -->
        <div v-if="detail.lossRisk === 'Y'" class="banner-risk">
          <div class="banner-icon-wrap risk">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="banner-text">
            <strong>원금 손실 가능 상품입니다</strong>
            <p>수익률이 오를 수도 있지만 투자한 금액보다 적게 돌려받을 수 있습니다. 아래 내용을 먼저 확인해 주세요.</p>
          </div>
        </div>

        <div v-else class="banner-info">
          <div class="banner-icon-wrap info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="banner-text">
            <strong>{{ detail.category === 'SAVINGS' ? '매월 나누어 납입하는 상품' : '만기 시 이자를 한 번에 수령하는 예금 상품' }}</strong>
            <p>목표 금액을 가입 기간에 맞춰 나누어 납입하고 만기에 원금과 이자를 받는 방식입니다.</p>
          </div>
        </div>

        <!-- 2-2. 상품 헤더 정보 (로고, 상품명, 태그, 우측 등급/금리 박스) -->
        <section class="sec-product-header">
          <div class="ph-main-info">
            <div class="logo-circle">{{ logoText(detail.institution) }}</div>
            <div class="ph-titles">
              <span class="inst-name">{{ detail.institution }}</span>
              <h2 class="prod-name">{{ detail.name }}</h2>
              <div class="badge-group">
                <span class="badge-tag">{{ riskBadge(detail.safetyLevel) }}</span>
                <span class="badge-tag">{{ termText(detail.termMonths).split(' · ')[0] }}</span>
                <span class="badge-tag">{{ getCategoryLabel(detail.category) }}</span>
              </div>
            </div>
          </div>

          <div class="ph-side-box">
            <span class="side-label">{{ detail.kind === 'stock' ? '금융상품 위험 등급' : '최고금리' }}</span>
            <strong :class="['side-val', detail.kind === 'stock' ? 'risk-val' : 'rate-val']">
              {{ detail.kind === 'stock' ? riskBadge(detail.safetyLevel) : (detail.maxInterestRate || detail.rate) + '%' }}
            </strong>
          </div>
        </section>

        <!-- 2-3. 4열 주요 핵심 지표 바 (다크 그레이 배경) -->
        <section class="sec-metrics-bar">
          <template v-if="detail.kind === 'stock'">
            <div class="metric-col">
              <span class="m-label">현재 추천 투자금</span>
              <strong class="m-val">{{ formatKRW(totalInvest) }}</strong>
            </div>
            <div class="metric-col">
              <span class="m-label">최근 3년 연환산 수익률</span>
              <strong class="m-val highlight">{{ Number(detail.returnRate || detail.rate || 5.8).toFixed(1) }}%</strong>
              <small class="m-sub">과거 수익률은 미래 수익을 보장하지 않습니다.</small>
            </div>
            <div class="metric-col">
              <span class="m-label">권장 투자 기간</span>
              <strong class="m-val">{{ termText(detail.termMonths) }}</strong>
            </div>
            <div class="metric-col">
              <span class="m-label">자금 회수</span>
              <strong class="m-val">환매 신청 후 입금</strong>
            </div>
          </template>

          <template v-else>
            <div class="metric-col">
              <span class="m-label">총 납입 예정액</span>
              <strong class="m-val">{{ formatKRW(totalInvest) }}</strong>
            </div>
            <div class="metric-col">
              <span class="m-label">월 납입 예시</span>
              <strong class="m-val">{{ formatKRW(monthlyPayEstimate) }}</strong>
            </div>
            <div class="metric-col">
              <span class="m-label">예상 세전 이자</span>
              <strong class="m-val highlight">약 {{ formatKRW(estimatedInterest) }}</strong>
            </div>
            <div class="metric-col">
              <span class="m-label">예상 만기 수령액</span>
              <strong class="m-val">약 {{ formatKRW(estimatedMaturityTotal) }}</strong>
            </div>
          </template>
        </section>
        <p v-if="detail.kind !== 'stock'" class="metrics-note">
          ⓘ 최고금리가 유지된다고 가정한 단순 계산 예시이며 실제 이자는 납입일, 납입 횟수와 우대조건에 따라 달라질 수 있습니다.
        </p>

        <!-- 2-4. 가입/투자 전에 꼭 확인하세요 (2x2 그리드) -->
        <section class="sec-check-grid">
          <h3 class="sec-heading">{{ detail.kind === 'stock' ? '투자 전에 꼭 확인하세요' : '가입 전에 확인하세요' }}</h3>
          <p class="sec-sub">예금·적금과 다른 점을 쉬운 문장으로 정리했습니다.</p>

          <div class="check-grid-container">
            <template v-if="detail.kind === 'stock'">
              <div class="grid-item">
                <div class="grid-icon">⚠️</div>
                <div class="grid-body">
                  <strong>원금 손실 가능</strong>
                  <p>시장 상황이 나빠지면 투자한 금액보다 적게 돌려받을 수 있습니다.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">🛡️</div>
                <div class="grid-body">
                  <strong>예금자보호 대상이 아닙니다</strong>
                  <p>은행 예금처럼 일정 금액까지 보호되는 상품이 아닙니다.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">📈</div>
                <div class="grid-body">
                  <strong>가격이 계속 변합니다</strong>
                  <p>금리, 채권 가격과 시장 상황에 따라 매월 가격이 달라질 수 있습니다.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">💳</div>
                <div class="grid-body">
                  <strong>비용을 확인해주세요</strong>
                  <p>거래 수수료와 상품 보수는 수익에서 빠질 수 있으므로 확인해야 합니다.</p>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="grid-item">
                <div class="grid-icon">🎯</div>
                <div class="grid-body">
                  <strong>우대조건 확인</strong>
                  <p>최고금리는 우대조건을 충족해야 적용될 수 있습니다.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">📅</div>
                <div class="grid-body">
                  <strong>중도해지 주의</strong>
                  <p>납입을 중단하거나 만기 전에 해지하면 적용 금리가 달라질 수 있습니다.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">🛡️</div>
                <div class="grid-body">
                  <strong>보호 여부 확인</strong>
                  <p>예금자보호 대상 여부와 보호 한도는 가입 전에 확인해주세요.</p>
                </div>
              </div>
              <div class="grid-item">
                <div class="grid-icon">🧾</div>
                <div class="grid-body">
                  <strong>세금 미반영</strong>
                  <p>화면의 예상 이자는 세금을 제외하기 전 금액입니다.</p>
                </div>
              </div>
            </template>
          </div>
        </section>

        <!-- 2-5. 환매 / 납입 방식 안내 (노란 박스 + 3열 요약) -->
        <section class="sec-process-box">
          <h3 class="sec-heading">
            {{ detail.kind === 'stock' ? (getCategoryLabel(detail.category) + '는 이렇게 환매합니다') : (getCategoryLabel(detail.category) + '은 이렇게 납입합니다') }}
          </h3>
          <p class="sec-sub">상품 종류에 따라 거래와 현금화 방법이 다릅니다.</p>

          <div class="process-alert-card">
            <div class="alert-bank-icon">🏛️</div>
            <div class="alert-text">
              <strong>{{ detail.kind === 'stock' ? '환매 신청 후 며칠 뒤 현금이 입금되는 상품' : '전체 금액을 매월 나누어 납입' }}</strong>
              <p>{{ detail.kind === 'stock' ? '펀드는 거래소에서 바로 파는 상품이 아닙니다. 판매사를 통해 환매 신청을 하고 입금일까지 기다려야 합니다.' : '가입 기간 동안 정해진 금액을 나누어 납입하는 예시입니다. 자유적금은 실제 납입 금액과 날짜에 따라 이자가 달라집니다.' }}</p>
            </div>
          </div>

          <div class="process-summary-table">
            <div class="table-col">
              <span class="t-label">{{ detail.kind === 'stock' ? '가입·환매 방법' : '기본금리' }}</span>
              <strong class="t-val">{{ detail.kind === 'stock' ? '판매사를 통해 가입 및 환매 신청' : (detail.interestRate || '3.2') + '%' }}</strong>
            </div>
            <div class="table-col">
              <span class="t-label">{{ detail.kind === 'stock' ? '현금화 시점' : '최고금리' }}</span>
              <strong class="t-val">{{ detail.kind === 'stock' ? '환매 신청 후 며칠 뒤 입금' : (detail.maxInterestRate || '3.8') + '%' }}</strong>
            </div>
            <div class="table-col">
              <span class="t-label">{{ detail.kind === 'stock' ? '비용' : '가입 기간' }}</span>
              <strong class="t-val">{{ detail.kind === 'stock' ? '운용보수와 판매보수 확인' : (detail.termMonths || 12) + '개월' }}</strong>
            </div>
          </div>
        </section>

        <!-- 2-6. 이 상품이 추천된 이유 -->
        <section class="sec-recommend-reason">
          <h3 class="sec-heading">이 상품이 추천된 이유</h3>
          <div class="reason-content">
            <span class="reason-icon">✨</span>
            <p>{{ detail.recommendReason || '선택하신 주거 자금 계획 및 위험 선호도에 맞춰 안정적인 수익률을 제공하는 최적의 상품입니다.' }}</p>
          </div>
        </section>

        <!-- 2-7. 하단 정독 후 신중한 관심 등록 안내 섹션 (유저 요청 유지) -->
        <section class="sec-read-confirm">
          <div class="confirm-card">
            <h3 class="confirm-title">상품 안내를 모두 확인하셨나요?</h3>
            <p class="confirm-sub">위험도, 수익률/금리, 환매 조건까지 확인하셨다면 관심 상품으로 등록해 보세요!</p>
            <button
              type="button"
              class="btn-bottom-favorite"
              :class="{ on: isLiked }"
              @click="toggleHeart('DETAIL_BOTTOM')"
            >
              <span class="h-icon">{{ isLiked ? '♥' : '♡' }}</span>
              <span>{{ isLiked ? '관심 상품 등록 완료 (클릭 시 해제)' : '이 상품 관심 등록하기' }}</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  </div>
</template>

<style scoped>
.product-detail-page {
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: #2b2823;
  background: #f7f6f3;
  min-height: 100vh;
  padding: 32px 16px 80px;
}

.pd-shell {
  max-width: 860px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid #ebe8e1;
}

/* 1. 헤더 바 */
.pd-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 28px;
  background: #ffffff;
  border-bottom: 1px solid #f0ede6;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #e0dcd5;
  background: #ffffff;
  color: #444039;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-back:hover {
  background: #f5f3ee;
}

.btn-top-favorite {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  border-radius: 999px;
  border: none;
  background: #ffcc00;
  color: #383226;
  font-size: 14.5px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  box-shadow: 0 4px 10px rgba(255, 204, 0, 0.25);
}
.btn-top-favorite:hover {
  background: #ffbb08;
  transform: translateY(-1px);
}
.btn-top-favorite.on {
  background: #e11d48;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(225, 29, 72, 0.25);
}
.heart-symbol {
  font-size: 16px;
}

/* 상태 메시지 */
.pd-state {
  text-align: center;
  padding: 80px 20px;
  color: #8c867a;
  font-size: 16px;
}
.pd-state.error {
  color: #d93838;
}

/* 2. 본문 */
.pd-body {
  padding: 32px 36px 48px;
}

/* 2-1. 안내 배너 */
.banner-risk {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 12px;
  background: #fdf3f2;
  border: 1px solid #f8c8c5;
  border-left: 5px solid #e04438;
  margin-bottom: 32px;
}
.banner-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 12px;
  background: #fffcf0;
  border: 1px solid #fde79a;
  border-left: 5px solid #eab308;
  margin-bottom: 32px;
}
.banner-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}
.banner-icon-wrap.risk { background: #fbe0de; color: #d93838; }
.banner-icon-wrap.info { background: #fef0b8; color: #a16207; }
.banner-text strong { display: block; font-size: 16px; color: #221f1a; margin-bottom: 4px; }
.banner-text p { margin: 0; font-size: 13.5px; color: #666157; line-height: 1.5; }

/* 2-2. 상품 헤더 */
.sec-product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 28px;
  border-bottom: 1px solid #f0ede6;
  margin-bottom: 28px;
}
.ph-main-info {
  display: flex;
  align-items: center;
  gap: 20px;
}
.logo-circle {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: #545047;
  color: #ffffff;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inst-name { font-size: 13px; color: #888277; display: block; margin-bottom: 4px; }
.prod-name { font-size: 23px; font-weight: 800; color: #221f1a; margin: 0 0 10px; }
.badge-group { display: flex; gap: 6px; }
.badge-tag {
  padding: 4px 10px;
  border-radius: 6px;
  background: #f2efe9;
  color: #5c574d;
  font-size: 12px;
  font-weight: 600;
}

.ph-side-box {
  min-width: 150px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid #e3dec;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.02);
}
.side-label { font-size: 12px; color: #8c867a; display: block; margin-bottom: 6px; }
.side-val { font-size: 22px; font-weight: 800; }
.side-val.risk-val { color: #d93838; }
.side-val.rate-val { color: #221f1a; }

/* 2-3. 4열 지표 바 */
.sec-metrics-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #4a4740;
  border-radius: 12px;
  padding: 24px 16px;
  color: #ffffff;
  margin-bottom: 10px;
}
.metric-col {
  padding: 0 16px;
  border-right: 1px solid #635f56;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metric-col:last-child { border-right: none; }
.m-label { font-size: 12.5px; color: #c4bfb5; margin-bottom: 8px; display: block; }
.m-val { font-size: 21px; font-weight: 800; color: #ffffff; }
.m-val.highlight { color: #ffcc00; }
.m-sub { font-size: 11px; color: #a6a094; margin-top: 6px; display: block; }
.metrics-note { font-size: 12px; color: #8c867a; margin: 0 0 32px; line-height: 1.5; }

/* 섹션 공통 타이틀 */
.sec-heading { font-size: 19px; font-weight: 800; color: #221f1a; margin: 0 0 6px; }
.sec-sub { font-size: 13.5px; color: #787267; margin: 0 0 20px; }

/* 2-4. 2x2 그리드 */
.sec-check-grid { margin-top: 36px; padding-bottom: 32px; border-bottom: 1px solid #f0ede6; }
.check-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.grid-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #ebe8e1;
  background: #faf9f6;
}
.grid-icon { font-size: 22px; flex-shrink: 0; }
.grid-body strong { font-size: 15px; color: #221f1a; display: block; margin-bottom: 4px; }
.grid-body p { margin: 0; font-size: 13px; color: #666157; line-height: 1.5; }

/* 2-5. 환매/납입 방식 */
.sec-process-box { margin-top: 36px; padding-bottom: 32px; border-bottom: 1px solid #f0ede6; }
.process-alert-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  background: #fffcf0;
  border: 1px solid #fde79a;
  margin-bottom: 20px;
}
.alert-bank-icon { font-size: 28px; }
.alert-text strong { font-size: 16px; color: #221f1a; display: block; margin-bottom: 6px; }
.alert-text p { margin: 0; font-size: 13.5px; color: #666157; line-height: 1.55; }

.process-summary-table {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #ebe8e1;
  border-radius: 12px;
  overflow: hidden;
}
.table-col {
  padding: 18px 20px;
  background: #faf9f6;
  border-right: 1px solid #ebe8e1;
}
.table-col:last-child { border-right: none; }
.t-label { font-size: 12px; color: #8c867a; display: block; margin-bottom: 6px; }
.t-val { font-size: 14.5px; color: #221f1a; font-weight: 700; }

/* 2-6. 추천 이유 */
.sec-recommend-reason { margin-top: 36px; padding-bottom: 32px; border-bottom: 1px solid #f0ede6; }
.reason-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px;
  border-radius: 12px;
  background: #f7f5f0;
}
.reason-icon { font-size: 20px; }
.reason-content p { margin: 0; font-size: 14.5px; color: #3a362e; line-height: 1.6; font-weight: 600; }

/* 2-7. 하단 정독 관심등록 카카오스타일 */
.sec-read-confirm { margin-top: 36px; }
.confirm-card {
  background: #fffcf0;
  border: 1.5px solid #ffe58f;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
}
.confirm-title { font-size: 18px; font-weight: 800; color: #221f1a; margin: 0 0 8px; }
.confirm-sub { font-size: 14px; color: #666157; margin: 0 0 22px; }
.btn-bottom-favorite {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: 340px;
  min-height: 52px;
  border-radius: 12px;
  border: 1.5px solid #e0dcd5;
  background: #ffffff;
  color: #444039;
  font-size: 15.5px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.04);
}
.btn-bottom-favorite.on {
  background: #e11d48;
  border-color: #e11d48;
  color: #ffffff;
}
.btn-bottom-favorite:hover {
  border-color: #ffbb08;
}
.h-icon { font-size: 18px; }

@media (max-width: 768px) {
  .sec-metrics-bar, .check-grid-container, .process-summary-table {
    grid-template-columns: 1fr;
  }
  .metric-col, .table-col {
    border-right: none;
    border-bottom: 1px solid #635f56;
    padding: 14px 0;
  }
  .sec-product-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
