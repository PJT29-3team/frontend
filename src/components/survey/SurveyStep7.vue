<script setup>
import { computed, onMounted, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateDesiredRegions } from "@/utils/surveyValidation";
import { SIDO_LIST, SIGUNGU_BY_SIDO } from "@/constants/regions";
import propertyRecommendationApi from "@/api/propertyRecommendation";

const survey = useSurveyStore();
// searching: 제출 API가 시작될 때. 부모가 "집 찾는 중" 로딩을 띄우는 신호다.
const emit = defineEmits(["searching", "prev", "complete"]);

const sido = ref(SIDO_LIST[0]);
const submitted = ref(false);

/** 서버가 알려준 지역별 매물 수. "시도|시군구" → 개수 */
const countByRegion = ref({});

onMounted(async () => {
  try {
    // 설문에서 산출한 예산을 넘겨, 실제로 추천될 수 있는 매물만 센다.
    const counts = await propertyRecommendationApi.regionCounts(
      survey.maxPurchaseBudget,
    );
    countByRegion.value = Object.fromEntries(
      counts.map((r) => [`${r.sidoName}|${r.sigunguName}`, r.count]),
    );
  } catch {
    // 개수를 못 받아도 지역 선택 자체는 되어야 한다. 숫자만 비워 둔다.
    countByRegion.value = {};
  }
});

/**
 * 추천 가능한 단지가 있는 지역만, 가나다순으로 보여준다.
 * 0개인 지역을 그대로 두면 고른 뒤 추천이 빈 목록으로 나와 사용자가 이유를 알 수 없다.
 * 서버 응답을 못 받았을 때는 거르지 않는다(전부 0으로 보여 선택지가 사라지는 것보다 낫다).
 */
const sigunguList = computed(() => {
  const all = SIGUNGU_BY_SIDO[sido.value] || [];
  const counts = countByRegion.value;
  if (Object.keys(counts).length === 0) {
    return all
      .map((g) => ({ name: g.name, count: null }))
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
  }
  return all
    .map((g) => ({ name: g.name, count: counts[`${sido.value}|${g.name}`] ?? 0 }))
    .filter((g) => g.count > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
});

const errors = computed(() =>
  validateDesiredRegions({ desiredRegions: survey.desiredRegions }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

const shownError = computed(() =>
  submitted.value ? errors.value.desiredRegions || "" : "",
);

const selectionText = computed(() => {
  const picked = survey.desiredRegions;
  if (picked.length === 0) return "";
  const [first] = picked;
  return picked.length === 1
    ? `${first.sigunguName} 선택하셨어요`
    : `${first.sigunguName} 외 ${picked.length - 1}곳 선택하셨어요`;
});

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  emit("searching");
  survey.submitSurvey(survey.desiredRegions).then(() => emit("complete"));
}
</script>

<template>
  <div>
    <h2 class="step-title">어느 지역에서<br />새 집을 찾아볼까요?</h2>
    <p class="step-desc">
      숫자는 예산으로 살 수 있는 매물 수예요 · 여러 곳 함께 골라도 돼요
    </p>

    <div class="d-flex gap-2">
      <button
        v-for="s in SIDO_LIST"
        :key="s"
        type="button"
        class="region-chip flex-grow-1"
        :class="{ on: sido === s }"
        :aria-pressed="sido === s"
        @click="sido = s"
      >
        {{ s }}
      </button>
    </div>

    <div class="sigungu-grid">
      <button
        v-for="g in sigunguList"
        :key="g.name"
        type="button"
        class="region-chip"
        :class="{ on: survey.isRegionSelected(sido, g.name) }"
        :aria-pressed="survey.isRegionSelected(sido, g.name)"
        @click="survey.toggleRegion(sido, g.name)"
      >
        {{ g.name
        }}<span v-if="g.count !== null" class="region-count">{{ g.count }}</span>
      </button>
    </div>

    <div v-if="selectionText" class="selection-banner">
      {{ selectionText }}
    </div>

    <div v-if="shownError" class="invalid-feedback d-block mt-2">
      {{ shownError }}
    </div>

    <div class="btn-row">
      <button type="button" class="secondary-btn" @click="emit('prev')">
        이전
      </button>
      <button
        type="button"
        class="primary-btn"
        :disabled="submitted && !isValid"
        @click="submit"
      >
        다음
      </button>
    </div>
  </div>
</template>
