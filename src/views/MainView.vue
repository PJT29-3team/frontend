<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Heart, X } from '@lucide/vue'

const router = useRouter()
const selectedIndex = ref(0)
const homes = ref([
  { name: '아름동 한마을(선경)', area: '새롬동', safety: '우수', convenience: '우수', asset: '우수', size: '24평', price: '3억 5,030만원', balance: '약 1억 5650만원' },
  { name: '풍림아이원플러스', area: '보람동', safety: '보통', convenience: '보통', asset: '보통', size: '23평', price: '3억 3,800만원', balance: '약 1억 6,376만원' },
  { name: '인텔리젼스IA', area: '전의동', safety: '보통', convenience: '우수', asset: '미흡', size: '25평', price: '2억 9,500만원', balance: '약 2억 7,402만원' },
])
const pendingRemoval = ref(null)

const selectedHome = computed(() => homes.value[selectedIndex.value])
const gridStyle = computed(() => ({ gridTemplateColumns: `1.2fr repeat(${homes.value.length}, 1fr)` }))
const gradeClass = (grade) => ({ 'grade--good': grade === '우수', 'grade--normal': grade === '보통', 'grade--weak': grade === '미흡' })

function requestRemoval(home) {
  pendingRemoval.value = home
}

function cancelRemoval() {
  pendingRemoval.value = null
}

function confirmRemoval() {
  const removingIndex = homes.value.findIndex((home) => home.name === pendingRemoval.value?.name)
  if (removingIndex < 0) return

  homes.value.splice(removingIndex, 1)
  if (selectedIndex.value >= homes.value.length) {
    selectedIndex.value = Math.max(0, homes.value.length - 1)
  }
  pendingRemoval.value = null
}
</script>

<template>
  <main class="favorite-page">
    <section class="favorite-heading">
      <h1>담아두신 3곳을 상세하게 비교해보고, 한 곳을 골라주세요</h1>
      <button type="button" class="criteria-link" @click="router.push('/evaluation-method')">평가 방법 상세보기 <span>→</span></button>
    </section>

    <section v-if="homes.length" class="comparison" aria-label="관심 매물 비교">
      <div class="comparison-grid comparison-grid--names" :style="gridStyle">
        <div class="row-title row-title--empty"></div>
        <div v-for="home in homes" :key="home.name" class="home-name" :class="{ 'is-selected': home === selectedHome }">
          <div class="home-name__title"><strong>{{ home.name }}</strong><button type="button" class="favorite-remove" :aria-label="`${home.name} 관심 매물 해제`" @click="requestRemoval(home)"><Heart :size="19" fill="currentColor" aria-hidden="true" /></button></div><small>{{ home.area }}</small>
        </div>
      </div>
      <div class="comparison-grid comparison-grid--body" :style="gridStyle">
        <div class="row-title">주거 안전</div>
        <div v-for="home in homes" :key="`${home.name}-safety`" class="value-cell" :class="{ 'is-selected': home === selectedHome }"><span class="grade" :class="gradeClass(home.safety)"><i></i>{{ home.safety }}</span></div>
        <div class="row-title">생활 편의</div>
        <div v-for="home in homes" :key="`${home.name}-convenience`" class="value-cell" :class="{ 'is-selected': home === selectedHome }"><span class="grade" :class="gradeClass(home.convenience)"><i></i>{{ home.convenience }}</span></div>
        <div class="row-title">자산 안정</div>
        <div v-for="home in homes" :key="`${home.name}-asset`" class="value-cell" :class="{ 'is-selected': home === selectedHome }"><span class="grade" :class="gradeClass(home.asset)"><i></i>{{ home.asset }}</span></div>
        <div class="row-title">평수</div>
        <div v-for="home in homes" :key="`${home.name}-size`" class="value-cell" :class="{ 'is-selected': home === selectedHome }">{{ home.size }}</div>
        <div class="row-title">매수 금액 (세금포함)</div>
        <div v-for="home in homes" :key="`${home.name}-price`" class="value-cell" :class="{ 'is-selected': home === selectedHome }">{{ home.price }}</div>
        <div class="row-title">이사후 여유자금</div>
        <div v-for="home in homes" :key="`${home.name}-balance`" class="value-cell value-cell--balance" :class="{ 'is-selected': home === selectedHome }">{{ home.balance }}</div>
      </div>
      <div class="select-grid" :style="gridStyle">
        <div></div>
        <button v-for="(home, index) in homes" :key="`${home.name}-select`" type="button" :class="{ 'is-selected': index === selectedIndex }" @click="selectedIndex = index">{{ index === selectedIndex ? '✓ 선택함' : '이 집 선택' }}</button>
      </div>
    </section>
    <section v-else class="empty-favorites" aria-live="polite"><Heart :size="38" aria-hidden="true" /><h2>관심 매물이 없습니다</h2><p>추천 매물에서 마음에 드는 집을 관심 목록에 담아보세요.</p><button type="button" @click="router.push('/process/recommended')">추천 매물 보러 가기</button></section>

    <footer class="favorite-footer">
      <button type="button" class="back-button" @click="router.push('/process/recommended')">← 추천 매물 다시 보기</button>
      <div v-if="selectedHome" class="footer-next"><span>{{ selectedHome.name }}을 선택함</span><button type="button">이대로 금융상품 알아보기&nbsp; →</button></div>
    </footer>
    <p class="disclaimer">본 점수는 입력한 조건과 공공데이터를 활용한 매물 간 비교지표입니다. 주택의 가격 적정성, 관리관계, 실제 시설 상태 또는 거래 안전성을 보증하지 않습니다.</p>

    <div v-if="pendingRemoval" class="modal-backdrop" @click.self="cancelRemoval">
      <section class="remove-modal" role="dialog" aria-modal="true" aria-labelledby="remove-title">
        <button type="button" class="modal-close" aria-label="해제 안내 닫기" @click="cancelRemoval"><X :size="27" aria-hidden="true" /></button>
        <div class="modal-heart" aria-hidden="true"><Heart :size="58" fill="currentColor" /></div>
        <h2 id="remove-title"><strong>{{ pendingRemoval.name }}</strong>을/를<br />관심 목록에서 해제할까요?</h2>
        <p>해제하면 비교 목록에서도 함께 사라져요.<br />나중에 다시 관심 등록할 수 있어요.</p>
        <div class="modal-actions"><button type="button" class="cancel-removal" @click="cancelRemoval">아니요</button><button type="button" class="confirm-removal" @click="confirmRemoval">네, 해제할게요</button></div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.favorite-page { width: min(1240px, calc(100% - 72px)); margin: 0 auto; padding: 74px 0 26px; color: #5a564d; }.favorite-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 54px; }.favorite-heading h1 { margin: 0; color: #545045; font-size: clamp(24px, 2.05vw, 31px); font-weight: 900; letter-spacing: -.05em; }.criteria-link { border: 0; border-bottom: 1px solid #57524a; background: transparent; color: #59544c; padding: 3px 0; font-size: 16px; }.criteria-link span { margin-left: 8px; font-size: 22px; }.comparison { overflow: hidden; border: 1px solid #e4e0d8; border-radius: 13px; }.comparison-grid, .select-grid { display: grid; }.comparison-grid--names { min-height: 112px; align-items: end; border-bottom: 1px solid #e9e6df; }.home-name { min-height: 112px; display: grid; place-content: center; justify-items: center; gap: 6px; padding: 12px; text-align: center; }.home-name__title { display: flex; align-items: center; justify-content: center; gap: 7px; }.home-name strong { font-size: 18px; }.home-name small { color: #8d887f; font-size: 14px; }.favorite-remove { display: grid; place-items: center; width: 30px; height: 30px; border: 0; border-radius: 50%; background: #fff4cc; color: #e6a000; }.favorite-remove:hover { background: #ffcc00; color: #725000; }.is-selected { background: #fffcf0; border-left: 2px solid #ffb800 !important; border-right: 2px solid #ffb800 !important; }.comparison-grid--body { grid-auto-rows: 51px; }.row-title, .value-cell { display: flex; align-items: center; justify-content: center; border-bottom: 1px solid #e9e6df; font-size: 16px; }.row-title { justify-content: flex-start; padding-left: 28px; color: #4c4841; font-weight: 700; }.value-cell { padding: 8px; text-align: center; }.value-cell--balance { font-weight: 800; }.grade { min-width: 68px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 5px 12px; border-radius: 999px; font-size: 13px; }.grade i { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }.grade--good { background: #e5f5d9; color: #468733; }.grade--normal { background: #fff0c9; color: #a37113; }.grade--weak { background: #efeeec; color: #918d87; }.select-grid { margin-top: 16px; padding-bottom: 0; gap: 0; }.select-grid button { height: 45px; margin: 0 10px; border: 1px solid #ddd8d0; border-radius: 9px; background: #fff; color: #5e584f; font-size: 15px; }.select-grid button.is-selected { border-color: #ffb800; background: #ffbb08; color: #3a321f; font-weight: 800; }.empty-favorites { display: grid; justify-items: center; gap: 12px; padding: 84px 20px; border: 1px solid #e4e0d8; border-radius: 13px; color: #a27617; text-align: center; }.empty-favorites h2 { margin: 0; color: #545045; }.empty-favorites p { margin: 0; color: #77736b; }.empty-favorites button { margin-top: 14px; padding: 13px 22px; border-radius: 8px; background: #ffbb08; color: #342e22; font-weight: 800; }.favorite-footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 54px; padding-top: 22px; border-top: 1px solid #ebe7df; }.back-button { height: 50px; padding: 0 25px; border: 1px solid #d9d2c6; border-radius: 9px; background: #fff; color: #625c54; font-size: 15px; }.footer-next { display: flex; align-items: center; gap: 22px; color: #918b80; font-size: 14px; }.footer-next button { height: 50px; padding: 0 27px; border-radius: 10px; background: #ffbb08; color: #342e22; font-size: 15px; font-weight: 800; }.disclaimer { margin: 16px 0 0; color: #a19a8d; font-size: 12px; line-height: 1.55; }.modal-backdrop { position: fixed; z-index: 50; inset: 0; display: grid; place-items: center; padding: 24px; background: rgba(28, 27, 24, .53); }.remove-modal { position: relative; width: min(100%, 760px); padding: 64px 48px 48px; border-radius: 30px; background: #fff; box-shadow: 0 20px 55px rgba(0,0,0,.28); text-align: center; }.modal-close { position: absolute; top: 21px; right: 21px; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: transparent; color: #8c887f; }.modal-heart { width: 132px; height: 132px; display: grid; place-items: center; margin: 0 auto 34px; border-radius: 50%; background: #fff6cf; color: #ffba00; }.remove-modal h2 { margin: 0; color: #2f2d29; font-size: clamp(28px, 3vw, 46px); line-height: 1.3; letter-spacing: -.055em; }.remove-modal h2 strong { display: inline; }.remove-modal p { margin: 24px 0 42px; color: #5e6674; font-size: clamp(18px, 2vw, 28px); line-height: 1.45; }.modal-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.modal-actions button { min-height: 76px; border-radius: 18px; font-size: clamp(20px, 2.3vw, 34px); font-weight: 800; }.cancel-removal { border: 1px solid #a9a9a9; background: #fff; color: #5b574f; }.confirm-removal { background: #ffcc00; color: #4c483e; box-shadow: 0 9px 12px rgba(58,44,17,.23); }
@media (max-width: 760px) { .favorite-page { width: min(100% - 28px, 620px); padding-top: 36px; }.favorite-heading { display: grid; margin-bottom: 28px; }.criteria-link { justify-self: start; }.comparison { overflow-x: auto; }.comparison-grid, .select-grid { min-width: 700px; }.home-name strong { font-size: 14px; }.row-title { padding-left: 12px; font-size: 14px; }.value-cell { font-size: 13px; }.favorite-footer, .footer-next { align-items: stretch; flex-direction: column; }.footer-next { gap: 10px; }.disclaimer { font-size: 11px; }.remove-modal { padding: 54px 20px 24px; border-radius: 22px; }.modal-heart { width: 96px; height: 96px; margin-bottom: 24px; }.modal-actions { gap: 10px; }.modal-actions button { min-height: 60px; border-radius: 12px; }.remove-modal p { margin-bottom: 28px; } }
</style>
