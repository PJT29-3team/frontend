import { defineStore } from 'pinia';
import { formatKRW } from '@/stores/survey';

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

export const RATIO_MIN = 2;
export const RATIO_MAX = 30;

export const useRecommendationStore = defineStore('recommendation', {
  state: () => ({
    fundingAmount: MOCK_FUNDING_AMOUNT,
    // 명세 디폴트: 안전도=매우낮은위험, 기간=단기. 비율은 2~30% 중 15%(목업).
    ratioPercent: 15,
    riskLevel: 'VERY_LOW',
    periodCode: 'SHORT',
  }),

  getters: {
    // 투자금액 = 여유자금 × 비율(%). 결과화면 "추천 투자금"과 동일 계산.
    investAmount: (s) => Math.round((s.fundingAmount * s.ratioPercent) / 100),
    remainingCash(s) {
      return s.fundingAmount - Math.round((s.fundingAmount * s.ratioPercent) / 100);
    },
    selectedRisk: (s) => RISK_OPTIONS.find((o) => o.code === s.riskLevel) ?? null,
    selectedPeriod: (s) => PERIOD_OPTIONS.find((o) => o.code === s.periodCode) ?? null,
  },

  actions: {
    setFundingAmount(amount) {
      this.fundingAmount = Number(amount) || 0;
    },
    setRatio(percent) {
      const n = Math.round(Number(percent));
      this.ratioPercent = Math.min(RATIO_MAX, Math.max(RATIO_MIN, Number.isNaN(n) ? RATIO_MIN : n));
    },
    setRisk(code) {
      if (RISK_OPTIONS.some((o) => o.code === code)) this.riskLevel = code;
    },
    setPeriod(code) {
      if (PERIOD_OPTIONS.some((o) => o.code === code)) this.periodCode = code;
    },
    // financial_investment_profiles로 upsert될 조건 페이로드.
    conditionPayload() {
      return {
        ratioPercent: this.ratioPercent,
        riskLevel: this.riskLevel,
        periodCode: this.periodCode,
      };
    },
  },
});

export { formatKRW };
