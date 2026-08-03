<template>
  <main class="social-profile-page">
    <section class="social-profile-card" aria-labelledby="social-profile-title">
      <img class="profile-logo" src="../assets/senior-downsizing-hero.png" alt="" />
      <h1 id="social-profile-title">몇 가지만 더 확인할게요</h1>

      <form class="social-profile-form" @submit.prevent="submit">
        <label for="social-name">이름</label>
        <input
          id="social-name"
          v-model.trim="name"
          name="name"
          type="text"
          autocomplete="name"
          maxlength="100"
          placeholder="이름을 입력해주세요"
          required
        />

        <label for="social-birth-year">출생연도</label>
        <div class="birth-year-picker" @focusout="handleYearPickerFocusOut" @keydown.esc="closeYearPicker">
          <div class="birth-year-control">
            <input
              id="social-birth-year"
              :value="birthYearDisplay"
              name="birthYear"
              type="text"
              autocomplete="bday-year"
              placeholder="출생연도를 선택해주세요"
              aria-label="출생연도"
              readonly
              required
              @click="toggleYearPicker"
            />
            <button
              class="birth-year-toggle"
              type="button"
              data-birth-year-toggle
              aria-label="출생연도 선택기 열기"
              title="출생연도 선택"
              aria-controls="social-year-picker"
              :aria-expanded="yearPickerOpen"
              @click="toggleYearPicker"
            >
              <CalendarDays :size="22" aria-hidden="true" />
            </button>
          </div>

          <div
            v-if="yearPickerOpen"
            id="social-year-picker"
            class="year-picker-panel"
            data-year-picker
            role="dialog"
            aria-label="출생연도 선택"
          >
            <div class="year-picker-header">
              <button
                type="button"
                data-previous-decade
                aria-label="이전 10년 보기"
                title="이전 10년"
                :disabled="visibleDecade <= minimumDecade"
                @click="moveDecade(-10)"
              >
                <ChevronLeft :size="18" aria-hidden="true" />
              </button>
              <strong>{{ visibleDecade }}년대</strong>
              <button
                type="button"
                data-next-decade
                aria-label="다음 10년 보기"
                title="다음 10년"
                :disabled="visibleDecade >= currentDecade"
                @click="moveDecade(10)"
              >
                <ChevronRight :size="18" aria-hidden="true" />
              </button>
            </div>

            <div class="year-grid">
              <button
                v-for="year in visibleYears"
                :key="year"
                type="button"
                class="year-option"
                :class="{ selected: birthYear === String(year) }"
                :data-birth-year="year"
                :disabled="year > currentYear"
                :aria-pressed="birthYear === String(year)"
                @click="selectBirthYear(year)"
              >
                {{ year }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="error" class="profile-error" role="alert">{{ error }}</p>

        <button class="profile-submit" type="submit" :disabled="submitting">
          {{ submitting ? '저장 중' : '다음' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { CalendarDays, ChevronLeft, ChevronRight } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../../stores/authStore'

const router = useRouter()
const name = ref('')
const birthYear = ref('')
const visibleDecade = ref(1960)
const yearPickerOpen = ref(false)
const error = ref('')
const submitting = ref(false)
const currentYear = new Date().getFullYear()
const currentDecade = Math.floor(currentYear / 10) * 10
const minimumDecade = 1900
const birthYearDisplay = computed(() => birthYear.value ? `${birthYear.value}년` : '')
const visibleYears = computed(() => Array.from({ length: 10 }, (_, index) => visibleDecade.value + index))

function toggleYearPicker() {
  if (!yearPickerOpen.value) {
    visibleDecade.value = birthYear.value
      ? Math.floor(Number(birthYear.value) / 10) * 10
      : 1960
  }
  yearPickerOpen.value = !yearPickerOpen.value
}

function closeYearPicker() {
  yearPickerOpen.value = false
}

function handleYearPickerFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    closeYearPicker()
  }
}

function moveDecade(amount) {
  visibleDecade.value = Math.min(
    currentDecade,
    Math.max(minimumDecade, visibleDecade.value + amount),
  )
}

function selectBirthYear(year) {
  if (year < minimumDecade || year > currentYear) return
  birthYear.value = String(year)
  closeYearPicker()
}

async function submit() {
  if (submitting.value) return

  const selectedBirthYear = Number(birthYear.value)
  if (!name.value || !selectedBirthYear) {
    error.value = '이름과 출생연도를 선택해주세요.'
    return
  }

  error.value = ''
  submitting.value = true
  try {
    await authStore.completeSocialProfile(name.value, selectedBirthYear)
    await router.replace('/main')
  } catch (e) {
    error.value = e.response?.data?.message || '추가 정보를 저장하지 못했습니다. 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.social-profile-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 38px 20px;
  background: #f8f7f4;
}

.social-profile-card {
  width: min(100%, 560px);
  min-height: 610px;
  padding: 40px 58px 52px;
  border: 1px solid #aaa69f;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(48, 43, 35, 0.08);
}

.profile-logo {
  display: block;
  width: 104px;
  height: 104px;
  margin: 0 auto 30px;
  object-fit: contain;
}

h1 {
  margin: 0 0 54px;
  color: #090909;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 900;
  text-align: center;
  letter-spacing: 0;
}

.social-profile-form {
  display: grid;
}

label {
  margin-bottom: 8px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
}

label:not(:first-child) {
  margin-top: 34px;
}

input {
  width: 100%;
  height: 54px;
  padding: 0 6px;
  border: 0;
  border-bottom: 1px solid #c3c0ba;
  border-radius: 0;
  background: #fff;
  color: #24211d;
  outline: none;
  font-size: 21px;
}

input::placeholder {
  color: #8b8a87;
  opacity: 1;
}

input:focus {
  border-bottom-color: #9a7100;
  box-shadow: 0 2px 0 #ffca00;
}

.birth-year-picker,
.birth-year-control {
  position: relative;
}

.birth-year-control input {
  padding-right: 52px;
  cursor: pointer;
}

.birth-year-toggle {
  position: absolute;
  inset: 0 2px 0 auto;
  width: 46px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #24211d;
  cursor: pointer;
}

.year-picker-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  padding: 12px;
  border: 1px solid #d8d4cc;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(50, 44, 34, 0.16);
}

.year-picker-header {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  align-items: center;
  margin-bottom: 10px;
}

.year-picker-header strong {
  text-align: center;
  font-size: 15px;
}

.year-picker-header button {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #e3ded5;
  border-radius: 6px;
  background: #fff;
  color: #575149;
  cursor: pointer;
}

.year-picker-header button:disabled,
.year-option:disabled {
  color: #bbb6ad;
  background: #f5f3ef;
  cursor: not-allowed;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.year-option {
  height: 38px;
  padding: 0;
  border: 1px solid #e3ded5;
  border-radius: 6px;
  background: #fff;
  color: #302d28;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.year-option:hover:not(:disabled),
.year-option:focus-visible {
  border-color: #d69e00;
  background: #fff8df;
}

.year-option.selected {
  border-color: #d69e00;
  background: #ffcc00;
  color: #241f17;
}

.profile-error {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #ffe8e8;
  color: #d93d3f;
  font-size: 13px;
  line-height: 1.4;
}

.profile-submit {
  width: 100%;
  height: 52px;
  margin-top: 24px;
  border-radius: 8px;
  background: #ffca00;
  color: #4a4439;
  font-size: 21px;
  font-weight: 900;
  cursor: pointer;
}

.profile-submit:hover:not(:disabled) {
  background: #f2b900;
}

.profile-submit:focus-visible,
input:focus-visible,
.birth-year-toggle:focus-visible,
.year-picker-header button:focus-visible,
.year-option:focus-visible {
  outline: 3px solid #2d7d5a;
  outline-offset: 3px;
}

@media (max-width: 620px) {
  .social-profile-page {
    place-items: start center;
    padding: 18px 14px;
  }

  .social-profile-card {
    min-height: calc(100vh - 36px);
    padding: 32px 26px 40px;
    border-radius: 20px;
  }

  .profile-logo {
    width: 86px;
    height: 86px;
    margin-bottom: 24px;
  }

  h1 {
    margin-bottom: 44px;
    font-size: 28px;
  }

  input {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  input,
  .profile-submit {
    transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
  }
}
</style>
