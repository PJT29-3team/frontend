<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  amount: { type: Number, default: 0 },
  prefix: { type: String, default: "" },
  steps: { type: Array, default: () => [] },
});

const open = ref(true);

const amountText = computed(() => {
  const won = `${Math.floor(props.amount).toLocaleString("ko-KR")}원`;
  return props.prefix ? `${props.prefix} ${won}` : won;
});
</script>

<template>
  <section class="calc-card">
    <div class="calc-card-head">
      <h3 class="calc-card-title">{{ title }}</h3>
      <div class="calc-card-amount">{{ amountText }}</div>
    </div>

    <button
      v-if="steps.length"
      type="button"
      class="calc-toggle"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ open ? "계산식 접기" : "계산식 펼치기" }}
    </button>

    <div v-if="open && steps.length" class="calc-body">
      <p v-for="(line, i) in steps" :key="i">{{ line }}</p>
    </div>
  </section>
</template>
