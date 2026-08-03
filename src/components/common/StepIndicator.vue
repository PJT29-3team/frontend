<template>
  <div class="step-indicator">
    <template v-for="(step, index) in steps" :key="step.key">
      <component
        :is="canNavigate(step.key) ? 'RouterLink' : 'button'"
        class="step"
        :class="stepStatus(step.key)"
        :to="step.to"
        :disabled="!canNavigate(step.key)"
      >
        <div class="step-circle">
          <span v-if="stepStatus(step.key) === 'done'">✓</span>
          <span v-else>{{ step.icon }}</span>
        </div>
        <p class="step-label">{{ step.label }}</p>
        <p class="step-status">{{ statusText(stepStatus(step.key)) }}</p>
      </component>

      <div
        v-if="index < steps.length - 1"
        class="step-line"
        :class="{ done: stepStatus(step.key) === 'done' }"
      ></div>
    </template>
  </div>
</template>

<script setup>
const props = defineProps({
  currentStep: { type: String, required: true },
  unlockedStep: { type: String, default: null },
})

const steps = [
  { key: 'survey', label: '설문 조사', icon: '✓', to: '/survey' },
  { key: 'recommend', label: '추천 매물', icon: '⌕', to: '/recommend' },
  { key: 'favorite', label: '관심 매물', icon: '♡', to: '/favorite-home' },
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

function canNavigate(key) {
  const currentIndex = steps.findIndex(s => s.key === (props.unlockedStep || props.currentStep))
  const stepIndex = steps.findIndex(s => s.key === key)
  return Boolean(steps[stepIndex]?.to) && stepIndex <= currentIndex
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 42px 56px 36px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 116px;
  padding: 0;
  border: 0;
  background: transparent;
  text-decoration: none;
  cursor: pointer;
}

.step:disabled { cursor: not-allowed; }

.step-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border: 3px solid #ddd;
  color: #bbb;
  background: white;
  margin-bottom: 10px;
}

.step-label {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: #333;
}

.step-status {
  font-size: 13px;
  margin: 4px 0 0;
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
  height: 3px;
  background: #eee;
  flex: 1;
  margin-top: 29px;
  max-width: 112px;
}

.step-line.done {
  background: #f5c518;
}

@media (max-width: 820px) {
  .step-indicator {
    justify-content: flex-start;
    overflow-x: auto;
    padding: 28px 22px 24px;
  }

  .step { flex: 0 0 88px; width: 88px; }
  .step-circle { width: 50px; height: 50px; font-size: 18px; }
  .step-label { font-size: 13px; white-space: nowrap; }
  .step-status { font-size: 11px; }
  .step-line { flex: 0 0 54px; margin-top: 24px; }
}
</style>
