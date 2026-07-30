import { defineStore } from "pinia";
import surveyApi from "@/api/survey";
import { authStore } from "@/stores/authStore";
import {
  calculateBrokerageFee,
  calculateCapitalGainsTax,
} from "@/utils/housingTax";

export const STEP_ORDER = [
  "SALE_PRICE",
  "HOLDING_PERIOD",
  "TAX_SUMMARY",
  "RESERVE_BUDGET",
  "PREFERENCE_PROFILE",
  "DESIRED_REGION",
];
export const PROGRESS_STEPS_TOTAL = STEP_ORDER.length;

export function formatKRW(n) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "";
  const value = Number(n);
  if (value === 0) return "0원";
  const eok = Math.floor(value / 100_000_000);
  const man = Math.round((value % 100_000_000) / 10_000);
  let out = "";
  if (eok > 0) out += `${eok}억 `;
  if (man > 0) out += `${man.toLocaleString("ko-KR")}만`;
  return out.trim() + "원";
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

export const useSurveyStore = defineStore("survey", {
  state: () => ({
    showIntro: true,
    stepIndex: 0,
    done: false,
    loading: false,
    errorMessage: null,
    calculation: null,
    calculationFailed: false,
    fieldErrors: {},

    userName: "",

    ...emptyAnswers(),
  }),

  getters: {
    progressStep: (state) =>
      Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL),
    progressPct: (state) =>
      (Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL) /
        PROGRESS_STEPS_TOTAL) *
      100,
    currentStepName: (state) => STEP_ORDER[state.stepIndex],

    displayName: (state) =>
      state.userName || authStore.state.user?.name || "고객",

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

    netProceeds(state) {
      if (state.calculation) return state.calculation.netProceeds;
      return Math.max(
        (this.expectedSalePrice || 0) -
          this.taxResult.amount -
          this.brokerage.amount,
        0,
      );
    },

    maxPurchaseBudget(state) {
      if (state.calculation) return state.calculation.availableAsset;
      return Math.max(this.netProceeds - (this.reserveAmount || 0), 0);
    },

    weights: (state) => state.calculation?.weights ?? null,
  },

  actions: {
    init() {
      this.stepIndex = 0;
    },

    loadById() {
      this.init();
    },

    startSurvey() {
      this.showIntro = false;
      this.stepIndex = 0;
      this.done = false;
    },

    next() {
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

    async fetchCalculation() {
      this.loading = true;
      try {
        this.calculation = await surveyApi.calculate(
          toCalculationRequest(this),
        );
        this.calculationFailed = false;
      } catch (err) {
        this.calculation = null;
        this.calculationFailed = true;
        // 400이면 필드 오류를 그대로 보여준다. 그 밖에는 로컬 계산으로 조용히 넘어간다.
        const fieldErrors = err?.response?.data?.errors;
        if (err?.response?.status === 400) {
          this.errorMessage =
            err.response.data?.message || "입력값을 다시 확인해주세요";
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
      else
        this.desiredRegions.push({
          sidoName,
          sigunguName,
          eupmyeondongName: null,
        });
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
