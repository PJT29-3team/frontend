<script setup>
import { computed, onMounted, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validateDesiredRegions } from "@/utils/surveyValidation";
import { SIDO_LIST, SIGUNGU_BY_SIDO, areaRangeOf } from "@/constants/regions";
import propertyRecommendationApi from "@/api/propertyRecommendation";

const survey = useSurveyStore();
// searching: 제출 API가 시작될 때. 부모가 "집 찾는 중" 로딩을 띄우는 신호다.
// 범용 next 로는 마지막 단계 제출을 구분할 수 없다(앞 단계들도 next 를 올린다).
const emit = defineEmits(["searching", "prev", "complete"]);

const sido = ref(SIDO_LIST[0]);
const submitted = ref(false);

/** 서버가 알려준 지역별 매물 수. "시도|시군구" → 개수 */
const countByRegion = ref({});

onMounted(async () => {
  try {
    // 설문에서 산출한 예산과 고른 평수를 넘겨, 실제로 추천될 수 있는 매물만 센다.
    const counts = await propertyRecommendationApi.regionCounts(
      survey.maxPurchaseBudget,
      areaRangeOf(survey.desiredAreaCode),
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
 * 시군구 전체를 가나다순으로 보여준다.
 *
 * 매물이 0개인 지역도 목록에서 빼지 않는다. 사라지면 사용자는 그 동네가
 * 원래 없는 줄 알지만, 실제로는 예산·평수를 조금 넓히면 나오기 때문이다.
 * 대신 0개인 칩은 흐리게 두고 선택은 막는다.
 * 서버 응답을 못 받았을 때는 개수만 비운다(null).
 */
const sigunguList = computed(() => {
  const all = SIGUNGU_BY_SIDO[sido.value] || [];
  const counts = countByRegion.value;
  const hasCounts = Object.keys(counts).length > 0;
  return all
    .map((g) => ({
      name: g.name,
      count: hasCounts ? (counts[`${sido.value}|${g.name}`] ?? 0) : null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
});

/** 매물이 0개인 지역은 고를 수 없다. 고르면 추천이 빈 목록으로 나온다. */
function isSoldOut(region) {
  return region.count === 0;
}

function toggle(region) {
  if (isSoldOut(region)) return;
  survey.toggleRegion(sido.value, region.name);
}

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
      숫자는 예산·평수에 맞는 매물 수예요 · 여러 곳 함께 골라도 돼요
      <br />매물이 없는 지역은 흐리게 표시돼요
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
        :class="{ on: survey.isRegionSelected(sido, g.name), 'sold-out': isSoldOut(g) }"
        :aria-pressed="survey.isRegionSelected(sido, g.name)"
        :disabled="isSoldOut(g)"
        :title="isSoldOut(g) ? '조건에 맞는 매물이 없어요' : undefined"
        @click="toggle(g)"
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
