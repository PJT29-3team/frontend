import { defineStore } from 'pinia';
import { formatKRW } from '@/stores/survey';
import recommendationApi from '@/api/recommendation';
import { fetchFavoriteProducts } from '@/api/financeApi';
import { PERIOD_OPTIONS } from '@/utils/finance/portfolioAllocation';

export { PERIOD_OPTIONS };

// 금액 단위 규칙: store·API·DB는 전부 원(KRW). "만원"은 입력 UI에서만 쓰고 ×10000으로 원 변환(ConditionView).

// FPR-001 금융상품 추천 조건입력 상태.
// 여유자금(이사후 차액)은 PRF-008/COM-004(관심매물 비교)에서 넘어온다.
// favorite/MainView.vue가 매물 선택 시 setFundingAmount()로 주입한다.
// 그 화면을 거치지 않고 직접 들어오면 0이며, 0이면 각 화면이 안내를 띄운다.

// 세후 금리(afterTaxRate)는 서버가 세전 금리에서 계산해 내려준다(백엔드 finance/domain/Tax.java).
// 프론트에서 다시 계산하지 않는다 — 세율이 두 곳에 있으면 언젠가 어긋난다.

// risk_tolerance 공통코드(VERY_LOW/LOW/MEDIUM) ↔ 화면 라벨/안내. grade는 명세 위험등급.
export const RISK_OPTIONS = [
  {
    code: 'VERY_LOW',
    grade: 6,
    label: '매우 낮은 위험',
    subtitle: '예금·CMA 중심',
    tone: 'safe',
    helperTitle: '원금 보호를 가장 중요하게 생각할 때',
    helperBody: '예금·CMA 중심으로 추천합니다. 상품마다 예금자보호 여부는 꼭 확인해주세요.',
  },
  {
    code: 'LOW',
    grade: 5,
    label: '낮은 위험',
    subtitle: '단기채·채권형 중심',
    tone: 'caution',
    helperTitle: '가격이 조금 움직일 수 있어요',
    helperBody:
      '채권과 ETF는 예금이 아니므로 원금 손실 가능성이 있습니다. 손실 폭을 낮추는 상품 위주로 보여드립니다.',
  },
  {
    code: 'MEDIUM',
    grade: 4,
    label: '보통 위험',
    subtitle: '수익과 변동성 고려',
    tone: 'warn',
    helperTitle: '수익 기회와 함께 손실 가능성도 커져요',
    helperBody:
      '시장 상황에 따라 원금 손실이 생길 수 있습니다. 3년 안에 꼭 써야 하는 돈이라면 신중하게 선택해주세요.',
  },
];

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    fundingAmount: 0,
    // 이사후 남은 돈 + 추가 합칠 돈 − 즉시지출 = 실제 굴릴 투자금액.
    additionalDeposit: 0, // 원. 추가로 굴릴 돈(+)
    immediateExpense: 0, // 원. 당장 쓸 긴급 돈(-)
    monthlyNeed: 1_000_000, // 원. 기본 100만원 (매달 꺼내 쓸 생활비). ConditionView에서 조정한다.
    riskLevel: 'VERY_LOW',
    periodCode: PERIOD_OPTIONS[0].code,
    // 찜: PERIOD_OPTIONS의 기간 구간당 상품 1개 슬롯. 구간 정의는 portfolioAllocation.js가 단일 소스다.
    favorites: Object.fromEntries(PERIOD_OPTIONS.map((o) => [o.code, null])),
    // 추천 결과에서 상품이 0개인 기간 코드 배열 (해당 기간은 선택 불필요)
    emptyPeriods: [],
    // 상품 상세정보 캐시: key = `${kind}:${productType}`, value = ProductDetailResponse
    productDetailCache: {},
  }),

  getters: {
    // 투자금액 = 여유자금 + 추가합칠돈 − 즉시지출.
    investAmount: (s) => Math.max(0, s.fundingAmount + (s.additionalDeposit || 0) - (s.immediateExpense || 0)),
    // 남길현금 = 즉시지출.
    remainingCash: (s) => s.immediateExpense,
    // 매달 꺼내 쓸 생활비 기반 우리 웹 4개 만기 최저 금리 벤치마크 버팀 연산.
    runwayAnalysis() {
      const inv = this.investAmount || 0;
      const monthly = this.monthlyNeed || 0;
      if (monthly <= 0 || inv <= 0) {
        return { cashMonths: 0, appMonths: 0, diffMonths: 0, cashYearsText: '0개월', appYearsText: '0개월', diffText: '0개월' };
      }
      const cashMonths = Math.floor(inv / monthly);
      // 4개 구간에 균등 배분했다고 보고 단리로 불린다. 뒤에 곱하는 값은 구간 중앙값 연수
      // (1~11m→0.5년, 12~23m→1.5년, 24~35m→2.5년, 36m+→3.5년).
      // ponytail: 금리는 매우 낮은 위험 구간 최저 예금 기준으로 박아둔 값. 실측이 필요하면 추천 API에서 받아와라.
      const weightedRate =
        0.25 * 0.020 * 0.5 + 0.25 * 0.025 * 1.5 + 0.25 * 0.028 * 2.5 + 0.25 * 0.030 * 3.5;
      const totalGrowth = inv * (1 + weightedRate);
      const appMonths = Math.floor(totalGrowth / monthly);
      const diffMonths = Math.max(0, appMonths - cashMonths);

      const formatYm = (m) => {
        const y = Math.floor(m / 12);
        const rem = m % 12;
        if (y > 0 && rem > 0) return `${y}년 ${rem}개월`;
        if (y > 0) return `${y}년`;
        return `${rem}개월`;
      };

      return {
        cashMonths,
        appMonths,
        diffMonths,
        cashYearsText: formatYm(cashMonths),
        appYearsText: formatYm(appMonths),
        diffText: formatYm(diffMonths),
      };
    },
    // 매달쓸돈으로 투자금액을 나눈 커버 개월수. 미입력(0)이면 제한 없음(Infinity).
    coveredMonths() {
      return this.monthlyNeed > 0 ? Math.floor(this.investAmount / this.monthlyNeed) : Infinity;
    },
    selectedRisk: (s) => RISK_OPTIONS.find((o) => o.code === s.riskLevel) ?? null,
    selectedPeriod: (s) => PERIOD_OPTIONS.find((o) => o.code === s.periodCode) ?? null,
    // 찜한 상품 목록(빈 슬롯 제외) + 개수 + 선택 가능 구간수 + 전체 선택 여부.
    favoriteList: (s) => Object.values(s.favorites).filter(Boolean),
    favoriteCount: (s) => Object.values(s.favorites).filter(Boolean).length,
    // 상품이 존재하는(선택 가능한) 기간 수
    selectablePeriodCount: (s) => {
      const allCodes = Object.keys(s.favorites);
      return allCodes.filter((code) => !s.emptyPeriods.includes(code)).length;
    },
    // 빈 기간을 제외한 나머지 구간 모두 선택했으면 OK.
    // 전 구간이 비어 있으면(선택 가능 구간 0) 담은 게 없으므로 통과시키지 않는다.
    isAllSelected(s) {
      if (this.selectablePeriodCount === 0) return false;
      return Object.entries(s.favorites).every(
        ([code, val]) => val !== null || s.emptyPeriods.includes(code)
      );
    },
  },

  actions: {
    setFundingAmount(amount) {
      this.fundingAmount = Number(amount) || 0;
    },
    /**
     * 이 스토어는 메모리에만 있어서 새로고침이나 /summary 직접 진입이면 비어 있다.
     * 그때 서버에 저장된 마지막 조건으로 되살린다. 이미 값이 있으면 건드리지 않는다.
     * @returns {Promise<boolean>} 되살릴 조건이 있었는지
     */
    async restoreLatest() {
      if (this.investAmount > 0) return true;
      const pref = await recommendationApi.getLatestPreference();
      if (!pref) return false;
      // 서버는 투자금액(= 여유자금 - 즉시지출)만 갖고 있다. 여유자금을 역산해 넣으면
      // investAmount 게터가 저장 당시와 같은 값을 돌려준다.
      const immediate = Number(pref.immediateExpense) || 0;
      this.immediateExpense = immediate;
      this.additionalDeposit = 0;
      this.fundingAmount = (Number(pref.investAmount) || 0) + immediate;
      this.monthlyNeed = Number(pref.monthlyNeed) || 0;
      if (pref.safetyLevel) this.setRisk(pref.safetyLevel);
      return true;
    },
    setAdditionalDeposit(amount) {
      this.additionalDeposit = Math.max(0, Number(amount) || 0);
    },
    setImmediateExpense(amount) {
      this.immediateExpense = Math.max(0, Number(amount) || 0);
    },
    setMonthlyNeed(amount) {
      this.monthlyNeed = Math.max(0, Number(amount) || 0);
    },
    setRisk(code) {
      if (RISK_OPTIONS.some((o) => o.code === code)) this.riskLevel = code;
    },
    setPeriod(code) {
      if (PERIOD_OPTIONS.some((o) => o.code === code)) this.periodCode = code;
    },
    // 이 상품을 담을 수 있는지. 커버 개월이 상품 예치기간 이상이면(만기까지 돈이 버팀) 활성.
    // 같은 구간이어도 예치기간이 다르면 상품별로 판정된다.
    productActive(termMonths) {
      return this.coveredMonths >= (Number(termMonths) || 0);
    },
    // 찜 토글: 같은 구간에서 다른 상품을 누르면 교체, 같은 상품을 다시 누르면 해제.
    toggleFavorite(periodCode, product) {
      const cur = this.favorites[periodCode];
      // 추천 응답이 세후 금리를 이미 달고 오므로 상품을 그대로 담는다.
      this.favorites[periodCode] =
        cur && cur.productType === product.productType ? null : product;
    },
    isFavorited(periodCode, productType) {
      return this.favorites[periodCode]?.productType === productType;
    },
    /**
     * 서버에 저장된 찜을 되살린다. 찜은 "다음"을 눌러야 저장되므로, 그 전에
     * 새로고침하면 하트가 전부 풀린다.
     *
     * 저장된 쪽에는 상품코드만 있고 금리·추천사유는 없다. 그래서 방금 받은
     * 추천 목록에서 같은 코드를 찾아 그 상품 객체를 그대로 담는다. 하트를
     * 눌렀을 때와 완전히 같은 모양이 된다.
     *
     * @param periods 추천 응답의 기간 구간 배열
     * @returns {Promise<number>} 되살린 개수
     */
    async restoreFavorites(periods) {
      if (this.favoriteCount > 0) return this.favoriteCount; // 이 세션에서 이미 고른 게 있으면 둔다
      let saved;
      try {
        saved = await fetchFavoriteProducts();
      } catch {
        return 0; // 못 불러와도 화면은 그대로 쓴다
      }
      const savedTypes = new Set((saved ?? []).map((f) => f.productType).filter(Boolean));
      if (!savedTypes.size) return 0;

      let restored = 0;
      for (const period of periods ?? []) {
        const hit = (period.products ?? []).find((p) => savedTypes.has(p.productType));
        if (hit) {
          this.favorites[period.code] = hit;
          restored += 1;
        }
      }
      return restored;
    },
    // financial_product_preference로 저장될 조건 페이로드.
    conditionPayload() {
      return {
        investAmount: this.investAmount,
        immediateExpense: this.immediateExpense,
        monthlyNeed: this.monthlyNeed,
        riskLevel: this.riskLevel,
      };
    },
    // 추천 결과에서 상품이 없는 기간 코드 저장
    setEmptyPeriods(codes) {
      this.emptyPeriods = codes || [];
    },
    // 상세정보 캐시 조회 및 저장.
    getCachedDetail(kind, productType) {
      const key = `${kind}:${productType}`;
      return this.productDetailCache[key] || null;
    },
    setCachedDetail(kind, productType, detail) {
      const key = `${kind}:${productType}`;
      this.productDetailCache[key] = detail;
    },
  },
});

export { formatKRW };
