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
  { key: 'survey', label: '설문 조사', icon: '✓', to: '/survey?mode=resume' },
  { key: 'recommend', label: '추천 매물', icon: '⌕', to: '/recommend' },
  { key: 'favorite', label: '관심 매물', icon: '♡', to: '/favorite-home' },
  { key: 'finance-recommend', label: '금융상품 추천', icon: '🗄', to: '/recommendation' },
  { key: 'finance-manage', label: '금융상품 관리', icon: '♡', to: '/finance/horizon' },
  { key: 'result', label: '결과 보기', icon: '📄', to: '/summary' },
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

// 되돌아갈 수 있는 범위는 "해금된 단계"와 "지금 서 있는 단계" 중 더 뒤엣것까지다.
// unlockedStep은 설문 완료 여부까지만 알기 때문에, 그것만 보면 금융 단계에 서 있어도
// 앞 단계로 못 돌아간다.
function canNavigate(key) {
  const maxIndex = Math.max(
    steps.findIndex(s => s.key === props.unlockedStep),
    steps.findIndex(s => s.key === props.currentStep),
  )
  const stepIndex = steps.findIndex(s => s.key === key)
  return Boolean(steps[stepIndex]?.to) && stepIndex <= maxIndex
}
</script>

<style scoped>
.step-indicator {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  /* 화면이 낮으면 여백부터 줄여 본문이 스크롤 없이 들어가게 한다. */
  padding: clamp(12px, 2.4vh, 42px) 56px clamp(10px, 2vh, 36px);
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
.step.active:disabled,
.step.done:disabled { opacity: 1; }

.step-circle {
  width: clamp(38px, 6vh, 60px);
  height: clamp(38px, 6vh, 60px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  border: 3px solid #ddd;
  color: #bbb;
  background: white;
  margin-bottom: clamp(5px, 0.9vh, 10px);
}

.step-label {
  font-size: 15px;
  font-weight: 500;
  margin: 0;
  color: #333;
  line-height: 1.3;
}

.step-status {
  font-size: 13px;
  margin: 2px 0 0;
  color: #bbb;
  line-height: 1.3;
}

/* 완료 상태 */
.step.done .step-circle {
  background: #f5c518;
  border-color: #f5c518;
  color: #fff;
  font-weight: 800;
}

.step.done .step-status {
  color: #f0a500;
}

/* 진행중 상태 */
.step.active .step-circle {
  background: #f5c518;
  border-color: #f5c518;
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  /* 지금 어느 단계인지 한눈에 보이도록 테두리가 은은하게 퍼졌다 사라진다. */
  animation: step-pulse 1.8s ease-out infinite;
}

@keyframes step-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 197, 24, 0.65);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(245, 197, 24, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 197, 24, 0);
  }
}

/* 노트북처럼 세로가 짧은 화면에서는 상태 문구를 접어 본문 공간을 남긴다.
   현재 단계는 원의 색과 반짝임으로 이미 구분된다. */
@media (max-height: 940px) {
  .step-status {
    display: none;
  }
  .step-label {
    font-size: 13.5px;
  }
}

/* 13인치 노트북(뷰포트 730~790px)에서는 단계 표시줄을 한 번 더 접는다.
   여기서 확보한 높이가 추천 카드 5장을 스크롤 없이 담는 데 그대로 쓰인다. */
@media (max-height: 860px) {
  .step-indicator {
    padding: clamp(10px, 1.6vh, 42px) 56px clamp(8px, 1.3vh, 36px);
  }
  .step-circle {
    width: clamp(36px, 4.8vh, 60px);
    height: clamp(36px, 4.8vh, 60px);
    font-size: 19px;
    border-width: 2.5px;
    margin-bottom: clamp(3px, 0.6vh, 10px);
  }
  .step-line {
    margin-top: clamp(16px, 2.4vh, 29px);
  }
}

/* 움직임에 민감한 사용자는 애니메이션을 끈다. */
@media (prefers-reduced-motion: reduce) {
  .step.active .step-circle {
    animation: none;
    box-shadow: 0 0 0 4px rgba(245, 197, 24, 0.35);
  }
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
