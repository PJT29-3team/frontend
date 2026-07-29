import { defineStore } from 'pinia';
import surveyApi from '@/api/survey';

// Mirrors SURVEY_STEP common codes; BUDGET_SUMMARY is a UI-only sub-view
// (not its own slot in the 1/5..5/5 progress bar).
export const STEP_ORDER = [
  'CURRENT_HOME',
  'PREFERENCE_PROFILE',
  'MORTGAGE',
  'RESERVE_BUDGET',
  'BUDGET_SUMMARY',
  'DESIRED_REGION',
];
export const PROGRESS_STEPS_TOTAL = 5;

export function formatKRW(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '';
  const eok = Math.floor(n / 100_000_000);
  const man = Math.round((n % 100_000_000) / 10_000);
  let out = '';
  if (eok > 0) out += `${eok}억 `;
  if (man > 0) out += `${man.toLocaleString('ko-KR')}만`;
  return out.trim() + '원';
}

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    showIntro: true,
    stepIndex: 0,
    done: false,
    loading: false,
    errorMessage: null,

    userName: '',
    surveyId: null,
    status: 'IN_PROGRESS',
    currentStepCode: 'INTRO',

    userHome: {
      roadAddress: '',
      jibunAddress: '',
      buildingName: '',
      detailAddress: '',
      postalCode: '',
      latitude: null,
      longitude: null,
      moveInDateYmd: null,
    },

    profileCode: null,
    hasMortgage: null,
    mortgageBalanceAmount: 0,

    reserveOptionCode: null,
    reserveCustomAmount: null,
    reserveAmountUsed: null,
    maxPurchaseBudgetAmount: null,

    desiredRegions: [],
  }),

  getters: {
    progressStep: (state) => Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL),
    progressPct: (state) => (Math.min(state.stepIndex + 1, PROGRESS_STEPS_TOTAL) / PROGRESS_STEPS_TOTAL) * 100,
    currentStepName: (state) => STEP_ORDER[state.stepIndex],
  },

  actions: {
    _applyResponse(data) {
      this.userName = data.userName;
      this.surveyId = data.survey?.surveyId ?? this.surveyId;
      this.status = data.survey?.status ?? this.status;
      this.currentStepCode = data.survey?.currentStepCode ?? this.currentStepCode;
      this.profileCode = data.survey?.profileCode ?? this.profileCode;
      this.hasMortgage = data.survey?.hasMortgage ?? this.hasMortgage;
      this.mortgageBalanceAmount = data.survey?.mortgageBalanceAmount ?? this.mortgageBalanceAmount;
      this.reserveOptionCode = data.survey?.reserveOptionCode ?? this.reserveOptionCode;
      this.reserveCustomAmount = data.survey?.reserveCustomAmount ?? this.reserveCustomAmount;
      this.reserveAmountUsed = data.survey?.reserveAmountUsed ?? this.reserveAmountUsed;
      this.maxPurchaseBudgetAmount = data.survey?.maxPurchaseBudgetAmount ?? this.maxPurchaseBudgetAmount;
      if (data.userHome) this.userHome = { ...this.userHome, ...data.userHome };
      this.desiredRegions = data.desiredRegions ?? [];
    },

    async init() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.start();
        this._applyResponse(data);
        // Resume mid-survey at the right screen instead of always showing step 1.
        const idx = STEP_ORDER.indexOf(this.currentStepCode);
        this.stepIndex = idx >= 0 ? idx : 0;
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '설문 정보를 불러오지 못했습니다';
      } finally {
        this.loading = false;
      }
    },

    // Used by the /survey/:surveyId route (e.g. a saved link/bookmark) to
    // jump straight into an existing survey, skipping the intro screen.
    async loadById(surveyId) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.get(surveyId);
        this._applyResponse(data);
        this.showIntro = false;
        const idx = STEP_ORDER.indexOf(this.currentStepCode);
        this.stepIndex = idx >= 0 ? idx : 0;
        this.done = this.status === 'COMPLETED';
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '설문 정보를 불러오지 못했습니다';
      } finally {
        this.loading = false;
      }
    },

    startSurvey() {
      this.showIntro = false;
    },

    async saveCurrentHome(payload) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.saveCurrentHome(this.surveyId, payload);
        this._applyResponse(data);
        this.stepIndex++;
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '주소 저장에 실패했습니다';
      } finally {
        this.loading = false;
      }
    },

    async savePreference(profileCode) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.savePreference(this.surveyId, profileCode);
        this._applyResponse(data);
        this.stepIndex++;
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '선호 유형 저장에 실패했습니다';
      } finally {
        this.loading = false;
      }
    },

    async saveMortgage(payload) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.saveMortgage(this.surveyId, payload);
        this._applyResponse(data);
        this.stepIndex++;
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '대출 정보 저장에 실패했습니다';
      } finally {
        this.loading = false;
      }
    },

    async saveReserveBudget(payload) {
      this.loading = true;
      this.errorMessage = null;
      try {
        // Backend resolves reserveAmountUsed / maxPurchaseBudgetAmount against the
        // latest completed home_analysis_snapshots row; 409 means analysis isn't ready yet.
        const data = await surveyApi.saveReserveBudget(this.surveyId, payload);
        this._applyResponse(data);
        this.stepIndex++; // -> BUDGET_SUMMARY
      } catch (err) {
        if (err?.response?.status === 409) {
          this.errorMessage = '현재집 분석이 아직 완료되지 않았어요. 잠시 후 다시 시도해주세요';
        } else {
          this.errorMessage = err?.response?.data?.message || '유보금 저장에 실패했습니다';
        }
      } finally {
        this.loading = false;
      }
    },

    advanceFromSummary() {
      this.stepIndex++; // BUDGET_SUMMARY -> DESIRED_REGION, no API call of its own
    },

    async saveDesiredRegions(regions) {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.saveDesiredRegions(this.surveyId, regions);
        this._applyResponse(data);
        this.done = true;
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '희망 지역 저장에 실패했습니다';
      } finally {
        this.loading = false;
      }
    },

    back() {
      if (this.stepIndex > 0) this.stepIndex--;
    },

    async reset() {
      this.loading = true;
      this.errorMessage = null;
      try {
        const data = await surveyApi.reset();
        this._applyResponse(data);
        this.showIntro = true;
        this.stepIndex = 0;
        this.done = false;
        this.userHome = { roadAddress: '', jibunAddress: '', buildingName: '', detailAddress: '', postalCode: '', latitude: null, longitude: null, moveInDateYmd: null };
        this.profileCode = null;
        this.hasMortgage = null;
        this.mortgageBalanceAmount = 0;
        this.reserveOptionCode = null;
        this.reserveCustomAmount = null;
        this.desiredRegions = [];
      } catch (err) {
        this.errorMessage = err?.response?.data?.message || '초기화에 실패했습니다';
      } finally {
        this.loading = false;
      }
    },
  },
});
