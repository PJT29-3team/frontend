<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSurveyStore, PROGRESS_STEPS_TOTAL, formatKRW } from '@/stores/survey';
import '@/styles/survey-tokens.css';

const props = defineProps({
  surveyId: { type: String, default: null },
});

const router = useRouter();
const survey = useSurveyStore();

onMounted(() => {
  // /survey/:surveyId (bookmarked link) resumes that exact survey;
  // /survey (no param) starts or resumes the user's current in-progress one.
  if (props.surveyId) {
    survey.loadById(props.surveyId);
  } else {
    survey.init();
  }
});

// Keep the URL's :surveyId in sync with the store — covers first load
// (no id in URL yet) and reset (a fresh survey id replaces the old one).
watch(
  () => survey.surveyId,
  (id) => {
    if (id && String(id) !== router.currentRoute.value.params.surveyId) {
      router.replace({ name: 'survey-resume', params: { surveyId: String(id) } });
    }
  }
);

const STEP_NAMES = ['current-home', 'preference', 'mortgage', 'reserve', 'summary', 'region'];
const currentStepName = computed(() => STEP_NAMES[survey.stepIndex]);

/* ---------- Step 1: 현재 주소 (user_homes) ---------- */
const addressQuery = ref('');
// Stand-in for a road-address search API (e.g. Kakao/Juso). Swap for a real lookup.
const addressCandidates = [
  { roadAddress: '역삼로 215, 역삼래미안아파트', buildingName: '역삼래미안아파트', jibunAddress: '서울 강남구 역삼동' },
  { roadAddress: '대치동 998, 래미안 대치팰리스', buildingName: '래미안 대치팰리스', jibunAddress: '서울특별시 강남구 대치동 998' },
];
const selectedAddress = ref(null);
function submitCurrentHome() {
  if (!selectedAddress.value) return;
  survey.saveCurrentHome({ ...selectedAddress.value });
}

/* ---------- Step 2: 선호 유형 (housing_preference_profiles) ---------- */
const PROFILES = [
  { profileCode: 'SAFETY_FIRST', icon: '🛡️', title: '다치지 않고 안전하게 지내고 싶어요', cardDescription: '계단·문턱이 적고, 병원이 가깝고, 동네가 안전했으면 해요' },
  { profileCode: 'CONVENIENCE_FIRST', icon: '🛒', title: '혼자서도 편하게 지내고 싶어요', cardDescription: '장보기·산책·대중교통·은행이 가까웠으면 해요' },
  { profileCode: 'VALUE_STABILITY', icon: '💰', title: '주거비 부담을 줄이고 싶어요', cardDescription: '관리비가 적고, 나중에 팔기 쉬운 집이면 좋겠어요' },
  { profileCode: 'BALANCED', icon: '⚖️', title: '골고루 균형 있게 보고 싶어요', cardDescription: '안전·편의·비용이 균형있는 집이면 좋겠어요' },
];
function submitPreference() {
  if (!survey.profileCode) return;
  survey.savePreference(survey.profileCode);
}

/* ---------- Step 3: 담보대출 확인 ---------- */
function addMortgageChip(v) {
  survey.mortgageBalanceAmount = (survey.mortgageBalanceAmount || 0) + v;
}
const canSubmitMortgage = computed(() => survey.hasMortgage !== null);
function submitMortgage() {
  if (!canSubmitMortgage.value) return;
  survey.saveMortgage({
    hasMortgage: survey.hasMortgage,
    mortgageBalanceAmount: survey.hasMortgage ? survey.mortgageBalanceAmount : 0,
  });
}

/* ---------- Step 4: 유보금 설정 ---------- */
const RESERVE_TIERS = [
  { code: 'AT_MOST_100M', label: '1억 이하' },
  { code: 'FROM_100M_TO_200M', label: '1억 ~ 2억' },
  { code: 'FROM_200M_TO_300M', label: '2억 ~ 3억' },
  { code: 'AT_LEAST_300M', label: '3억 이상' },
];
const isCustomReserve = computed(() => survey.reserveOptionCode === 'CUSTOM');
function pickReserveTier(code) {
  survey.reserveOptionCode = code;
  if (code !== 'CUSTOM') survey.reserveCustomAmount = null;
}
const canSubmitReserve = computed(
  () => survey.reserveOptionCode && (!isCustomReserve.value || survey.reserveCustomAmount)
);
function submitReserveBudget() {
  if (!canSubmitReserve.value) return;
  survey.saveReserveBudget({
    reserveOptionCode: survey.reserveOptionCode,
    reserveCustomAmount: isCustomReserve.value ? survey.reserveCustomAmount : null,
  });
}

/* ---------- 예산 요약 (home_analysis_snapshots 기반, 백엔드 계산값 표시만) ---------- */
// netProceeds isn't returned directly, but maxPurchaseBudgetAmount = netProceeds - reserveAmountUsed, so it's derivable.
const netProceeds = computed(() => (survey.maxPurchaseBudgetAmount ?? 0) + (survey.reserveAmountUsed ?? 0));
const mortgagePaid = computed(() => (survey.hasMortgage ? survey.mortgageBalanceAmount || 0 : 0));

/* ---------- Step 5: 희망 지역 (survey_desired_regions) ---------- */
const SIDO_LIST = ['서울', '경기도'];
const GU_BY_SIDO = { 서울: ['강남구', '강동구', '강북구', '강서구', '관악구'], 경기도: ['수원시', '성남시', '고양시'] };
const DONG_COUNTS = {
  강남구: [
    { name: '개포동', count: 0 }, { name: '논현동', count: 1 }, { name: '대치동', count: 0 },
    { name: '도곡동', count: 0 }, { name: '삼성동', count: 0 },
  ],
};
const sido = ref('서울');
const gu = ref('강남구');
const guList = computed(() => GU_BY_SIDO[sido.value] || []);
const dongList = computed(() => DONG_COUNTS[gu.value] || []);
function toggleDong(dongName) {
  const list = survey.desiredRegions;
  const idx = list.findIndex((r) => r.eupmyeondongName === dongName && r.sigunguName === gu.value);
  if (idx >= 0) list.splice(idx, 1);
  else list.push({ sidoName: sido.value, sigunguName: gu.value, eupmyeondongName: dongName });
}
function isDongSelected(dongName) {
  return survey.desiredRegions.some((r) => r.eupmyeondongName === dongName && r.sigunguName === gu.value);
}
function wholeGuSelected() {
  return survey.desiredRegions.some((r) => r.sigunguName === gu.value && !r.eupmyeondongName);
}
function pickWholeGu() {
  survey.desiredRegions = survey.desiredRegions.filter((r) => r.sigunguName !== gu.value);
  survey.desiredRegions.push({ sidoName: sido.value, sigunguName: gu.value, eupmyeondongName: null });
}
function submitDesiredRegions() {
  survey.saveDesiredRegions(survey.desiredRegions);
}
</script>

<template>
  <div class="survey-shell">
    <div class="survey-card">
      <!-- 인트로: 로그인한 사용자 이름 표시 -->
      <div v-if="survey.showIntro" class="intro-wrap">
        <div class="intro-icon">🏠</div>
        <h2 class="intro-heading">{{ survey.userName }} 님에게<br />꼭 맞는 집을 추천해드릴게요</h2>
        <p class="intro-sub">천천히 답해주셔도 괜찮아요, 1분이면 충분해요</p>
        <button class="intro-start-btn" :disabled="survey.loading" @click="survey.startSurvey">설문 시작하기</button>
      </div>

      <template v-else>
        <!-- 진행바 / 뒤로가기 / 처음부터 -->
        <div class="top-row">
          <button class="back-btn" :disabled="survey.stepIndex === 0" aria-label="이전 단계" @click="survey.back">‹</button>
          <div class="progress-track"><div class="progress-fill" :style="{ width: survey.progressPct + '%' }"></div></div>
          <div class="progress-frac">{{ survey.progressStep }} / {{ PROGRESS_STEPS_TOTAL }}</div>
          <button class="reset-link" :disabled="survey.loading" @click="survey.reset">↺ 처음부터</button>
        </div>

        <div v-if="survey.done" class="text-center py-5">
          <h2 class="step-title">설문이 완료됐어요</h2>
          <p class="step-desc">입력하신 내용을 바탕으로 맞춤 주택을 찾아볼게요</p>
          <button class="primary-btn" @click="survey.reset">다시 설문하기</button>
        </div>

        <!-- 1. 현재 주소 -->
        <template v-else-if="currentStepName === 'current-home'">
          <h2 class="step-title">지금 살고 계신 집,<br />주소가 어떻게 되시나요?</h2>
          <p class="step-desc">도로명 주소로 검색해주세요</p>
          <input v-model="addressQuery" class="addr-input" placeholder="예: 서울시 강남구 역삼로 215" />
          <div
            v-for="c in addressCandidates" :key="c.roadAddress" class="recent-item"
            :class="{ selected: selectedAddress?.roadAddress === c.roadAddress }"
            role="button" tabindex="0" @click="selectedAddress = c" @keyup.enter="selectedAddress = c"
          >
            <div>
              <div class="addr-name">{{ c.buildingName }}</div>
              <div class="addr-sub">{{ c.jibunAddress }}</div>
            </div>
            <div class="check-dot" :class="{ on: selectedAddress?.roadAddress === c.roadAddress }">✓</div>
          </div>
          <p v-if="survey.errorMessage" class="text-danger small mt-2">{{ survey.errorMessage }}</p>
          <button class="primary-btn" :disabled="!selectedAddress || survey.loading" @click="submitCurrentHome">다음</button>
        </template>

        <!-- 2. 선호 유형 -->
        <template v-else-if="currentStepName === 'preference'">
          <h2 class="step-title">새로 살 집,<br />무엇이 가장 마음 쓰이세요?</h2>
          <button
            v-for="p in PROFILES" :key="p.profileCode" class="pref-card"
            :class="{ selected: survey.profileCode === p.profileCode }" @click="survey.profileCode = p.profileCode"
          >
            <div class="pref-icon">{{ p.icon }}</div>
            <div class="flex-grow-1">
              <div class="pref-title">{{ p.title }}</div>
              <div class="pref-desc">{{ p.cardDescription }}</div>
            </div>
            <div class="pref-check" :class="{ on: survey.profileCode === p.profileCode }">✓</div>
          </button>
          <p v-if="survey.errorMessage" class="text-danger small mt-2">{{ survey.errorMessage }}</p>
          <button class="primary-btn" :disabled="!survey.profileCode || survey.loading" @click="submitPreference">다음</button>
        </template>

        <!-- 3. 담보대출 확인 -->
        <template v-else-if="currentStepName === 'mortgage'">
          <h2 class="step-title">지금 살고 계신 집에<br />남은 대출이 있으신가요?</h2>
          <p class="step-desc">집을 팔 때 갚아야 할 금액이라 계산에 꼭 필요합니다</p>
          <div class="toggle-pair">
            <button class="toggle-opt" :class="{ on: survey.hasMortgage === false }" @click="survey.hasMortgage = false">대출이 없어요</button>
            <button class="toggle-opt" :class="{ on: survey.hasMortgage === true }" @click="survey.hasMortgage = true">대출이 있어요</button>
          </div>
          <template v-if="survey.hasMortgage">
            <div class="mt-4 fw-bold" style="color: #8a7430; font-size: 13px">남은 대출 잔액</div>
            <div class="amount-box">
              <input v-model.number="survey.mortgageBalanceAmount" type="number" min="0" />
              <span>원</span>
            </div>
            <div style="color: #b39b2e; font-weight: 700; font-size: 14px; margin-top: 6px">
              = {{ formatKRW(survey.mortgageBalanceAmount) }}
            </div>
            <div class="chip-row">
              <button class="chip-btn" @click="addMortgageChip(10_000_000)">+ 1,000만</button>
              <button class="chip-btn" @click="addMortgageChip(50_000_000)">+ 5,000만</button>
              <button class="chip-btn" @click="addMortgageChip(100_000_000)">+ 1억</button>
              <button class="chip-btn" @click="survey.mortgageBalanceAmount = 0">지우기</button>
            </div>
          </template>
          <p v-if="survey.errorMessage" class="text-danger small mt-2">{{ survey.errorMessage }}</p>
          <button class="primary-btn" :disabled="!canSubmitMortgage || survey.loading" @click="submitMortgage">다음으로</button>
        </template>

        <!-- 4. 유보금 설정 -->
        <template v-else-if="currentStepName === 'reserve'">
          <h2 class="step-title">이사하고 나서, 최소 얼마 정도는<br />남아있으면 될까요?</h2>
          <div class="tier-grid">
            <button
              v-for="t in RESERVE_TIERS" :key="t.code" class="tier-card"
              :class="{ on: survey.reserveOptionCode === t.code }" @click="pickReserveTier(t.code)"
            >{{ t.label }}</button>
            <button class="custom-tier" :class="{ on: isCustomReserve }" @click="pickReserveTier('CUSTOM')">직접 입력할게요</button>
          </div>
          <template v-if="isCustomReserve">
            <div class="amount-box mt-3">
              <input v-model.number="survey.reserveCustomAmount" type="number" min="0" placeholder="예: 1억 5천만원" />
              <span>원</span>
            </div>
            <div v-if="survey.reserveCustomAmount" style="color: #b39b2e; font-weight: 700; font-size: 14px; margin-top: 6px">
              = {{ formatKRW(survey.reserveCustomAmount) }}
            </div>
          </template>
          <p v-if="survey.errorMessage" class="text-danger small mt-2">{{ survey.errorMessage }}</p>
          <button class="primary-btn" :disabled="!canSubmitReserve || survey.loading" @click="submitReserveBudget">결과 보러 가기</button>
        </template>

        <!-- 예산 요약 -->
        <template v-else-if="currentStepName === 'summary'">
          <h2 class="summary-headline">{{ formatKRW(survey.maxPurchaseBudgetAmount) }} 이하의<br />집을 찾아볼게요</h2>
          <div class="summary-stat">
            <div class="label">매도 예상 실수령액</div>
            <div class="value">{{ formatKRW(netProceeds) }}</div>
          </div>
          <div class="summary-stat">
            <div class="label">대출 상환 금액</div>
            <div class="value">{{ formatKRW(mortgagePaid) }}</div>
          </div>
          <div class="summary-stat">
            <div class="label">이사시 사용 가능한 금액</div>
            <div class="value">{{ formatKRW(survey.maxPurchaseBudgetAmount) }}</div>
          </div>
          <button class="primary-btn" @click="survey.advanceFromSummary">다음</button>
        </template>

        <!-- 5. 희망 지역 -->
        <template v-else-if="currentStepName === 'region'">
          <h2 class="step-title">어느 지역에서<br />새 집을 찾아볼까요?</h2>
          <div class="d-flex gap-2 mt-3">
            <button
              v-for="s in SIDO_LIST" :key="s" class="region-chip flex-grow-1" :class="{ on: sido === s }"
              @click="sido = s; gu = GU_BY_SIDO[s][0]"
            >{{ s }}</button>
          </div>
          <p class="step-desc mt-3 mb-2 text-start">구체적으로 어디가 좋을까요? 잘 모르겠으면 비워두셔도 괜찮아요</p>
          <div class="d-flex gap-2 flex-wrap">
            <button v-for="g in guList" :key="g" class="region-chip" :class="{ on: gu === g }" @click="gu = g">{{ g }}</button>
            <button class="region-chip dashed">전체로 볼게요</button>
          </div>
          <div class="d-flex gap-2 flex-wrap mt-3">
            <button
              v-for="d in dongList" :key="d.name" class="region-chip"
              :class="{ on: isDongSelected(d.name), zero: d.count === 0 }" @click="toggleDong(d.name)"
            >{{ d.name }} ({{ d.count }}개)</button>
            <button class="region-chip dashed" :class="{ on: wholeGuSelected() }" @click="pickWholeGu">구 전체로 볼게요</button>
          </div>
          <p v-if="survey.errorMessage" class="text-danger small mt-2">{{ survey.errorMessage }}</p>
          <button class="primary-btn" :disabled="survey.loading" @click="submitDesiredRegions">다음</button>
        </template>
      </template>
    </div>
  </div>
</template>
