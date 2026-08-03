import { defineStore } from "pinia";
import surveyApi from "@/api/survey";
import * as authApi from "@/api/authApi";
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

export function toSubmitRequest(state) {
  return {
    answers: toCalculationRequest(state),
    desiredRegions: state.desiredRegions.map((region) => ({
      sidoName: region.sidoName,
      sigunguName: region.sigunguName,
      eupmyeondongName: region.eupmyeondongName ?? null,
    })),
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
    surveyId: null,

    userName: "",

    ...emptyAnswers(),
  }),

  getters: {
    currentStepName: (state) => STEP_ORDER[state.stepIndex],
    progressStep: (state) =>
      PROGRESS_NUMBER[STEP_ORDER[state.stepIndex]] ?? null,
    showProgress() {
      return this.progressStep !== null;
    },
    progressPct() {
      return ((this.progressStep ?? 0) / PROGRESS_STEPS_TOTAL) * 100;
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

    recommendationQuery(state) {
      return {
        budget: this.maxPurchaseBudget,
        type: state.profileCode,
        regions: state.desiredRegions.map((r) => ({
          sidoName: r.sidoName,
          sigunguName: r.sigunguName,
        })),
      };
    },
  },

  actions: {
    init() {
      this.stepIndex = 0;
    },

    loadById() {
      this.init();
    },

    /**
     * 인트로 인사말에 쓸 이름을 채운다.
     * authStore는 토큰만 sessionStorage에 남기므로 새로고침하면 user가 비어 있다.
     */
    async loadUserName() {
      if (this.userName) return this.userName;
      if (!authStore.state.accessToken) {
        console.warn("[survey] 토큰이 없어 이름을 조회하지 않는다");
        return "";
      }

      const cached = authStore.state.user?.name;
      if (cached) {
        this.userName = cached;
        return cached;
      }

      try {
        const me = await authApi.getMe();
        this.userName = me?.name ?? "";
        authStore.setSession(authStore.state.accessToken, me);
      } catch (err) {
        // 이름을 못 받아도 설문은 진행돼야 한다. displayName이 "고객"으로 떨어진다.
        console.warn(
          "[survey] 이름 조회 실패",
          err?.response?.status ?? "(응답 없음 - CORS/네트워크)",
          err?.response?.data ?? err?.message,
        );
      }
      return this.userName;
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
        if (authStore.state.accessToken && this.desiredRegions.length > 0) {
          const saved = await surveyApi.submit(toSubmitRequest(this));
          this.surveyId = saved.surveyId;
          this.calculation = saved.calculation;
        } else {
          this.surveyId = null;
          this.calculation = await surveyApi.calculate(
            toCalculationRequest(this),
          );
        }
        this.calculationFailed = false;
      } catch (err) {
        this.calculation = null;
        this.calculationFailed = true;
        const fieldErrors = err?.response?.data?.errors;
        if (err?.response?.status === 400) {
          this.errorMessage =
            err.response.data?.message || "입력값을 다시 확인해주세요";
          this.fieldErrors = Object.fromEntries(
            Object.entries(fieldErrors || {}).map(([key, message]) => [
              key.replace(/^answers\./, ""),
              message,
            ]),
          );
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
      this.calculation = null;
      this.calculationFailed = false;
      this.fieldErrors = {};
      this.surveyId = null;
    },
  },
});
