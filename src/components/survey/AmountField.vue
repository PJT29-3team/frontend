<script setup>
import { computed } from "vue";
import { formatKRW } from "@/stores/survey";

const props = defineProps({
  modelValue: { type: Number, default: null },
  inputId: { type: String, required: true },
  label: { type: String, default: "" },
  error: { type: String, default: "" },
  /** 금액 증감 칩(+1,000만 / +5,000만 / +1억 / 지우기) 노출 여부 */
  chips: { type: Boolean, default: false },
  /** 한글 환산 앞에 "=" 를 붙일지 (피그마 4단계 표기) */
  equals: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const hasValue = computed(
  () => props.modelValue !== null && props.modelValue !== undefined,
);

const display = computed(() =>
  hasValue.value ? Number(props.modelValue).toLocaleString("ko-KR") : "",
);

const helpLine = computed(() => {
  if (!hasValue.value) return "";
  const won = formatKRW(props.modelValue);
  return props.equals ? `= ${won}` : won;
});

// 콤마·공백을 걷어내고 숫자만 스토어에 넣는다.
function onInput(event) {
  const digits = event.target.value.replace(/[^0-9]/g, "");
  emit("update:modelValue", digits === "" ? null : Number(digits));
}

const CHIPS = [
  { label: "+ 1,000만", amount: 10_000_000 },
  { label: "+ 5,000만", amount: 50_000_000 },
  { label: "+ 1억", amount: 100_000_000 },
];

function addAmount(amount) {
  emit("update:modelValue", (props.modelValue || 0) + amount);
}
</script>

<template>
  <div class="amount-field">
    <label v-if="label" :for="inputId" class="form-label survey-label">
      {{ label }}
    </label>

    <div class="input-group">
      <input
        :id="inputId"
        class="form-control amount-input"
        :class="{ 'is-invalid': !!error }"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        :value="display"
        :aria-invalid="!!error"
        @input="onInput"
      />
      <span class="input-group-text amount-unit">원</span>
    </div>

    <div class="d-flex justify-content-between align-items-start gap-2">
      <span class="field-help">{{ helpLine }}</span>
      <span v-if="error" class="invalid-feedback d-block text-end mt-1">
        {{ error }}
      </span>
    </div>

    <div v-if="chips" class="chip-row">
      <button
        v-for="chip in CHIPS"
        :key="chip.label"
        type="button"
        class="chip-btn"
        @click="addAmount(chip.amount)"
      >
        {{ chip.label }}
      </button>
      <button
        type="button"
        class="chip-btn"
        @click="emit('update:modelValue', null)"
      >
        지우기
      </button>
    </div>
  </div>
</template>
