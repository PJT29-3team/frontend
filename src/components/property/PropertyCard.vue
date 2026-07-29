<script setup>
import { computed } from 'vue'
import FavoriteButton from '../common/FavoriteButton.vue'

const props = defineProps({
  property: { type: Object, required: true },
  rank: { type: Number, required: true },
  isFavorite: { type: Boolean, default: false },
  isPending: { type: Boolean, default: false },
  isLimitReached: { type: Boolean, default: false },
})

const emit = defineEmits(['view-detail', 'toggle-favorite'])

const GRADE_LABELS = { excellent: '우수', normal: '보통', poor: '미흡' }

const gradeLabel = computed(() => GRADE_LABELS[props.property.grade] ?? '보통')
const gradeClass = computed(() => `grade-${props.property.grade ?? 'normal'}`)
const scorePercent = computed(() => Math.max(0, Math.min(100, props.property.score ?? 0)))
</script>

<template>
  <article class="property-card">
    <div class="property-card__rank" aria-hidden="true">{{ rank }}</div>

    <div class="property-card__body">
      <div class="property-card__heading">
        <h3>{{ property.name }}</h3>
        <span class="property-card__price">{{ property.price }}</span>
      </div>

      <div class="property-card__grade">
        <span class="grade-badge" :class="gradeClass">적합도 {{ gradeLabel }}</span>
        <div class="grade-bar" role="progressbar" :aria-valuenow="scorePercent" aria-valuemin="0" aria-valuemax="100">
          <div class="grade-bar__fill" :class="gradeClass" :style="{ width: `${scorePercent}%` }"></div>
        </div>
      </div>

      <p class="property-card__address">{{ property.address }} · {{ property.commuteTime }}</p>

      <div class="property-card__actions">
        <button type="button" class="detail-link" @click="emit('view-detail', property)">상세정보 보기 →</button>
        <FavoriteButton
          :active="isFavorite"
          :pending="isPending"
          :disabled="!isFavorite && isLimitReached"
          @toggle="emit('toggle-favorite', property)"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
.property-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1.5px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-background);
}

.property-card__rank {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-dark);
  color: #fff;
  font-size: 18px;
  font-weight: 800;
}

.property-card__body {
  flex: 1;
  min-width: 0;
}

.property-card__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.property-card__heading h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 20px;
}

.property-card__price {
  color: var(--color-dark);
  font-size: 22px;
  font-weight: 800;
}

.property-card__grade {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
}

.grade-badge {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.grade-badge.grade-excellent {
  background: var(--color-grade-excellent);
}

.grade-badge.grade-normal {
  background: var(--color-grade-normal);
}

.grade-badge.grade-poor {
  background: var(--color-grade-poor);
}

.grade-bar {
  flex: 1;
  height: 10px;
  border-radius: 999px;
  background: var(--color-surface);
  overflow: hidden;
}

.grade-bar__fill {
  height: 100%;
  border-radius: 999px;
}

.grade-bar__fill.grade-excellent {
  background: var(--color-grade-excellent);
}

.grade-bar__fill.grade-normal {
  background: var(--color-grade-normal);
}

.grade-bar__fill.grade-poor {
  background: var(--color-grade-poor);
}

.property-card__address {
  margin: 12px 0 0;
  color: var(--color-text-muted);
  font-size: 16px;
}

.property-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.detail-link {
  min-height: 48px;
  padding: 0 8px;
  background: transparent;
  color: var(--color-dark);
  font-size: 16px;
  font-weight: 700;
}

@media (max-width: 640px) {
  .property-card {
    flex-direction: column;
  }
}
</style>
