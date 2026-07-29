<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const address = ref('')
const hasMortgage = ref(false)
const mortgageBalance = ref('')
const submitted = ref(false)
const canSubmit = computed(() => address.value.trim() && (!hasMortgage.value || mortgageBalance.value.trim()))

function submitHome() {
  if (canSubmit.value) submitted.value = true
}
</script>

<template>
  <section class="home-edit-page">
    <form class="home-edit-card" @submit.prevent="submitHome">
      <button class="back-button" type="button" @click="router.push('/homes/current')">← 등록으로</button>
      <h1>현재 살고있는 집의 <em>주거지 정보</em>를 입력해주세요</h1>

      <section class="form-section">
        <label for="home-address">1. 주소 검색</label>
        <div class="address-field">
          <input id="home-address" v-model="address" type="text" placeholder="예: 서울시 강남구 테헤란로 123" autocomplete="street-address" />
          <span aria-hidden="true">⌕</span>
        </div>
        <p>주소를 선택하면 예상 시세가 자동으로 표시돼요</p>
      </section>

      <section class="form-section mortgage-section">
        <h2>2. 대출 정보</h2>
        <div class="loan-toggle" role="group" aria-label="대출 정보 선택">
          <button type="button" :class="{ selected: !hasMortgage }" @click="hasMortgage = false">없음</button>
          <button type="button" :class="{ selected: hasMortgage }" @click="hasMortgage = true">있음</button>
        </div>
        <input v-if="hasMortgage" v-model="mortgageBalance" class="mortgage-input" type="text" inputmode="numeric" placeholder="대출 잔액 (예: 2억원)" />
      </section>

      <p class="privacy-note">입력하신 정보는 세금 계산에만 사용되며 안전하게 보관돼요</p>
      <p v-if="submitted" class="success-message" role="status">현재주택 정보가 저장되었습니다.</p>
      <button class="submit-button" type="submit" :disabled="!canSubmit">등록 완료하기</button>
    </form>
  </section>
</template>

<style scoped>
.home-edit-page { min-height: calc(100vh - 182px); padding: clamp(28px, 5vw, 72px) 24px; background: #f8f8f6; }.home-edit-card { width: min(100%, 1040px); margin: 0 auto; padding: clamp(30px, 5vw, 66px); border-radius: 28px; background: #fff; box-shadow: 0 18px 35px rgba(47,45,41,.1); }.back-button { padding: 10px 18px; border: 1px solid #e5e3de; border-radius: 999px; background: #fff; color: #545045; font-size: 16px; font-weight: 700; }.home-edit-card h1 { margin: 56px 0 66px; color: #252b37; font-size: clamp(28px,3.2vw,45px); letter-spacing: -.04em; }.home-edit-card em { color: #966018; font-style: normal; }.form-section { margin-top: 42px; }.form-section label,.form-section h2 { display: block; margin: 0 0 16px; color: #263142; font-size: 22px; }.address-field { display: flex; align-items: center; gap: 12px; height: 74px; padding: 0 22px 0 30px; border: 2px solid #e8e9eb; border-radius: 20px; }.address-field:focus-within { border-color: #ffcc00; }.address-field input,.mortgage-input { width: 100%; border: 0; outline: 0; color: #2f2d29; font-size: 22px; }.address-field input::placeholder,.mortgage-input::placeholder { color: #8991a0; }.address-field span { color: #667084; font-size: 38px; }.form-section > p { margin: 12px 4px 0; color: #7d8796; font-size: 17px; }.loan-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }.loan-toggle button { height: 74px; border: 2px solid #e8e9eb; border-radius: 20px; background: #fff; color: #222b38; font-size: 22px; font-weight: 800; }.loan-toggle button.selected { border-color: #ffcc00; background: #ffcc00; color: #171717; }.mortgage-input { height: 74px; margin-top: 18px; padding: 0 30px; border: 2px solid #e8e9eb; border-radius: 20px; }.privacy-note { margin: 78px 0 28px; color: #8991a0; text-align: center; font-size: 17px; }.success-message { margin: 0 0 14px; color: #3b9361; text-align: center; font-weight: 700; }.submit-button { width: 100%; height: 78px; border-radius: 20px; background: #ffcc00; box-shadow: 0 12px 20px rgba(158,106,0,.25); color: #111; font-size: 24px; font-weight: 900; }.submit-button:disabled { background: #e8e4d8; box-shadow: none; color: #9c978c; }@media (max-width: 720px) { .home-edit-page { min-height: calc(100vh - 165px); padding: 24px 16px; }.home-edit-card { padding: 28px 20px; border-radius: 22px; }.home-edit-card h1 { margin: 42px 0 48px; }.form-section { margin-top: 30px; }.form-section label,.form-section h2 { font-size: 19px; }.address-field,.loan-toggle button,.mortgage-input { height: 62px; border-radius: 16px; }.address-field { padding-left: 18px; }.address-field input,.mortgage-input { font-size: 17px; }.loan-toggle { gap: 10px; }.loan-toggle button { font-size: 18px; }.privacy-note { margin-top: 52px; font-size: 14px; }.submit-button { height: 64px; border-radius: 16px; font-size: 20px; } }
</style>
