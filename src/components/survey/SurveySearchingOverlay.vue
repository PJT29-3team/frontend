<script setup>
import { computed } from "vue";

/**
 * 설문 제출 후 추천 목록으로 넘어가는 동안 보여주는 "집 찾는 중" 카드.
 *
 * 백엔드가 진행률을 주지 않으므로 %는 부모가 시간에 따라 올려주는 연출값이다.
 * 메시지는 구간에 따라 갈린다. (피그마: 0/25/50·75/100%)
 */
const props = defineProps({
  progress: { type: Number, default: 0 },
});

const message = computed(() => {
  if (props.progress >= 100) return "딱 맞는 곳 골랐어요!";
  if (props.progress >= 50) return "안전·편리·자산 점수 매기고 있어요";
  if (props.progress >= 25) return "후보 매물들 하나씩 살펴보는 중이에요";
  return "조건에 맞는 동네부터 찾고 있어요";
});
</script>

<template>
  <div class="searching-backdrop" role="status" aria-live="polite">
    <div class="searching-card">
      <div class="searching-icon" aria-hidden="true">🔍</div>
      <p class="searching-eyebrow">곧 결과를 보여드릴게요</p>
      <p class="searching-message">{{ message }}</p>
      <div class="searching-track">
        <div class="searching-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <p class="searching-percent">{{ progress }}%</p>
    </div>
  </div>
</template>

<style scoped>
.searching-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(25, 30, 36, 0.45);
}

.searching-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(360px, 100%);
  padding: 48px 32px 40px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.searching-icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background: #fdf6df;
  font-size: 28px;
  line-height: 33px;
}

.searching-eyebrow {
  margin: 24px 0 0;
  font-size: 13px;
  line-height: 15px;
  letter-spacing: 0.2px;
  color: #b8930a;
}

.searching-message {
  display: grid;
  place-items: center;
  min-height: 52px;
  margin: 17px 0 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 26px;
  text-align: center;
  color: #1a1a1a;
}

.searching-track {
  width: 100%;
  height: 8px;
  margin-top: 28px;
  border-radius: 4px;
  background: #f0eee8;
  overflow: hidden;
}

.searching-fill {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f5c518 0%, #f0b400 100%);
  transition: width 0.45s ease;
}

.searching-percent {
  margin: 12px 0 0;
  font-size: 14px;
  line-height: 16px;
  color: #f0b400;
}
</style>
