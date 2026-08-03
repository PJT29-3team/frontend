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
  "MORTGAGE",
  "RESERVE_BUDGET",
  "PREFERENCE_PROFILE",
  "DESIRED_REGION",
];
export const PROGRESS_STEPS_TOTAL = 6;
export const CONDITION_EDIT_STEPS_TOTAL = 3;

const PROGRESS_NUMBER = {
  SALE_PRICE: 1,
  TAX_SUMMARY: 2,
  MORTGAGE: 3,
  RESERVE_BUDGET: 4,
  PREFERENCE_PROFILE: 5,
  DESIRED_REGION: 6,
};

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
    hasMortgage: null,
    mortgageBalance: null,
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
    hasMortgage: state.hasMortgage ?? false,
    mortgageBalance: state.hasMortgage ? state.mortgageBalance : null,
    requiredReserve: state.reserveAmount,
    recommendationType: state.profileCode,
  };
}

export const useSurveyStore = defineStore("survey", {
  state: () => ({
    showIntro: true,
    stepIndex: 0,
    done: false,
    conditionEditMode: false,
    loading: false,
    errorMessage: null,
    calculation: null,
    calculationFailed: false,
    fieldErrors: {},

    userName: "",

    ...emptyAnswers(),
  }),

  getters: {
    currentStepName: (state) => STEP_ORDER[state.stepIndex],
    progressStep: (state) => {
      if (state.conditionEditMode) {
        return {
          5: 1, // 페르소나
          4: 2, // 이사 후 최소 금액
          6: 3, // 희망 지역
        }[state.stepIndex] ?? null;
      }

      return PROGRESS_NUMBER[STEP_ORDER[state.stepIndex]] ?? null;
    },
    progressTotal: (state) =>
      state.conditionEditMode
        ? CONDITION_EDIT_STEPS_TOTAL
        : PROGRESS_STEPS_TOTAL,
    showProgress() {
      return this.progressStep !== null;
    },
    progressPct() {
      return ((this.progressStep ?? 0) / this.progressTotal) * 100;
    },

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

    netProceeds() {
      return Math.max(
        (this.expectedSalePrice || 0) -
          this.taxResult.amount -
          this.brokerage.amount,
        0,
      );
    },

    mortgageRepayment(state) {
      return state.hasMortgage ? state.mortgageBalance || 0 : 0;
    },

    afterMortgage() {
      return Math.max(this.netProceeds - this.mortgageRepayment, 0);
    },

    maxPurchaseBudget(state) {
      if (state.calculation) return state.calculation.availableAsset;
      return Math.max(this.afterMortgage - (this.reserveAmount || 0), 0);
    },

    weights: (state) => state.calculation?.weights ?? null,
  },

  actions: {
    init() {
      if (this.conditionEditMode) {
        this.showIntro = false;
        return;
      }

      if (this.done) {
        this.showIntro = false;
        this.stepIndex = STEP_ORDER.length - 1;
        return;
      }
      this.stepIndex = 0;
    },

    loadById() {
      this.init();
    },

    startSurvey() {
      this.showIntro = false;
      this.stepIndex = 0;
      this.done = false;
      this.conditionEditMode = false;
    },

    startConditionEdit() {
      // 기존 주택·세금 정보는 유지하고, 추천 조건만 다시 입력합니다.
      this.showIntro = false;
      this.stepIndex = 5;
      this.done = false;
      this.conditionEditMode = true;
      this.errorMessage = null;
      this.fieldErrors = {};
      this.calculation = null;
      this.calculationFailed = false;
    },

    next() {
      this.errorMessage = null;
      if (this.conditionEditMode) {
        const nextConditionStep = {
          5: 4,
          4: 6,
        }[this.stepIndex];

        if (nextConditionStep !== undefined) {
          this.stepIndex = nextConditionStep;
        }
        return;
      }

      if (this.stepIndex < STEP_ORDER.length - 1) this.stepIndex += 1;
    },

    back() {
      this.errorMessage = null;
      if (this.conditionEditMode) {
        const previousConditionStep = {
          4: 5,
          6: 4,
        }[this.stepIndex];

        if (previousConditionStep !== undefined) {
          this.stepIndex = previousConditionStep;
        } else {
          this.showIntro = true;
          this.conditionEditMode = false;
        }
        return;
      }

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

    async saveMortgage({ hasMortgage, mortgageBalance }) {
      this.hasMortgage = hasMortgage;
      this.mortgageBalance = hasMortgage ? mortgageBalance : null;
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
      this.conditionEditMode = false;
      this.calculation = null;
      this.calculationFailed = false;
      this.fieldErrors = {};
    },
  },
});
