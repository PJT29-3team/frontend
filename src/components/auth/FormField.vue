<template>
  <label class="form-field">
    <span>{{ label }}</span>
    <slot />
  </label>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
.form-field {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #4f493f;
}

.form-field :deep(input),
.form-field :deep(select) {
  width: 100%;
  height: 38px;
  border: 0;
  border-bottom: 1px solid #bdb8af;
  border-radius: 0;
  background: #fff;
  color: #2f2b25;
  outline: none;
}

.form-field :deep(input:focus),
.form-field :deep(select:focus) {
  border-bottom-color: var(--jh-yellow);
}
</style>
