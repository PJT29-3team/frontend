<script setup>
defineEmits(['close'])
defineProps({
  page: { type: Boolean, default: false },
})

const categories = [
  {
    rank: '1순위', title: '주거 안전', total: '60%', theme: 'safety',
    items: [
      ['넘어짐 위험 — 엘리베이터, 경사', '30%'],
      ['의료 — 동네의원, 종합병원, 약국', '30%'],
      ['재난·침수 — 침수, 산사태 위험', '20%'],
      ['치안 — CCTV, 경찰서·지구대, 소방서', '20%'],
    ],
  },
  {
    rank: '2순위', title: '생활 편의', total: '20%', theme: 'convenience',
    items: [
      ['장보기·상권 — 편의점, 대형마트, 시장', '40%'],
      ['버스·지하철 — 정류장, 지하철역 접근성', '35%'],
      ['동네 시설 — 복지관, 은행, 공원, 요양시설', '25%'],
    ],
  },
  {
    rank: '3순위', title: '자산 안정', total: '20%', theme: 'asset',
    items: [
      ['관리비 — 관리비, 전용 사용면적, 부과관리비', '40%'],
      ['집값 수준 — 단지 공시가, 동네 평형대 비교', '30%'],
      ['팔기 쉬운 정도 — 하락장 거래건수 ÷ 5년 연평균', '30%'],
    ],
  },
]
</script>

<template>
  <div :class="page ? 'evaluation-page' : 'evaluation-backdrop'" @click.self="!page && $emit('close')">
    <section class="evaluation-modal" :class="{ 'evaluation-modal--page': page }" :role="page ? undefined : 'dialog'" :aria-modal="page ? undefined : 'true'" aria-labelledby="evaluation-title">
      <header class="evaluation-header">
        <div><button v-if="page" type="button" class="back-to-favorites" @click="$emit('close')">← 관심 매물로 돌아가기</button><h2 id="evaluation-title">평가 방법 상세보기</h2><p>어떤 기준으로, 왜 이만큼 반영했는지 알려드려요</p></div>
      </header>

      <div class="weight-summary"><span class="summary-icon" aria-hidden="true">🏠</span><p>지금 설정하신 가중치는 <strong>주거 안전 60% · 생활 편의 20% · 자산 안정 20%</strong>예요.<br />또 가장 먼저 지켜야 할 조건이라 항상 상대적으로 높은 비중을 두고, 생활과 자산은 어르신의 상황에 맞춰 비중을 나누어 가져요.</p></div>

      <div class="criteria-title">현재 반영된 비중</div>
      <section v-for="category in categories" :key="category.theme" class="category" :class="`category--${category.theme}`">
        <div class="category-label"><b>{{ category.rank }}</b><strong>{{ category.title }} (전체 비중 {{ category.total }})</strong></div>
        <div class="category-tabs"><div class="muted">주거 안전<small>60%</small></div><div class="muted">생활 편의<small>20%</small></div><div class="muted">자산 안정<small>20%</small></div></div>
        <div class="metric-bars"><div v-for="(_, index) in category.items" :key="index"><span>{{ index + 1 }}</span></div></div>
        <ul class="metric-list"><li v-for="(item, index) in category.items" :key="item[0]"><span>{{ index + 1 }}</span><strong>{{ item[0] }}</strong><em>{{ item[1] }}</em></li></ul>
      </section>
      <footer>계산식 : 시그마(항목별 가중치 * (선택한 세부사항(경사, 엘리베이터 등) 개수))/최대 * 100 (점)</footer>
    </section>
  </div>
</template>

<style scoped>
.evaluation-backdrop { position: fixed; z-index: 60; inset: 0; display: grid; place-items: center; padding: 22px; overflow-y: auto; background: rgba(25, 30, 36, .63); }.evaluation-page { min-height: calc(100vh - 204px); padding: 42px 22px; background: #f7f5ef; }.evaluation-modal { position: relative; width: min(100%, 1020px); max-height: calc(100vh - 44px); overflow-y: auto; padding: 38px 46px 48px; border-radius: 28px; background: #fffcf3; color: #3e3b35; box-shadow: 0 25px 70px rgba(0,0,0,.34); }.evaluation-modal--page { max-height: none; margin: 0 auto; box-shadow: none; border: 1px solid #ebe4d4; }.evaluation-header { padding-bottom: 18px; border-bottom: 1px solid #e5dfd2; }.back-to-favorites { margin: 0 0 20px; padding: 9px 15px; border: 1px solid #d8d1c5; border-radius: 8px; background: #fff; color: #625c54; font-size: 14px; font-weight: 700; }.back-to-favorites:hover { border-color: #b99032; background: #fffaf0; }.evaluation-header h2 { margin: 0; font-size: 23px; font-weight: 800; }.evaluation-header p { margin: 8px 0 0; color: #77736b; font-size: 15px; }.weight-summary { display: flex; align-items: flex-start; gap: 13px; margin: 14px 20px 22px; padding: 16px 20px; border-radius: 16px; background: #fff0c2; font-size: 16px; line-height: 1.5; }.weight-summary p { margin: 0; }.weight-summary strong { color: #a66f13; }.summary-icon { width: 36px; height: 36px; display: grid; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #fff; }.criteria-title { margin: 0 0 8px; font-weight: 800; }.category { padding: 0 130px 28px; }.category + .category { padding-top: 34px; border-top: 1px solid #e7e0d4; }.category-label { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; color: var(--theme); }.category-label b { padding: 5px 12px; border-radius: 999px; background: var(--theme); color: #fff; font-size: 13px; }.category-label strong { font-size: 15px; }.category-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }.category-tabs div { min-height: 76px; display: grid; place-content: center; justify-items: center; border-radius: 14px; color: #a9a69d; background: #e7e5de; text-align: center; font-size: 18px; font-weight: 700; }.category-tabs small { display: block; margin-top: 3px; font-size: 14px; font-weight: 400; }.category--safety .category-tabs div:nth-child(1), .category--convenience .category-tabs div:nth-child(2), .category--asset .category-tabs div:nth-child(3) { color: #fff; background: var(--theme); }.metric-bars { display: grid; grid-template-columns: repeat(var(--metrics), 1fr); margin-top: 46px; border-radius: 16px; overflow: hidden; outline: 3px dashed var(--theme); outline-offset: 9px; }.metric-bars div { height: 76px; display: grid; place-items: center; background: color-mix(in srgb, var(--theme) calc(52% + var(--index, 0) * 10%), #fff); }.metric-bars div:nth-child(2) { filter: brightness(.94); }.metric-bars div:nth-child(3) { filter: brightness(.86); }.metric-bars div:nth-child(4) { filter: brightness(.77); }.metric-bars span, .metric-list span { display: grid; place-items: center; width: 33px; height: 33px; border-radius: 50%; background: #fff; color: var(--theme-dark); font-weight: 900; }.metric-list { display: grid; gap: 12px; padding: 24px 0 0; margin: 0; list-style: none; }.metric-list li { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 10px; }.metric-list span { width: 26px; height: 26px; background: color-mix(in srgb, var(--theme) 85%, #fff); color: #fff; font-size: 13px; }.metric-list strong { font-size: 16px; }.metric-list em { color: #8a867c; font-style: normal; font-weight: 700; }.category--safety { --theme: #ce8524; --theme-dark: #7f4b0e; --metrics: 4; }.category--convenience { --theme: #6d7e3d; --theme-dark: #3e4d1d; --metrics: 3; }.category--asset { --theme: #1d315b; --theme-dark: #15264b; --metrics: 3; }.evaluation-modal footer { margin-top: 32px; padding: 18px 20px; border-radius: 11px; background: #f4f0e5; color: #77736b; font-size: 13px; }
@media (max-width: 760px) { .evaluation-backdrop { padding: 0; align-items: end; }.evaluation-modal { max-height: 94vh; padding: 42px 19px 28px; border-radius: 24px 24px 0 0; }.evaluation-header h2 { font-size: 20px; }.evaluation-header p { font-size: 13px; }.weight-summary { margin-inline: 0; padding: 14px; font-size: 14px; }.category { padding: 0 12px 26px; }.category + .category { padding-top: 28px; }.category-tabs div { min-height: 62px; font-size: 14px; }.metric-bars { margin-top: 35px; }.metric-bars div { height: 57px; }.metric-list strong { font-size: 13px; }.metric-list em { font-size: 13px; }.evaluation-modal footer { font-size: 11px; } }
</style>
