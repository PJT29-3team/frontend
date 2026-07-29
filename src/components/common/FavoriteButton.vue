<script setup>
import { Heart } from '@lucide/vue'

const props = defineProps({
  active: { type: Boolean, default: false },
  pending: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle'])

function handleClick() {
  if (props.pending || props.disabled) return
  emit('toggle')
}
</script>

<template>
  <button
    type="button"
    class="favorite-button"
    :class="{ 'is-active': active }"
    :disabled="disabled || pending"
    :aria-pressed="active"
    @click="handleClick"
  >
    <span v-if="pending" class="favorite-button__spinner" aria-hidden="true"></span>
    <Heart v-else class="favorite-button__icon" :fill="active ? 'currentColor' : 'none'" aria-hidden="true" />
    <span>{{ active ? '담았어요' : '관심 목록에 담기' }}</span>
  </button>
</template>

<style scoped>
.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.favorite-button.is-active {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: #1f1f1f;
}

.favorite-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.favorite-button__icon {
  width: 20px;
  height: 20px;
}

.favorite-button__spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(0, 0, 0, 0.2);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: favorite-spin 0.7s linear infinite;
}

@keyframes favorite-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
