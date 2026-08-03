<template>
  <div class="signup-page">
    <LoginHeader />

    <main class="signup-main">
      <section class="signup-panel" aria-labelledby="signup-title">
        <h1 id="signup-title">회원가입</h1>

        <form class="signup-form" novalidate @submit.prevent="submit">
          <div class="form-group">
            <label for="signup-email-local">이메일</label>
            <div class="email-row">
              <input
                id="signup-email-local"
                v-model.trim="emailLocal"
                name="emailLocal"
                autocomplete="username"
                placeholder="email"
              />
              <span aria-hidden="true">@</span>
              <select v-model="emailDomain" name="emailDomain" aria-label="이메일 도메인">
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="kakao.com">kakao.com</option>
                <option value="example.com">example.com</option>
              </select>
              <button
                type="button"
                class="email-check-button"
                data-check-email
                :disabled="checkingEmail || !isEmailFormatValid"
                @click="checkEmail"
              >
                {{ checkingEmail ? '확인 중' : '인증' }}
              </button>
            </div>
            <p
              v-if="emailCheckMessage"
              class="field-message"
              :class="emailAvailable ? 'success' : 'danger'"
            >
              {{ emailCheckMessage }}
            </p>
          </div>

          <div class="form-group">
            <label for="signup-password">비밀번호</label>
            <div class="password-field">
              <input
                id="signup-password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="영문, 숫자, 특수문자 포함 8~72자"
              />
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" aria-hidden="true" />
                <Eye v-else :size="18" aria-hidden="true" />
              </button>
            </div>
            <p v-if="password" class="field-message" :class="isPasswordValid ? 'success' : 'danger'">
              {{ isPasswordValid ? '사용 가능한 비밀번호입니다.' : PASSWORD_RULE_MESSAGE }}
            </p>
          </div>

          <div class="form-group">
            <label for="signup-password-confirm">비밀번호 확인</label>
            <input
              id="signup-password-confirm"
              v-model="passwordConfirm"
              name="passwordConfirm"
              type="password"
              autocomplete="new-password"
              placeholder="비밀번호를 다시 입력해주세요"
            />
            <p
              v-if="passwordConfirm"
              class="field-message"
              :class="isPasswordMatched ? 'success' : 'danger'"
            >
              {{ isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 서로 일치하지 않습니다.' }}
            </p>
          </div>

          <div class="form-group">
            <label for="signup-name">이름</label>
            <input
              id="signup-name"
              v-model.trim="name"
              name="name"
              autocomplete="name"
              placeholder="이름을 입력해주세요"
            />
          </div>

          <div class="form-group">
            <label for="signup-birth-date">나이</label>
            <input
              id="signup-birth-date"
              v-model="birthDate"
              name="birthDate"
              type="date"
              min="1900-01-01"
              :max="maxBirthDate"
              aria-label="생년월일 선택"
              @focus="setDefaultBirthDate"
            />
            <p v-if="birthDate" class="field-message" :class="isBirthDateValid ? 'success' : 'danger'">
              {{ isBirthDateValid ? '선택한 생년월일입니다.' : '생년월일을 확인해주세요.' }}
            </p>
          </div>

          <div class="form-group">
            <label for="signup-phone-number">전화번호</label>
            <input
              id="signup-phone-number"
              :value="phoneNumber"
              name="phoneNumber"
              type="tel"
              autocomplete="tel"
              inputmode="numeric"
              placeholder="010-0000-0000"
              @input="formatPhoneNumber"
            />
            <p v-if="phoneNumber" class="field-message" :class="isPhoneValid ? 'success' : 'danger'">
              {{ isPhoneValid ? '사용 가능한 전화번호 형식입니다.' : '전화번호 형식을 확인해주세요.' }}
            </p>
          </div>

          <p v-if="error" class="form-summary danger" aria-live="polite">{{ error }}</p>
          <p v-else-if="isValid" class="form-summary success">가입 조건이 충족되었습니다.</p>

          <button class="signup-submit" type="submit" :disabled="!isValid || submitting">
            {{ submitting ? '가입 중' : '가입하기' }}
          </button>
        </form>
      </section>
    </main>

    <LoginFooter />
  </div>
</template>

<script setup>
import { Eye, EyeOff } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { checkEmailAvailability, signup } from '../../api/authApi'
import LoginFooter from '../../components/auth/LoginFooter.vue'
import LoginHeader from '../../components/auth/LoginHeader.vue'
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '../../utils/passwordPolicy'

const router = useRouter()
const emailLocal = ref('')
const emailDomain = ref('gmail.com')
const emailChecked = ref(false)
const emailAvailable = ref(false)
const emailCheckError = ref('')
const checkingEmail = ref(false)
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const name = ref('')
const birthDate = ref('')
const phoneNumber = ref('')
const submitting = ref(false)
const error = ref('')

const now = new Date()
const maxBirthDate = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

const email = computed(() => `${emailLocal.value}@${emailDomain.value}`)
const isEmailFormatValid = computed(() =>
  /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(emailLocal.value)
)
const emailCheckMessage = computed(() => {
  if (emailCheckError.value) return emailCheckError.value
  if (!emailChecked.value) return ''
  return emailAvailable.value ? '사용 가능한 이메일입니다.' : '이미 사용 중인 이메일입니다.'
})
const isPasswordValid = computed(() => isStrongPassword(password.value))
const isPasswordMatched = computed(() =>
  Boolean(password.value) && password.value === passwordConfirm.value
)
const isNameValid = computed(() => name.value.length > 0)
const isBirthDateValid = computed(() =>
  /^\d{4}-\d{2}-\d{2}$/.test(birthDate.value) &&
  birthDate.value >= '1900-01-01' &&
  birthDate.value <= maxBirthDate
)
const isPhoneValid = computed(() => /^01[016789]-\d{3,4}-\d{4}$/.test(phoneNumber.value))
const isValid = computed(() =>
  emailAvailable.value &&
  isPasswordValid.value &&
  isPasswordMatched.value &&
  isNameValid.value &&
  isBirthDateValid.value &&
  isPhoneValid.value
)

watch([emailLocal, emailDomain], () => {
  emailChecked.value = false
  emailAvailable.value = false
  emailCheckError.value = ''
})

async function checkEmail() {
  if (checkingEmail.value || !isEmailFormatValid.value) return

  emailCheckError.value = ''
  checkingEmail.value = true
  try {
    const response = await checkEmailAvailability(email.value)
    emailChecked.value = true
    emailAvailable.value = response.available
  } catch (e) {
    emailChecked.value = false
    emailAvailable.value = false
    emailCheckError.value = e.response?.data?.message || '이메일을 확인하지 못했습니다.'
  } finally {
    checkingEmail.value = false
  }
}

function setDefaultBirthDate() {
  if (!birthDate.value) {
    birthDate.value = '1960-01-01'
  }
}

function formatPhoneNumber(event) {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) {
    phoneNumber.value = digits
  } else if (digits.length <= 7) {
    phoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    phoneNumber.value = `${digits.slice(0, 3)}-${digits.slice(3, -4)}-${digits.slice(-4)}`
  }
  event.target.value = phoneNumber.value
}

async function submit() {
  if (!isValid.value || submitting.value) return

  error.value = ''
  submitting.value = true
  try {
    await signup({
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      name: name.value,
      birthYear: Number(birthDate.value.slice(0, 4)),
      phoneNumber: phoneNumber.value,
    })
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data?.message || '회원가입 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #49443b;
}

.signup-main {
  display: grid;
  place-items: start center;
  padding: 48px 20px 64px;
}

.signup-panel {
  width: min(100%, 420px);
}

.signup-panel h1 {
  margin: 0 0 30px;
  color: #2f2b25;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: 0;
}

.signup-form {
  display: grid;
  gap: 18px;
}

.form-group {
  display: grid;
  gap: 7px;
}

.form-group > label {
  color: #4f493f;
  font-size: 14px;
  font-weight: 800;
}

.form-group input,
.form-group select {
  width: 100%;
  height: 48px;
  padding: 0 14px;
  border: 1px solid #d8d4cc;
  border-radius: 6px;
  background: #fff;
  color: #2f2b25;
  outline: none;
  font-size: 14px;
}

.form-group input::placeholder {
  color: #aaa69f;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #b98600;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.email-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(105px, 0.8fr) 66px;
  align-items: center;
  gap: 8px;
}

.email-row > span {
  font-size: 14px;
  font-weight: 700;
}

.email-check-button {
  height: 48px;
  padding: 0 10px;
  border-radius: 6px;
  background: #ffc800;
  color: #302a20;
  font-size: 14px;
  font-weight: 800;
  white-space: nowrap;
}

.email-check-button:hover:not(:disabled) {
  background: #f2b800;
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  top: 0;
  right: 2px;
  width: 44px;
  height: 48px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #8f8a82;
}

.field-message,
.form-summary {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
}

.success {
  color: #16834b;
}

.danger {
  color: #d3423f;
}

.form-summary {
  padding: 10px 12px;
  border-radius: 6px;
}

.form-summary.success {
  background: #edf8f1;
}

.form-summary.danger {
  background: #fff0ef;
}

.signup-submit {
  width: 100%;
  height: 56px;
  border-radius: 6px;
  background: #ffc800;
  color: #302a20;
  font-size: 16px;
  font-weight: 900;
}

.signup-submit:hover:not(:disabled) {
  background: #f2b800;
}

.email-check-button:focus-visible,
.password-toggle:focus-visible,
.signup-submit:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.45);
  outline-offset: 3px;
}

@media (max-width: 560px) {
  .signup-main {
    padding: 40px 20px 52px;
  }

  .signup-panel h1 {
    margin-bottom: 26px;
    font-size: 26px;
  }

  .email-row {
    grid-template-columns: minmax(0, 1fr) auto minmax(94px, 0.8fr) 58px;
    gap: 6px;
  }

  .form-group input,
  .form-group select {
    padding-inline: 10px;
  }
}
</style>
