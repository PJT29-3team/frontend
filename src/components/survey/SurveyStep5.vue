<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { validatePreference } from "@/utils/surveyValidation";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const PROFILES = [
  {
    profileCode: "SAFETY_FIRST",
    icon: "🛡️",
    label: "병원이 가깝고, 동네가 안전했으면 해요",
  },
  {
    profileCode: "CONVENIENCE_FIRST",
    icon: "🛒",
    label: "장보기·산책·대중교통·은행이 가까웠으면 해요",
  },
  {
    profileCode: "VALUE_STABILITY",
    icon: "💰",
    label: "나중에 팔기 쉬운 집이면 좋겠어요",
  },
  {
    profileCode: "BALANCED",
    icon: "⚖️",
    label: "안전·편의·비용이 균형있는 집이면 좋겠어요",
  },
];

const profileCode = ref(survey.profileCode);
const submitted = ref(false);

const errors = computed(() =>
  validatePreference({ profileCode: profileCode.value }),
);
const isValid = computed(() => Object.keys(errors.value).length === 0);

const shownError = computed(() =>
  submitted.value ? errors.value.profileCode || "" : "",
);

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.savePreference(profileCode.value);
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">새로 살 집,<br />무엇이 가장 마음 쓰이세요?</h2>

    <button
      v-for="p in PROFILES"
      :key="p.profileCode"
      type="button"
      class="pref-card"
      :class="{ selected: profileCode === p.profileCode }"
      :aria-pressed="profileCode === p.profileCode"
      @click="profileCode = p.profileCode"
    >
      <div class="pref-icon" aria-hidden="true">{{ p.icon }}</div>
      <div class="flex-grow-1">
        <div class="pref-title">{{ p.label }}</div>
      </div>
      <div class="pref-check" :class="{ on: profileCode === p.profileCode }">
        ✓
      </div>
    </button>

    <div v-if="shownError" class="invalid-feedback d-block">
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
