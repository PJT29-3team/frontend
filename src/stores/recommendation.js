import { defineStore } from 'pinia';
import { formatKRW } from '@/stores/survey';

// 금액 단위 규칙: store·API·DB는 전부 원(KRW). "만원"은 입력 UI에서만 쓰고 ×10000으로 원 변환(ConditionView).

// FPR-001 금융상품 추천 조건입력 상태.
// 여유자금(이사후 차액)은 본래 PRF-008/COM-004(관심매물 비교, 조진혁 담당)에서
// 파라미터로 넘어온다. 그 화면이 아직 없어 지금은 mock 상수를 사용하며,
// 연결되면 setFundingAmount()로 주입한다.
const MOCK_FUNDING_AMOUNT = 156_500_000; // 약 1억 5650만원 (목업 기준)

// risk_tolerance 공통코드(VERY_LOW/LOW/MEDIUM) ↔ 화면 라벨/안내. grade는 명세 위험등급.
export const RISK_OPTIONS = [
  {
    code: 'VERY_LOW',
    grade: 6,
    label: '매우 낮은 위험',
    subtitle: '예금·적금 중심',
    tone: 'safe',
    helperTitle: '원금 보호를 가장 중요하게 생각할 때',
    helperBody: '예금·적금 중심으로 추천합니다. 상품마다 예금자보호 여부는 꼭 확인해주세요.',
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

// investment_period_code 공통코드(SHORT/MEDIUM/LONG) ↔ 화면 라벨.
export const PERIOD_OPTIONS = [
  { code: 'SHORT', label: '단기', desc: '1년 안에 쓸 돈' },
  { code: 'MEDIUM', label: '중기', desc: '1~3년 뒤에 쓸 돈' },
  { code: 'LONG', label: '장기', desc: '3년 뒤에도 여유 있는 돈' },
];

// 구간 시작 개월: 단기 0~ / 중기 12~ / 장기 36~. 투자금액이 시작월에 못 미치면 그 구간은 잠금.
const PERIOD_START_MONTH = { SHORT: 0, MEDIUM: 12, LONG: 36 };

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    fundingAmount: MOCK_FUNDING_AMOUNT,
    // 목업 흐름: 즉시지출(당장 쓸 돈)을 빼면 나머지가 투자금액.
    // 매달쓸돈은 인출 속도 — 찜/배분 페이지에서 "몇 달 쓸 수 있나" 계산의 입력값.
    immediateExpense: 0,
    monthlyNeed: 1_000_000, // 원. 목업 기본 100만원.
    riskLevel: 'VERY_LOW',
    periodCode: 'SHORT',
  }),

  getters: {
    // 투자금액 = 여유자금 − 즉시지출(앞으로 굴릴 계획금액).
    // ponytail: 찜 페이지에서 상품별 배분 합으로 정밀화 가능. 지금은 계획 pool로 충분.
    investAmount: (s) => Math.max(0, s.fundingAmount - s.immediateExpense),
    // 남길현금 = 여유자금 − 투자금액 (= 즉시지출).
    remainingCash: (s) => s.fundingAmount - Math.max(0, s.fundingAmount - s.immediateExpense),
    // 매달쓸돈으로 투자금액을 나눈 커버 개월수. 미입력(0)이면 제한 없음(Infinity).
    coveredMonths() {
      return this.monthlyNeed > 0 ? Math.floor(this.investAmount / this.monthlyNeed) : Infinity;
    },
    selectedRisk: (s) => RISK_OPTIONS.find((o) => o.code === s.riskLevel) ?? null,
    selectedPeriod: (s) => PERIOD_OPTIONS.find((o) => o.code === s.periodCode) ?? null,
  },

  actions: {
    setFundingAmount(amount) {
      this.fundingAmount = Number(amount) || 0;
    },
    setImmediateExpense(amount) {
      // 여유자금을 넘길 수 없음.
      this.immediateExpense = Math.min(this.fundingAmount, Math.max(0, Number(amount) || 0));
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
    // 이 구간에 자금이 닿아 찜(담기) 가능한지. 커버 개월이 구간 시작월을 넘으면 활성.
    periodActive(code) {
      return this.coveredMonths > (PERIOD_START_MONTH[code] ?? 0);
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
  },
});

export { formatKRW };
