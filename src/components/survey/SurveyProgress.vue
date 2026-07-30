<script setup>
defineProps({
  step: { type: Number, required: true },
  total: { type: Number, required: true },
  percent: { type: Number, required: true },
  showBack: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});

defineEmits(["back", "reset"]);
</script>

<template>
  <div class="top-row">
    <button
      v-if="showBack"
      type="button"
      class="back-btn"
      aria-label="이전 단계"
      @click="$emit('back')"
    >
      ‹
    </button>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: percent + '%' }"></div>
    </div>
    <div class="progress-frac">{{ step }} / {{ total }}</div>
    <button
      type="button"
      class="reset-link"
      :disabled="disabled"
      @click="$emit('reset')"
    >
      ↺ 처음부터
    </button>
  </div>
</template>
