<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useRecommendationStore, RISK_OPTIONS, formatKRW } from '@/stores/recommendation';
import '@/styles/survey-tokens.css';

const router = useRouter();
const rec = useRecommendationStore();

// 스크롤 스파이: 상단 구간 버튼 ↔ 현재 보이는 구간 동기화
const activeCode = ref('SHORT');
const sectionEls = {};
function setSectionRef(code, el) {
  if (el) sectionEls[code] = el;
}
function scrollTo(code) {
  activeCode.value = code; // 클릭 즉시 활성화 표시
  sectionEls[code]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// sticky nav 아래 기준선(px)을 지나친 마지막 구간을 활성으로 판단
const ACTIVE_LINE = 120;
function updateActive() {
  let current = PERIODS[0].code;
  for (const p of PERIODS) {
    const el = sectionEls[p.code];
    if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) current = p.code;
  }
  // 페이지 최하단이면 마지막 구간 강제 활성
  // (마지막 구간은 기준선까지 스크롤이 안 올라와 계산에서 누락되기 때문)
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) current = PERIODS[PERIODS.length - 1].code;
  activeCode.value = current;
}
onMounted(() => {
  updateActive();
  window.addEventListener('scroll', updateActive, { passive: true });
  window.addEventListener('resize', updateActive, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateActive);
  window.removeEventListener('resize', updateActive);
});

// ⚠️ 목데이터: 새 설계(안전도 필터 제거·기간 구간별·만기 상품만)에 맞춘 화면 우선 구현.
//   백엔드 추천 API가 "기간 구간별 조회"로 바뀌면 이 배열을 API 응답으로 교체한다.
//   각 구간의 3번째 상품(popular=true)에 "비슷한 자산 인기" 태그를 단다.
//   kind: 'deposit' 예금 / 'savings' 적금 / 'bond_etf' 만기매칭 채권ETF
const PERIODS = reactive([
  {
    code: 'SHORT',
    label: '1년 미만',
    hint: '예치기간 12개월 미만',
    products: [
      { institution: 'NH농협은행', name: 'NH 올원 정기예금', kind: 'deposit', safetyLevel: 'VERY_LOW', rate: 3.5, termMonths: 6, reason: '6개월 만기로 자금이 오래 묶이지 않아 단기 목적에 잘 맞습니다.' },
      { institution: '케이뱅크', name: '코드K 정기예금', kind: 'deposit', safetyLevel: 'VERY_LOW', rate: 3.55, termMonths: 6, reason: '가입이 간편하고 6개월 단기 예치에 적합합니다.' },
      { institution: '카카오뱅크', name: '카카오뱅크 정기예금', kind: 'deposit', safetyLevel: 'VERY_LOW', rate: 3.6, termMonths: 6, reason: '안정적인 금리로 단기 자금을 굴리기 좋습니다.', popular: true },
    ],
  },
  {
    code: 'MEDIUM',
    label: '1~3년',
    hint: '예치기간 12~36개월',
    products: [
      { institution: 'KB국민은행', name: 'KB 든든 자유적금', kind: 'savings', safetyLevel: 'VERY_LOW', rate: 3.8, termMonths: 12, reason: '매월 자유롭게 납입할 수 있어 정착 자금 관리가 편합니다.' },
      { institution: '우리은행', name: '우리 첫거래우대 예금', kind: 'deposit', safetyLevel: 'VERY_LOW', rate: 3.45, termMonths: 24, reason: '2년 예치로 단기보다 높은 금리를 안정적으로 받습니다.' },
      { institution: '토스뱅크', name: '토스뱅크 자유적금', kind: 'savings', safetyLevel: 'VERY_LOW', rate: 4.0, termMonths: 12, reason: '우대조건 충족 시 높은 금리를 받을 수 있는 자유적금입니다.', popular: true },
    ],
  },
  {
    code: 'LONG',
    label: '3년 이상',
    hint: '예치기간 36개월 이상',
    products: [
      { institution: '신한은행', name: '신한 쏠편한 정기예금', kind: 'deposit', safetyLevel: 'VERY_LOW', rate: 3.55, termMonths: 36, reason: '3년 이상 여유자금을 안정적으로 묶어두기 좋습니다.' },
      { institution: '미래에셋자산운용', name: 'TIGER 25-11 국공채만기매칭', kind: 'bond_etf', safetyLevel: 'LOW', rate: 3.9, termMonths: 48, reason: '만기가 정해진 국공채 ETF로 예금처럼 만기까지 보유하기 좋습니다.' },
      { institution: '삼성자산운용', name: 'KODEX 25-12 은행채만기매칭', kind: 'bond_etf', safetyLevel: 'LOW', rate: 4.1, termMonths: 48, reason: '만기매칭형 채권 ETF로 만기 보유 시 안정적인 이자를 기대합니다.', popular: true },
    ],
  },
]);

const KIND_LABEL = { deposit: '예금', savings: '적금', bond_etf: '만기 채권ETF' };

function riskBadge(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.label ?? code;
}
function riskTone(code) {
  return RISK_OPTIONS.find((o) => o.code === code)?.tone ?? 'safe';
}
function logoText(name) {
  return (name || '').replace(/\s/g, '').slice(0, 2);
}
function maturityText(p) {
  const y = Math.floor(p.termMonths / 12);
  const m = p.termMonths % 12;
  const dur = [y ? `${y}년` : '', m ? `${m}개월` : ''].filter(Boolean).join(' ');
  return p.kind === 'bond_etf' ? `만기 약 ${dur} 뒤` : `${dur} 뒤 만기`;
}

function goFavorites() {
  router.push('/recommendation/favorites');
}
</script>

<template>
  <div class="result-page">
    <div class="result-shell">
      <!-- 헤더 -->
      <header class="r-head">
        <div class="r-head-left">
          <h1 class="r-title">기간별 추천 금융상품</h1>
          <p class="r-sub">
            투자 금액 <b>{{ formatKRW(rec.investAmount) }}</b>을 언제 쓸 돈인지에 따라
            <b>1년 미만 · 1~3년 · 3년 이상</b>으로 나눠 담았어요.
            구간마다 마음에 드는 상품을 관심에 담아보세요.
          </p>
          <p class="r-note">
            위험도는 상품을 거르지 않고 <b>태그로만</b> 알려드려요. 만기가 있는 상품만 보여드립니다.
          </p>
        </div>
        <div class="r-stats">
          <div class="stat">
            <span class="stat-label">투자 금액</span>
            <strong class="stat-value invest">{{ formatKRW(rec.investAmount) }}</strong>
          </div>
          <div class="stat">
            <span class="stat-label">남길 현금</span>
            <strong class="stat-value">{{ formatKRW(rec.remainingCash) }}</strong>
          </div>
        </div>
      </header>

      <!-- 구간 이동 버튼 (스크롤 스파이) -->
      <nav class="period-nav" aria-label="기간 구간 이동">
        <button
          v-for="period in PERIODS"
          :key="period.code"
          type="button"
          class="pnav-btn"
          :class="{ on: activeCode === period.code }"
          @click="scrollTo(period.code)"
        >
          {{ period.label }}
        </button>
      </nav>

      <!-- 기간 구간별 3줄 -->
      <section
        v-for="period in PERIODS"
        :key="period.code"
        :ref="(el) => setSectionRef(period.code, el)"
        :data-code="period.code"
        class="period-block"
      >
        <div class="period-head">
          <div class="period-title-wrap">
            <h2 class="period-title">{{ period.label }}</h2>
            <span class="period-hint">{{ period.hint }}</span>
          </div>
        </div>

        <div class="card-grid">
          <article
            v-for="(p, i) in period.products"
            :key="i"
            class="p-card"
            :class="{ 'is-popular': p.popular }"
          >
            <div class="p-badges">
              <span class="badge badge-risk" :class="'tone-' + riskTone(p.safetyLevel)">
                {{ riskBadge(p.safetyLevel) }}
              </span>
              <span class="badge">{{ KIND_LABEL[p.kind] }}</span>
              <span v-if="p.popular" class="badge badge-popular">비슷한 자산 인기</span>
            </div>
            <div class="p-head">
              <span class="p-logo">{{ logoText(p.institution) }}</span>
              <div>
                <span class="p-inst">{{ p.institution }}</span>
                <strong class="p-name">{{ p.name }}</strong>
              </div>
            </div>
            <div class="p-rate">
              금리 연 <b>{{ p.rate.toFixed(2) }}%</b>
            </div>
            <div class="p-maturity">
              예치기간 {{ p.termMonths }}개월 · {{ maturityText(p) }}
            </div>
            <p class="p-reason">💬 {{ p.reason }}</p>
            <div class="p-actions">
              <button class="p-info-btn" type="button">상품 정보 보기</button>
              <button class="p-heart" type="button" aria-label="관심 등록">♡</button>
            </div>
          </article>
        </div>
      </section>

      <div class="next-row">
        <button class="primary-btn cta" type="button" @click="goFavorites">
          담은 상품으로 비율 정하기 →
        </button>
      </div>
    </div>

    <footer class="rec-footer">
      <div class="footer-inner">
        <div class="footer-col">
          <h4>투자 및 예금 관련 안내</h4>
          <ul>
            <li>이 서비스에서 제공하는 정보는 참고용이며, 투자의 최종 결정과 그 결과에 대한 책임은 이용자 본인에게 있습니다.</li>
            <li>금융상품 가입 전 반드시 상품설명서와 약관을 확인하시기 바랍니다.</li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>원금손실 가능성 / 예금자보호 안내</h4>
          <ul>
            <li>예금자보호가 되지 않는 상품(채권 ETF 등)은 원금 손실이 발생할 수 있습니다.</li>
            <li>예금자보호 대상 상품은 「예금자보호법」에 따라 1인당 최고 5천만원까지 보호됩니다.</li>
          </ul>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.result-page {
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}
.result-shell {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 20px 40px;
}

/* 헤더 */
.r-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 28px;
}
.r-title { font-weight: 800; font-size: 24px; margin: 0 0 8px; }
.r-sub { color: var(--text-muted); font-size: 14px; margin: 0 0 8px; max-width: 560px; line-height: 1.6; }
.r-sub b { color: var(--text-dark); }
.r-note { font-size: 12.5px; color: var(--text-muted); margin: 0; }
.r-note b { color: var(--text-dark); }
.r-stats {
  display: flex;
  gap: 32px;
  border-left: 3px solid var(--kb-yellow);
  padding: 4px 0 4px 24px;
  white-space: nowrap;
}
.stat-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.stat-value { font-size: 22px; }
.stat-value.invest { color: var(--kb-yellow-deep); }

/* 구간 이동 버튼 (sticky) */
.period-nav {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  gap: 8px;
  padding: 12px 0;
  margin-bottom: 6px;
  background: #fff;
  border-bottom: 1px solid var(--card-border);
  box-shadow: 0 6px 12px -8px rgba(0, 0, 0, 0.18);
}
.pnav-btn {
  padding: 9px 22px;
  border-radius: 999px;
  border: 1.5px solid var(--card-border);
  background: #fff;
  font-weight: 700;
  font-size: 14px;
  color: var(--text-muted);
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.pnav-btn.on {
  background: var(--text-dark);
  border-color: var(--text-dark);
  color: #fff;
}

/* 기간 구간 */
.period-block { margin-bottom: 30px; scroll-margin-top: 74px; }
.period-head { margin-bottom: 14px; }
.period-title-wrap { display: flex; align-items: baseline; gap: 12px; }
.period-title {
  font-weight: 800;
  font-size: 20px;
  margin: 0;
  padding-left: 12px;
  border-left: 5px solid var(--kb-yellow);
  line-height: 1.15;
}
.period-hint { font-size: 13px; color: var(--text-muted); }

/* 카드 그리드 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.p-card {
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background: #fff;
  padding: 18px 18px 16px;
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}
.p-card.is-popular { border-color: var(--kb-yellow); box-shadow: 0 8px 22px rgba(227, 165, 0, 0.14); }
.p-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.badge {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 6px;
  background: #f3f1ec;
  color: var(--text-muted);
}
.badge-risk.tone-safe { background: #e6f4ea; color: #2d7a44; }
.badge-risk.tone-caution { background: #fff4e0; color: #b5760a; }
.badge-risk.tone-warn { background: #fdecea; color: #c0442e; }
.badge-popular { background: var(--kb-yellow-deep); color: #fff; }
.p-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.p-logo {
  width: 40px; height: 40px; flex: none;
  border-radius: 10px;
  background: #3f3a34; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 800;
}
.p-inst { display: block; font-size: 11.5px; color: var(--text-muted); }
.p-name { font-size: 15.5px; font-weight: 800; }
.p-rate { font-size: 14px; color: var(--text-muted); }
.p-rate b { color: var(--kb-yellow-deep); font-size: 18px; font-weight: 800; }
.p-maturity { font-size: 12.5px; color: var(--text-muted); margin-top: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--card-border); }
.p-reason { font-size: 12.5px; color: var(--text-muted); line-height: 1.5; margin: 12px 0 14px; flex: 1; }
.p-actions { display: flex; gap: 8px; align-items: center; }
.p-info-btn {
  flex: 1;
  padding: 11px;
  border: 1.5px solid var(--card-border);
  border-radius: 10px;
  background: #fff;
  font-weight: 700;
  font-size: 13.5px;
  cursor: pointer;
}
.p-heart {
  width: 42px; height: 42px; flex: none;
  border: 1.5px solid var(--card-border);
  border-radius: 10px;
  background: #fff;
  font-size: 17px;
  cursor: pointer;
}

.next-row { display: flex; justify-content: flex-end; margin-top: 10px; }
.cta { width: auto; min-width: 260px; margin: 0; padding: 15px 30px; }

/* 푸터 */
.rec-footer { background: #46413a; color: #cdc7bc; margin-top: 36px; }
.footer-inner {
  max-width: 1140px; margin: 0 auto; padding: 30px 32px 36px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 40px;
}
.footer-col h4 { color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 8px; }
.footer-col ul { margin: 0; padding-left: 16px; }
.footer-col li { font-size: 12.5px; line-height: 1.7; color: #b7b1a6; }

@media (max-width: 760px) {
  .r-head { flex-direction: column; }
  .r-stats { border-left: none; padding-left: 0; }
  .card-grid { grid-template-columns: 1fr; }
  .footer-inner { grid-template-columns: 1fr; gap: 18px; }
  .cta { width: 100%; }
}
</style>
