<template>
  <MemberPageLayout action-label="로그인" action-to="/login">
    <section class="signup-content" aria-labelledby="signup-title">
      <div class="signup-panel">
        <h1 id="signup-title">회원가입</h1>

        <form class="signup-form" novalidate @submit.prevent="submit">
          <div class="field-group">
            <label for="signup-email-local">이메일</label>
            <div class="email-row">
              <input
                id="signup-email-local"
                v-model.trim="emailLocal"
                name="emailLocal"
                autocomplete="username"
                placeholder="email"
                :readonly="Boolean(verification)"
                :class="{ invalid: attempted && !isEmailValid }"
              />
              <span aria-hidden="true">@</span>
              <select
                v-model="emailDomain"
                name="emailDomain"
                aria-label="이메일 도메인"
                :disabled="Boolean(verification)"
                :class="{ invalid: attempted && !isEmailValid }"
              >
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="kakao.com">kakao.com</option>
                <option value="example.com">example.com</option>
              </select>
              <button
                class="verify-button"
                type="button"
                data-request-verification
                :disabled="!isEmailValid || submitting || Boolean(verification)"
                @click="requestVerification"
              >
                {{ verification ? '완료' : requestingVerification ? '전송 중' : '인증' }}
              </button>
            </div>
            <p v-if="verification" class="field-message success">이메일 인증이 완료되었습니다.</p>
            <p v-else-if="verificationMessage" class="field-message" :class="verificationError ? 'danger' : 'success'">
              {{ verificationMessage }}
            </p>
            <p v-else-if="attempted && !isEmailValid" class="field-message danger">이메일 주소를 입력해주세요.</p>
          </div>

          <div class="field-group">
            <label for="signup-password">비밀번호</label>
            <div class="password-input">
              <input
                id="signup-password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                :class="{ invalid: (attempted || password) && !isPasswordValid }"
              />
              <button
                type="button"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="17" aria-hidden="true" />
                <Eye v-else :size="17" aria-hidden="true" />
              </button>
            </div>
            <p v-if="password && isPasswordValid" class="field-message success">사용 가능한 비밀번호입니다.</p>
            <p v-else-if="attempted || password" class="field-message danger">영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.</p>
          </div>

          <div class="field-group">
            <label for="signup-password-confirm">비밀번호 확인</label>
            <input
              id="signup-password-confirm"
              v-model="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autocomplete="new-password"
              :class="{ invalid: (attempted || passwordConfirm) && !isPasswordMatched }"
            />
            <p v-if="passwordConfirm && isPasswordMatched" class="field-message success">비밀번호가 일치합니다.</p>
            <p v-else-if="attempted || passwordConfirm" class="field-message danger">비밀번호가 일치하지 않습니다.</p>
          </div>

          <div class="field-group">
            <label for="signup-name">이름</label>
            <input
              id="signup-name"
              v-model.trim="name"
              name="name"
              autocomplete="name"
              :class="{ invalid: attempted && !isNameValid }"
            />
            <p v-if="attempted && !isNameValid" class="field-message danger">이름을 입력해주세요.</p>
          </div>

          <div class="field-group">
            <label for="signup-birth-year">출생연도</label>
            <div class="birth-year-picker" @focusout="handleYearPickerFocusOut" @keydown.esc="closeYearPicker">
              <div class="birth-year-control">
                <input
                  id="signup-birth-year"
                  :value="birthYearDisplay"
                  name="birthYear"
                  type="text"
                  autocomplete="bday-year"
                  placeholder="출생연도를 선택해주세요"
                  aria-label="출생연도"
                  :class="{ invalid: attempted && !isBirthYearValid }"
                  readonly
                  @click="toggleYearPicker"
                />
                <button
                  class="birth-year-toggle"
                  type="button"
                  data-birth-year-toggle
                  aria-label="출생연도 선택기 열기"
                  title="출생연도 선택"
                  aria-controls="signup-year-picker"
                  :aria-expanded="yearPickerOpen"
                  @click="toggleYearPicker"
                >
                  <CalendarDays :size="18" aria-hidden="true" />
                </button>
              </div>

              <div
                v-if="yearPickerOpen"
                id="signup-year-picker"
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
            <p v-if="attempted && !isBirthYearValid" class="field-message danger">출생연도를 확인해주세요.</p>
          </div>

          <div class="field-group">
            <label for="signup-phone">전화번호</label>
            <input
              id="signup-phone"
              :value="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputmode="numeric"
              autocomplete="tel"
              maxlength="13"
              placeholder="010-0000-0000"
              :class="{ invalid: attempted && !isPhoneValid }"
              @input="handlePhoneInput"
            />
            <p v-if="attempted && !isPhoneValid" class="field-message danger">전화번호 양식이 올바르지 않습니다.</p>
          </div>

          <p v-if="signupError" class="submit-error" aria-live="polite">{{ signupError }}</p>
          <button class="signup-submit" type="submit" :disabled="submitting">
            {{ submitting ? '가입 중' : '가입하기' }}
          </button>
        </form>
      </div>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import { CalendarDays, ChevronLeft, ChevronRight, Eye, EyeOff } from '@lucide/vue'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { checkEmailAvailability, signup } from '../../api/authApi.js'
import MemberPageLayout from '../components/MemberPageLayout.vue'

const router = useRouter()
const storedVerification = getSignupVerification()
const verification = ref(storedVerification)
const storedEmailParts = storedVerification?.email?.split('@') || []
const emailLocal = ref(storedEmailParts[0] || '')
const emailDomain = ref(storedEmailParts[1] || 'gmail.com')
const password = ref('')
const passwordConfirm = ref('')
const name = ref('')
const birthYear = ref('')
const visibleDecade = ref(1960)
const yearPickerOpen = ref(false)
const phoneNumber = ref('')
const showPassword = ref(false)
const requestingVerification = ref(false)
const submitting = ref(false)
const attempted = ref(false)
const verificationMessage = ref('')
const verificationError = ref(false)
const signupError = ref('')

const currentYear = new Date().getFullYear()
const currentDecade = Math.floor(currentYear / 10) * 10
const minimumDecade = 1900

const email = computed(() => `${emailLocal.value}@${emailDomain.value}`)
const isEmailValid = computed(() => emailLocal.value.length > 0 && emailDomain.value.length > 0)
const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,72}$/
const phonePattern = /^01[016789]-\d{3,4}-\d{4}$/
const isPasswordValid = computed(() => strongPasswordPattern.test(password.value))
const isPasswordMatched = computed(() => Boolean(password.value) && password.value === passwordConfirm.value)
const isNameValid = computed(() => name.value.length > 0 && name.value.length <= 100)
const birthYearDisplay = computed(() => birthYear.value ? `${birthYear.value}년` : '')
const visibleYears = computed(() => Array.from({ length: 10 }, (_, index) => visibleDecade.value + index))
const isBirthYearValid = computed(() =>
  /^\d{4}$/.test(birthYear.value) &&
  Number(birthYear.value) >= 1900 &&
  Number(birthYear.value) <= currentYear
)
const isPhoneValid = computed(() => phonePattern.test(phoneNumber.value))
const isValid = computed(() =>
  Boolean(verification.value) &&
  isEmailValid.value &&
  isPasswordValid.value &&
  isPasswordMatched.value &&
  isNameValid.value &&
  isBirthYearValid.value &&
  isPhoneValid.value
)

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

function handlePhoneInput(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    phoneNumber.value = digits
  } else if (digits.length <= 7) {
    phoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else if (digits.length <= 10) {
    phoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  } else {
    phoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  event.target.value = phoneNumber.value
}

async function requestVerification() {
  if (!isEmailValid.value || requestingVerification.value || verification.value) return

  verificationMessage.value = '인증 메일을 보냈습니다.'
  verificationError.value = false
  requestingVerification.value = true
  try {
    const response = await requestSignupEmailVerification(email.value)
    verificationMessage.value = response.message || '인증 메일을 보냈습니다.'
  } catch (error) {
    verificationError.value = true
    verificationMessage.value = error.response?.data?.message || '인증 메일을 보내지 못했습니다.'
  } finally {
    requestingVerification.value = false
  }
}

async function submit() {
  attempted.value = true
  signupError.value = ''
  if (!isValid.value || submitting.value) return

  submitting.value = true
  try {
    await signup({
      email: verification.value.email,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      name: name.value,
      birthYear: Number(birthYear.value),
      phoneNumber: phoneNumber.value,
      signupCompletionToken: verification.value.signupCompletionToken,
    })
    clearSignupVerification()
    await router.push('/login/email')
  } catch (error) {
    signupError.value = error.response?.data?.message || '회원가입을 완료하지 못했습니다.'
  } finally {
    submitting.value = false
  }
}

</script>

<style scoped>
.signup-content {
  display: grid;
  place-items: start center;
  padding: 32px 24px 38px;
}

.signup-panel {
  width: min(100%, 390px);
}

h1 {
  margin: 0 0 24px;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 800;
}

.signup-form {
  display: grid;
  gap: 10px;
}

.field-group {
  display: grid;
  gap: 4px;
}

label {
  font-size: 11px;
  font-weight: 800;
}

input,
select {
  width: 100%;
  height: 36px;
  padding: 0 11px;
  border: 1px solid #d8d4cc;
  border-radius: 6px;
  background: #fff;
  color: #302d28;
  outline: none;
}

input:focus,
select:focus {
  border-color: #d69e00;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

input.invalid,
select.invalid {
  border-color: #ff554f;
}

input[readonly],
select:disabled {
  background: #f8f7f4;
  color: #75716a;
  opacity: 1;
}

.email-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(112px, 136px) 74px;
  align-items: center;
  gap: 7px;
}

.email-row > span {
  color: #77726a;
  font-weight: 700;
}

.verify-button,
.signup-submit {
  border-radius: 6px;
  background: #ffbf00;
  color: #241f17;
  font-weight: 800;
  white-space: nowrap;
}

.verify-button {
  height: 36px;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 44px;
}

.birth-year-picker {
  position: relative;
}

.birth-year-control {
  position: relative;
}

.birth-year-control input {
  padding-right: 44px;
  cursor: pointer;
}

.birth-year-control input[readonly] {
  background: #fff;
  color: #302d28;
}

.birth-year-toggle {
  position: absolute;
  inset: 0 3px 0 auto;
  width: 40px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #655f57;
}

.year-picker-panel {
  position: absolute;
  z-index: 20;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  padding: 10px;
  border: 1px solid #d8d4cc;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 24px rgba(50, 44, 34, 0.15);
}

.year-picker-header {
  display: grid;
  grid-template-columns: 34px 1fr 34px;
  align-items: center;
  margin-bottom: 8px;
}

.year-picker-header strong {
  text-align: center;
  font-size: 13px;
}

.year-picker-header button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid #e3ded5;
  border-radius: 6px;
  background: #fff;
  color: #575149;
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
  gap: 6px;
}

.year-option {
  height: 36px;
  padding: 0;
  border: 1px solid #e3ded5;
  border-radius: 6px;
  background: #fff;
  color: #302d28;
  font-size: 12px;
  font-weight: 700;
}

.year-option:hover:not(:disabled),
.year-option:focus-visible {
  border-color: #d69e00;
  background: #fff8df;
}

.year-option.selected {
  border-color: #d69e00;
  background: #ffbf00;
  color: #241f17;
}

.password-input button {
  position: absolute;
  inset: 0 3px 0 auto;
  width: 40px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #756f67;
}

.field-message {
  margin: 0;
  font-size: 10px;
  line-height: 1.25;
  font-weight: 700;
}

.field-message.success {
  color: #16a05d;
}

.field-message.danger,
.submit-error {
  color: #ee443d;
}

.submit-error {
  margin: 0;
  font-size: 10px;
  font-weight: 700;
}

.signup-submit {
  width: 100%;
  height: 42px;
  margin-top: 3px;
  font-size: 13px;
}

button:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.4);
  outline-offset: 2px;
}

@media (max-width: 560px) {
  .signup-content {
    padding: 38px 18px 52px;
  }

  h1 {
    margin-bottom: 28px;
    font-size: 24px;
  }

  .email-row {
    grid-template-columns: minmax(0, 1fr) auto minmax(104px, 1fr);
  }

  .verify-button {
    grid-column: 1 / -1;
  }
}
</style>
