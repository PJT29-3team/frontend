<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({ initialAddress: { type: String, default: '' } })
const emit = defineEmits(['close', 'save'])
const address = ref(props.initialAddress)
const hasMortgage = ref(false)
const mortgageBalance = ref('')
const dialog = ref(null)

function close() { emit('close') }
function submitHome() {
  if (!address.value.trim() || (hasMortgage.value && !mortgageBalance.value.trim())) return
  emit('save', { address: address.value.trim(), hasMortgage: hasMortgage.value, mortgageBalance: mortgageBalance.value.trim() })
}
function handleEscape(event) { if (event.key === 'Escape') close() }
onMounted(async () => { document.addEventListener('keydown', handleEscape); await nextTick(); dialog.value?.focus() })
onBeforeUnmount(() => document.removeEventListener('keydown', handleEscape))
</script>

<template>
  <div class="modal-backdrop" @click.self="close">
    <section ref="dialog" class="home-edit-modal" role="dialog" aria-modal="true" aria-labelledby="home-edit-title" tabindex="-1">
      <button class="modal-close" type="button" aria-label="수정 창 닫기" @click="close">×</button>
      <header><span>우리집 수정</span><h1 id="home-edit-title">현재 살고있는 집의 <em>주거지 정보</em>를 입력해주세요</h1></header>
      <form @submit.prevent="submitHome">
        <section class="form-section"><label for="home-address">1. 주소 검색</label><div class="address-field"><input id="home-address" v-model="address" type="text" placeholder="예: 서울시 강남구 테헤란로 123" autocomplete="street-address" /><span aria-hidden="true">⌕</span></div><p>주소를 선택하면 예상 시세가 자동으로 표시돼요</p></section>
        <section class="form-section mortgage-section"><h2>2. 대출 정보</h2><div class="loan-toggle" role="group" aria-label="대출 정보 선택"><button type="button" :class="{ selected: !hasMortgage }" @click="hasMortgage = false">없음</button><button type="button" :class="{ selected: hasMortgage }" @click="hasMortgage = true">있음</button></div><input v-if="hasMortgage" v-model="mortgageBalance" class="mortgage-input" type="text" inputmode="numeric" placeholder="대출 잔액 (예: 2억원)" /></section>
        <p class="privacy-note">입력하신 정보는 세금 계산에만 사용되며 안전하게 보관돼요</p><button class="submit-button" type="submit">수정 완료하기</button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.modal-backdrop { position: fixed; z-index: 40; inset: 0; display: grid; place-items: center; padding: 24px; background: rgba(47,45,41,.48); }.home-edit-modal { position: relative; width: min(920px,100%); max-height: min(850px,calc(100vh - 48px)); overflow-y: auto; padding: clamp(28px,4.2vw,48px); border-radius: 24px; background: #fff; box-shadow: 0 20px 60px rgba(30,28,24,.28); outline: none; }.modal-close { position: absolute; top: 20px; right: 24px; padding: 4px 9px; background: transparent; color: #77736b; font-size: 32px; line-height: 1; }.home-edit-modal header > span { color: #966018; font-weight: 900; }.home-edit-modal h1 { margin: 12px 0 44px; color: #252b37; font-size: clamp(26px,3vw,37px); letter-spacing: -.04em; white-space: nowrap; }.home-edit-modal em { color: #966018; font-style: normal; }.form-section { margin-top: 30px; }.form-section label,.form-section h2 { display: block; margin: 0 0 13px; color: #263142; font-size: 20px; }.address-field { display: flex; align-items: center; gap: 12px; height: 66px; padding: 0 20px; border: 2px solid #e8e9eb; border-radius: 17px; }.address-field:focus-within { border-color: #ffcc00; }.address-field input,.mortgage-input { width: 100%; border: 0; outline: 0; color: #2f2d29; font-size: 18px; }.address-field input::placeholder,.mortgage-input::placeholder { color: #8991a0; }.address-field span { color: #667084; font-size: 31px; }.form-section > p { margin: 9px 4px 0; color: #7d8796; font-size: 15px; }.loan-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }.loan-toggle button { height: 64px; border: 2px solid #e8e9eb; border-radius: 17px; background: #fff; color: #222b38; font-size: 19px; font-weight: 800; }.loan-toggle button.selected { border-color: #ffcc00; background: #ffcc00; color: #171717; }.mortgage-input { height: 64px; margin-top: 14px; padding: 0 20px; border: 2px solid #e8e9eb; border-radius: 17px; }.privacy-note { margin: 44px 0 20px; color: #8991a0; text-align: center; font-size: 15px; }.submit-button { width: 100%; height: 66px; border-radius: 17px; background: #ffcc00; box-shadow: 0 10px 18px rgba(158,106,0,.22); color: #111; font-size: 21px; font-weight: 900; }@media (max-width: 760px) { .home-edit-modal h1 { white-space: normal; } }@media (max-width: 600px) { .modal-backdrop { padding: 12px; }.home-edit-modal { max-height: calc(100vh - 24px); padding: 30px 20px; border-radius: 18px; }.home-edit-modal h1 { margin-bottom: 32px; }.loan-toggle { gap: 10px; }.loan-toggle button,.address-field,.mortgage-input { height: 58px; border-radius: 14px; }.privacy-note { margin-top: 35px; font-size: 13px; } }
</style>
