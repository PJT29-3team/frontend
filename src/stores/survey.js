import { defineStore } from 'pinia';
import surveyApi from '@/api/survey';
import { authStore } from '@/stores/authStore';
import { calculateBrokerageFee, calculateCapitalGainsTax } from '@/utils/housingTax';

// 피그마 기준 6단계. 진행바는 1/6 ~ 6/6으로 표기한다.
export const STEP_ORDER = [
  'SALE_PRICE',
  'HOLDING_PERIOD',
  'TAX_SUMMARY',
  'RESERVE_BUDGET',
  'PREFERENCE_PROFILE',
  'DESIRED_REGION',
];
export const PROGRESS_STEPS_TOTAL = STEP_ORDER.length;

export function formatKRW(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '';
  const value = Number(n);
  if (value === 0) return '0원';
  const eok = Math.floor(value / 100_000_000);
  const man = Math.round((value % 100_000_000) / 10_000);
  let out = '';
  if (eok > 0) out += `${eok}억 `;
  if (man > 0) out += `${man.toLocaleString('ko-KR')}만`;
  return out.trim() + '원';
}

function emptyAnswers() {
  return {
    purchasePrice: null,
    expectedSalePrice: null,
    holdingYears: null,
    residenceYears: null,
    isRegulatedArea: null,
    reserveAmount: null,
    profileCode: null,
    desiredRegions: [],
  };
}

/**
 * Pinia 상태를 백엔드 SurveyCalculationRequest 형태로 옮긴다.
 * 필드명이 달라(취득가액/양도가액 등 명세 용어) 여기서 한 번만 매핑한다.
 *
 * 피그마 흐름에는 대출 단계가 없어 hasMortgage는 항상 false로 보낸다.
 * (docs/survey.md는 대출 항목을 정의하지만 승인된 화면 흐름에서 빠졌다.)
 */
export function toCalculationRequest(state) {
  return {
    acquisitionPrice: state.purchasePrice,
    transferPrice: state.expectedSalePrice,
    holdingYears: state.holdingYears,
    residenceYears: state.residenceYears,
    regulatedArea: state.isRegulatedArea,
    hasMortgage: false,
    mortgageBalance: null,
    requiredReserve: state.reserveAmount,
    recommendationType: state.profileCode,
  };
}

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    showIntro: true,
    stepIndex: 0,
    done: false,
    loading: false,
    errorMessage: null,
    /** POST /api/survey/calculate 응답. 마지막 단계에서 받아오며, 받으면 화면의 확정값이 된다. */
    calculation: null,
    /** 확정 계산을 받지 못해 로컬 계산값을 쓰고 있는지 */
    calculationFailed: false,
    /** 백엔드 Bean Validation이 돌려준 필드별 오류 */
    fieldErrors: {},

    /** 로그인 응답에서 온 이름. 없으면 displayName이 authStore로 보완한다. */
    userName: '',

    ...emptyAnswers(),
  }),

  getters: {
    progressStep: (state) => Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL),
    progressPct: (state) =>
      (Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL) / PROGRESS_STEPS_TOTAL) * 100,
    currentStepName: (state) => STEP_ORDER[state.stepIndex],

    // 인트로 문구가 " 님에게"로 깨지지 않도록 로그인 사용자 이름으로 보완한다.
    displayName: (state) => state.userName || authStore.state.user?.name || '고객',

    // 3단계 미리보기는 네트워크 없이 즉시 그려야 해서 로컬 계산기를 쓴다.
    // 마지막 단계에서 백엔드 응답을 받으면 그쪽이 확정값이 된다.
    // utils/housingTax.js와 백엔드 HousingTaxCalculator는 같은 기준값으로 테스트가 묶여 있다.
    taxResult(state) {
      if (state.calculation) return state.calculation.capitalGainsTax;
      return calculateCapitalGainsTax({
        purchasePrice: state.purchasePrice,
        salePrice: state.expectedSalePrice,
        holdingYears: state.holdingYears,
        residenceYears: state.residenceYears,
        isRegulatedArea: state.isRegulatedArea,
      });
    },

    brokerage(state) {
      if (state.calculation) return state.calculation.brokerageFee;
      return calculateBrokerageFee(state.expectedSalePrice);
    },

    /** 매도 실수령액 = 희망 매도가 - 양도세 - 중개수수료 */
    netProceeds(state) {
      if (state.calculation) return state.calculation.netProceeds;
      return Math.max(
        (this.expectedSalePrice || 0) - this.taxResult.amount - this.brokerage.amount,
        0,
      );
    },

    /** 새 집에 쓸 수 있는 최대 예산 = 실수령액 - 이사 후 남길 금액 */
    maxPurchaseBudget(state) {
      if (state.calculation) return state.calculation.availableAsset;
      return Math.max(this.netProceeds - (this.reserveAmount || 0), 0);
    },

    /** 추천 가중치. 백엔드만 산출하므로 계산 응답을 받기 전에는 null이다. */
    weights: (state) => state.calculation?.weights ?? null,
  },

  actions: {
    init() {
      // 답변은 마지막 단계에서 한 번에 보내므로(CLAUDE.md) 시작 시 서버를 부르지 않는다.
      // 사용자 이름은 displayName 게터가 로그인 정보에서 가져온다.
      this.stepIndex = 0;
    },

    /**
     * /survey/:surveyId 로 들어온 경우(저장한 링크·북마크) 이어보기.
     *
     * 설문 영속화 API(GET /surveys/{id})가 아직 없어 복원할 답변이 없으므로
     * 인트로부터 다시 시작한다. 백엔드가 생기면 여기서 불러와 stepIndex를 맞추면 된다.
     */
    loadById() {
      this.init();
    },

    startSurvey() {
      this.showIntro = false;
      this.stepIndex = 0;
      this.done = false;
    },

    next() {
      // 이전 단계에서 남은 오류 문구가 다음 화면까지 따라오지 않게 한다.
      this.errorMessage = null;
      if (this.stepIndex < STEP_ORDER.length - 1) this.stepIndex += 1;
    },

    back() {
      this.errorMessage = null;
      if (this.stepIndex > 0) this.stepIndex -= 1;
      else this.showIntro = true;
    },

    async saveSalePrice({ purchasePrice, expectedSalePrice }) {
      this.purchasePrice = purchasePrice;
      this.expectedSalePrice = expectedSalePrice;
      this.next();
    },

    async saveHoldingPeriod({ holdingYears, residenceYears, isRegulatedArea }) {
      this.holdingYears = holdingYears;
      this.residenceYears = residenceYears;
      this.isRegulatedArea = isRegulatedArea;
      this.next();
    },

    // 3단계는 계산 결과만 보여주므로 저장할 값이 없다.
    advanceFromTaxSummary() {
      this.next();
    },

    async saveReserveBudget({ reserveAmount }) {
      this.reserveAmount = reserveAmount;
      this.next();
    },

    async savePreference(profileCode) {
      this.profileCode = profileCode;
      this.next();
    },

    async saveDesiredRegions(regions) {
      this.desiredRegions = regions;
      this.done = true;
    },

    /**
     * 마지막 단계: 모아둔 답변 전체를 백엔드로 보내 확정 계산 결과를 받는다.
     * (CLAUDE.md — "전체 설문 결과는 Pinia 스토어에 임시 저장한 후 마지막 단계에서 백엔드로 전송한다")
     *
     * 실패해도 로컬 계산값으로 결과 화면을 그릴 수 있으므로 완료 처리는 되돌리지 않는다.
     */
    async fetchCalculation() {
      this.loading = true;
      try {
        this.calculation = await surveyApi.calculate(toCalculationRequest(this));
        this.calculationFailed = false;
      } catch (err) {
        this.calculation = null;
        this.calculationFailed = true;
        // 400이면 필드 오류를 그대로 보여준다. 그 밖에는 로컬 계산으로 조용히 넘어간다.
        const fieldErrors = err?.response?.data?.errors;
        if (err?.response?.status === 400) {
          this.errorMessage =
            err.response.data?.message || '입력값을 다시 확인해주세요';
          this.fieldErrors = fieldErrors || {};
        }
      } finally {
        this.loading = false;
      }
      return this.calculation;
    },

    /** 6단계 제출: 희망 지역 저장 + 확정 계산 요청을 함께 수행한다. */
    async submitSurvey(regions) {
      await this.saveDesiredRegions(regions);
      await this.fetchCalculation();
    },

    toggleRegion(sidoName, sigunguName) {
      const idx = this.desiredRegions.findIndex(
        (r) => r.sidoName === sidoName && r.sigunguName === sigunguName,
      );
      if (idx >= 0) this.desiredRegions.splice(idx, 1);
      else this.desiredRegions.push({ sidoName, sigunguName, eupmyeondongName: null });
    },

    isRegionSelected(sidoName, sigunguName) {
      return this.desiredRegions.some(
        (r) => r.sidoName === sidoName && r.sigunguName === sigunguName,
      );
    },

    async reset() {
      Object.assign(this, emptyAnswers());
      this.showIntro = true;
      this.stepIndex = 0;
      this.done = false;
      this.calculation = null;
      this.calculationFailed = false;
      this.fieldErrors = {};
    },
  },
});
