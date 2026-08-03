<script setup>
import { computed } from 'vue'

const emit = defineEmits(['close'])
const props = defineProps({
  page: { type: Boolean, default: false },
  weights: { type: Object, default: () => ({ safetyWeight: 60, convenienceWeight: 20, assetWeight: 20 }) },
})

const weights = computed(() => ({
  safety: Number(props.weights.safetyWeight ?? 60),
  convenience: Number(props.weights.convenienceWeight ?? 20),
  asset: Number(props.weights.assetWeight ?? 20),
}))
const profileLabel = computed(() => ({
  SAFETY_FIRST: '안전 우선형',
  VALUE_STABILITY: '자산 안정형',
  CONVENIENCE_FIRST: '생활 편의형',
  BALANCED: '균형형',
}[props.weights.profileCode] || '맞춤형'))
const categories = computed(() => [
  {
    key: 'safety', title: '주거 안전', weight: weights.value.safety,
    metrics: [
      ['넘어짐 위험', '엘리베이터, 경사', '30%'],
      ['의료', '동네의원, 종합병원, 약국', '30%'],
      ['치안', 'CCTV, 경찰서·지구대, 소방서', '20%'],
      ['재난·침수', '침수, 산사태 위험', '20%'],
    ],
  },
  {
    key: 'convenience', title: '생활 편의', weight: weights.value.convenience,
    metrics: [
      ['장보기·산책', '전통시장, 대형마트, 공원', '40%'],
      ['버스·지하철', '버스정류장, 지하철역', '35%'],
      ['동네 시설', '행정복지센터, 은행, 요양시설', '25%'],
    ],
  },
  {
    key: 'asset', title: '자산 안정', weight: weights.value.asset,
    metrics: [
      ['집값 수준', '기준값과의 매매값 차이율', '50%'],
      ['팔기 쉬운 정도', '하락장 거래건수', '50%'],
    ],
  },
].sort((left, right) => right.weight - left.weight).map((category, index) => ({ ...category, rank: `${index + 1}순위` })))
const tabs = computed(() => categories.value.map(({ key, title, weight }) => ({ key, title, weight })))
</script>

<template>
  <div :class="page ? 'evaluation-page' : 'evaluation-backdrop'" @click.self="!page && emit('close')">
    <section class="evaluation-modal" :class="{ 'evaluation-modal--page': page }" aria-labelledby="evaluation-title">
      <header class="evaluation-header">
        <button v-if="page" type="button" class="back-button" @click="emit('close')">← 관심 매물로 돌아가기</button>
        <h2 id="evaluation-title">평가 방법 상세보기</h2>
        <p>설문에서 선택한 페르소나 가중치와 매물 평가 기준이에요.</p>
      </header>

      <section class="weight-summary">
        <span aria-hidden="true">🏠</span>
        <p><strong>{{ profileLabel }}</strong>을 선택하셨어요. 현재 가중치는 <strong>주거 안전 {{ weights.safety }}% · 생활 편의 {{ weights.convenience }}% · 자산 안정 {{ weights.asset }}%</strong>예요.<br>동일한 매물도 선택한 페르소나에 따라 최종 추천점수가 달라집니다.</p>
      </section>

      <section v-for="category in categories" :key="category.key" class="category" :class="`category--${category.key}`">
        <div class="category-label"><b>{{ category.rank }}</b><strong>{{ category.title }} (전체 비중 {{ category.weight }}%)</strong></div>
        <div class="category-tabs">
          <div v-for="tab in tabs" :key="tab.key" :class="{ active: tab.key === category.key }">{{ tab.title }}<small>{{ tab.weight }}%</small></div>
        </div>
        <div class="metric-bars" :style="{ gridTemplateColumns: `repeat(${category.metrics.length}, 1fr)` }"><div v-for="(_, index) in category.metrics" :key="index"><span>{{ index + 1 }}</span></div></div>
        <ul class="metric-list"><li v-for="(metric, index) in category.metrics" :key="metric[0]"><span>{{ index + 1 }}</span><div><strong>{{ metric[0] }}</strong><small>{{ metric[1] }}</small></div><em>{{ metric[2] }}</em></li></ul>
      </section>
      <footer>모든 세부 점수는 0~100점으로 계산하고, 설문 페르소나의 안전·편리·자산 가중치를 적용해 최종점수를 산정합니다.</footer>
    </section>
  </div>
</template>

<style scoped>
.evaluation-backdrop { position: fixed; z-index: 60; inset: 0; display: grid; place-items: center; padding: 22px; overflow-y: auto; background: rgba(25, 30, 36, .63); }.evaluation-page { min-height: calc(100vh - 204px); padding: 42px 22px; background: #f7f5ef; }.evaluation-modal { width: min(100%, 1020px); max-height: calc(100vh - 44px); overflow-y: auto; padding: 38px 46px 48px; border-radius: 28px; background: #fffcf3; color: #3e3b35; box-shadow: 0 25px 70px rgba(0,0,0,.34); }.evaluation-modal--page { max-height: none; margin: 0 auto; box-shadow: none; border: 1px solid #ebe4d4; }.evaluation-header { padding-bottom: 18px; border-bottom: 1px solid #e5dfd2; }.back-button { margin: 0 0 20px; padding: 9px 15px; border: 1px solid #d8d1c5; border-radius: 8px; background: #fff; color: #625c54; font-weight: 700; }.evaluation-header h2 { margin: 0; font-size: 23px; font-weight: 800; }.evaluation-header p { margin: 8px 0 0; color: #77736b; font-size: 15px; }.weight-summary { display: flex; gap: 13px; margin: 18px 0 30px; padding: 16px 20px; border-radius: 16px; background: #fff0c2; line-height: 1.5; }.weight-summary span { font-size: 28px; }.weight-summary p { margin: 0; }.weight-summary strong { color: #a66f13; }.category { padding: 0 100px 34px; }.category + .category { padding-top: 34px; border-top: 1px solid #e7e0d4; }.category-label { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; color: var(--theme); }.category-label b { padding: 5px 12px; border-radius: 999px; background: var(--theme); color: #fff; font-size: 13px; }.category-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }.category-tabs div { min-height: 70px; display: grid; place-content: center; justify-items: center; border-radius: 14px; color: #a9a69d; background: #e7e5de; font-size: 16px; font-weight: 700; }.category-tabs div.active { color: #fff; background: var(--theme); }.category-tabs small { margin-top: 3px; font-size: 13px; font-weight: 400; }.metric-bars { display: grid; margin-top: 38px; overflow: hidden; border-radius: 16px; outline: 3px dashed var(--theme); outline-offset: 8px; }.metric-bars div { height: 68px; display: grid; place-items: center; background: color-mix(in srgb, var(--theme) 60%, #fff); }.metric-bars div:nth-child(even) { filter: brightness(.9); }.metric-bars span, .metric-list span { display: grid; place-items: center; border-radius: 50%; background: #fff; color: var(--theme); font-weight: 900; }.metric-bars span { width: 32px; height: 32px; }.metric-list { display: grid; gap: 12px; padding: 24px 0 0; margin: 0; list-style: none; }.metric-list li { display: grid; grid-template-columns: 28px 1fr auto; align-items: center; gap: 10px; }.metric-list span { width: 25px; height: 25px; background: var(--theme); color: #fff; font-size: 13px; }.metric-list strong, .metric-list small { display: block; }.metric-list small { margin-top: 3px; color: #898378; }.metric-list em { color: #8a867c; font-style: normal; font-weight: 700; }.category--safety { --theme: #ce8524; }.category--convenience { --theme: #6d7e3d; }.category--asset { --theme: #1d315b; }.evaluation-modal footer { margin-top: 18px; padding: 18px 20px; border-radius: 11px; background: #f4f0e5; color: #77736b; font-size: 13px; }
@media (max-width: 760px) { .evaluation-page { padding: 22px 12px; }.evaluation-modal { padding: 30px 18px; }.category { padding-inline: 8px; }.category-tabs div { min-height: 58px; font-size: 13px; }.metric-list { font-size: 13px; } }
</style>
