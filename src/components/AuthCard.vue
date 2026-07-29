<template>
  <section class="auth-card" :class="{ compact }">
    <img class="auth-card__mark" src="../assets/jiphyeonjeon-mark.svg" alt="집현전" />
    <h1>{{ title }}</h1>
    <slot />
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  compact: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.auth-card {
  width: min(100%, 340px);
  padding: 32px 28px;
  border: 1px solid #d8d4cc;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(47, 43, 37, 0.08);
}

.auth-card.compact {
  width: min(100%, 300px);
  padding: 28px 24px;
}

.auth-card__mark {
  display: block;
  width: 52px;
  height: 52px;
  margin: 0 auto 10px;
}

h1 {
  margin: 0 0 22px;
  text-align: center;
  font-size: 20px;
  line-height: 1.25;
  font-weight: 800;
  color: #2f2b25;
}
</style>
