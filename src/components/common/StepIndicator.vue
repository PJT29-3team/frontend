<template>
  <div class="step-indicator">
    <template v-for="(step, index) in steps" :key="step.key">
      <div class="step" :class="stepStatus(step.key)">
        <div class="step-circle">
          <span v-if="stepStatus(step.key) === 'done'">✓</span>
          <span v-else>{{ step.icon }}</span>
        </div>
        <p class="step-label">{{ step.label }}</p>
        <p class="step-status">{{ statusText(stepStatus(step.key)) }}</p>
      </div>

      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ done: stepStatus(step.key) === 'done' }"
      ></div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps(['currentStep'])

const steps = [
  { key: 'survey', label: '설문 조사', icon: '✓' },
  { key: 'recommend', label: '추천 매물', icon: '🔍' },
  { key: 'favorite', label: '관심 매물', icon: '♡' },
  { key: 'finance-recommend', label: '금융상품 추천', icon: '🗄' },
  { key: 'finance-manage', label: '금융상품 관리', icon: '♡' },
  { key: 'result', label: '결과 보기', icon: '📄' },
]

function stepStatus(key) {
  const currentIndex = steps.findIndex(s => s.key === props.currentStep)
  const stepIndex = steps.findIndex(s => s.key === key)
  if (stepIndex < currentIndex) return 'done'
  if (stepIndex === currentIndex) return 'active'
  return 'waiting'
}

function statusText(status) {
  if (status === 'done') return '완료'
  if (status === 'active') return '진행중'
  return '대기'
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 32px 40px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 90px;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid #ddd;
  color: #bbb;
  background: white;
  margin-bottom: 8px;
}

.step-label {
  font-size: 13px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.step-status {
  font-size: 11px;
  margin: 2px 0 0;
  color: #bbb;
}

/* 완료 상태 */
.step.done .step-circle {
  background: #f5c518;
  border-color: #f5c518;
  color: #4a3a00;
}

.step.done .step-status {
  color: #f0a500;
}

/* 진행중 상태 */
.step.active .step-circle {
  background: #f5c518;
  border-color: #f5c518;
  color: #4a3a00;
}

.step.active .step-label {
  font-weight: 700;
}

.step.active .step-status {
  color: #f0a500;
  font-weight: 700;
}

/* 연결선 */
.step-line {
  height: 2px;
  background: #eee;
  flex: 1;
  margin-top: 22px;
  max-width: 80px;
}

.step-line.done {
  background: #f5c518;
}
</style>