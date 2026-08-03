<script setup>
defineProps({
  userName: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

defineEmits(["start"]);
</script>

<template>
  <div class="intro-wrap">
    <div class="intro-icon" aria-hidden="true">🏠</div>
    <h2 class="intro-heading">
      {{ userName }} 님에게<br />꼭 맞는 집을 추천해드릴게요
    </h2>
    <p class="intro-sub">천천히 답해주셔도 괜찮아요, 1분이면 충분해요</p>
    <button
      type="button"
      class="intro-start-btn"
      :disabled="loading"
      @click="$emit('start')"
    >
      설문 시작하기
    </button>
  </div>
</template>
