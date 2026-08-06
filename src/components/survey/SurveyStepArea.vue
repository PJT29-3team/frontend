<script setup>
import { computed, ref } from "vue";
import { useSurveyStore } from "@/stores/survey";
import { AREA_OPTIONS } from "@/constants/regions";

const survey = useSurveyStore();
const emit = defineEmits(["next", "prev"]);

const selected = ref(survey.desiredAreaCode);
const submitted = ref(false);

const isValid = computed(() => selected.value !== null);
const shownError = computed(() =>
  submitted.value && !isValid.value ? "평수를 선택해주세요." : "",
);

function pick(code) {
  selected.value = code;
}

function submit() {
  submitted.value = true;
  if (!isValid.value) return;
  survey.saveDesiredArea(selected.value);
  emit("next");
}
</script>

<template>
  <div>
    <h2 class="step-title">어느 정도 넓이의<br />집을 찾고 계신가요?</h2>
    <p class="step-desc">고르신 평수 안에서만 매물을 찾아드려요</p>

    <div class="area-list">
      <button
        v-for="option in AREA_OPTIONS"
        :key="option.code"
        type="button"
        class="area-option"
        :class="{ on: selected === option.code }"
        :aria-pressed="selected === option.code"
        @click="pick(option.code)"
      >
        <strong>{{ option.label }}</strong>
        <small>{{ option.hint }}</small>
      </button>
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

<style scoped>
.area-list {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.area-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 16px 20px;
  border: 1.5px solid var(--card-border);
  border-radius: 14px;
  background: #fff;
  color: var(--text-dark);
  text-align: left;
}

.area-option strong {
  font-size: 17px;
  font-weight: 700;
}

.area-option small {
  color: var(--text-muted);
  font-size: 13.5px;
}

.area-option.on {
  border-color: var(--kb-yellow);
  background: var(--kb-yellow);
  color: var(--btn-text);
}

.area-option.on small {
  color: var(--btn-text);
}
</style>
