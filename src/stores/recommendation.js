import { defineStore } from 'pinia';
import { formatKRW } from '@/stores/survey';

// 금액 단위 규칙: store·API·DB는 전부 원(KRW). "만원"은 입력 UI에서만 쓰고 ×10000으로 원 변환(ConditionView).

// FPR-001 금융상품 추천 조건입력 상태.
// 여유자금(이사후 차액)은 본래 PRF-008/COM-004(관심매물 비교, 조진혁 담당)에서
// 파라미터로 넘어온다. 그 화면이 아직 없어 지금은 mock 상수를 사용하며,
// 연결되면 setFundingAmount()로 주입한다.
const MOCK_FUNDING_AMOUNT = 0; // 관심매물 페이지에서 setFundingAmount()로 주입. 미연결 시 0.

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

// investment_period_code 4개 구간 ↔ 화면 라벨.
export const PERIOD_OPTIONS = [
  { code: 'UNDER_12M', label: '1~11개월', desc: '1년 미만 단기자금' },
  { code: 'Y1_TO_2', label: '12~23개월', desc: '1년 이상 2년 미만' },
  { code: 'Y2_TO_3', label: '24~35개월', desc: '2년 이상 3년 미만' },
  { code: 'OVER_36M', label: '36개월 이상', desc: '3년 이상 장기자금' },
];


export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    fundingAmount: MOCK_FUNDING_AMOUNT,
    // 목업 흐름: 이사후 남은 돈 + 추가 합칠 돈 − 즉시지출 = 실제 굴릴 투자금액.
    additionalDeposit: 0, // 원. 추가로 굴릴 돈(+)
    immediateExpense: 0, // 원. 당장 쓸 긴급 돈(-)
    monthlyNeed: 1_000_000, // 원. 목업 기본 100만원 (매달 꺼내 쓸 생활비).
    riskLevel: 'VERY_LOW',
    periodCode: 'UNDER_12M',
    // 찜: 4개 기간 구간(UNDER_12M/Y1_TO_2/Y2_TO_3/OVER_36M)당 상품 1개 슬롯 -> 최대 4개 보장.
    favorites: { UNDER_12M: null, Y1_TO_2: null, Y2_TO_3: null, OVER_36M: null },
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
      // 우리 웹 매우 낮은 위험 4개 구간 최저 예금 금리 (1~11m: 2.0%, 12~23m: 2.5%, 24~35m: 2.8%, 36m+: 3.0%)
      const weightedRate = 0.25 * 0.020 + 0.25 * 0.025 * 1.5 + 0.25 * 0.028 * 2.5 + 0.25 * 0.030 * 3.5;
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
    // 빈 기간을 제외한 나머지 구간 모두 선택했으면 OK
    isAllSelected(s) {
      return Object.entries(s.favorites).every(
        ([code, val]) => val !== null || s.emptyPeriods.includes(code)
      );
    },
  },

  actions: {
    setFundingAmount(amount) {
      this.fundingAmount = Number(amount) || 0;
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
      if (cur && cur.productType === product.productType) {
        this.favorites[periodCode] = null;
      } else {
        const rawRate = Number(product?.rate) || 0;
        const afterTaxRate = Number((rawRate * 0.846).toFixed(2));
        this.favorites[periodCode] = {
          ...product,
          afterTaxRate,
        };
      }
    },
    isFavorited(periodCode, productType) {
      return this.favorites[periodCode]?.productType === productType;
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
