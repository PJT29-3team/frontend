<template>
  <div class="email-login-page">
    <LoginHeader />

    <main class="email-login-main">
      <section class="email-login-panel" aria-labelledby="email-login-title">
        <h1 id="email-login-title">로그인</h1>

        <form class="login-form" @submit.prevent="submit">
          <label class="sr-only" for="login-email">이메일</label>
          <input
            id="login-email"
            v-model.trim="email"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="이메일을 입력하세요"
            required
          />

          <div class="password-input">
            <label class="sr-only" for="login-password">비밀번호</label>
            <input
              id="login-password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
              :title="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="19" aria-hidden="true" />
              <Eye v-else :size="19" aria-hidden="true" />
            </button>
          </div>

          <div class="login-options">
            <label>
              <input v-model="saveEmail" name="saveEmail" type="checkbox" />
              <span>이메일 저장</span>
            </label>
            <label>
              <input v-model="autoLogin" name="autoLogin" type="checkbox" />
              <span>자동 로그인</span>
            </label>
          </div>

          <div class="login-error" aria-live="polite">
            <p v-if="error" class="form-message danger">{{ error }}</p>
            <button
              v-if="verificationRequired"
              class="verification-resend"
              type="button"
              data-resend-verification
              :disabled="resendingVerification"
              @click="resendEmailVerification"
            >
              {{ resendingVerification ? '전송 중' : '인증 메일 다시 보내기' }}
            </button>
            <p v-if="verificationMessage" class="form-message success">{{ verificationMessage }}</p>
          </div>

          <RouterLink class="password-reset-link" to="/password/reset/request">비밀번호 찾기</RouterLink>

          <p class="signup-prompt">
            <span>계정이 없으신가요?</span>
            <RouterLink to="/signup">회원가입</RouterLink>
          </p>

          <button class="login-submit" type="submit" :disabled="submitting">
            {{ submitting ? '로그인 중' : '로그인' }}
          </button>
        </form>
      </section>
    </main>

    <LoginFooter />
  </div>
</template>

<script setup>
import { Eye, EyeOff } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resendVerification } from '../api/authApi'
import LoginFooter from '../components/LoginFooter.vue'
import LoginHeader from '../components/LoginHeader.vue'
import { authStore } from '../stores/authStore'

const SAVED_EMAIL_KEY = 'jh_saved_email'
const VERIFICATION_REQUIRED_MESSAGE = '회원가입 후 최초 1회 이메일 인증이 필요합니다.'

const router = useRouter()
const savedEmail = typeof localStorage === 'undefined' ? '' : localStorage.getItem(SAVED_EMAIL_KEY) || ''
const email = ref(savedEmail)
const password = ref('')
const showPassword = ref(false)
const saveEmail = ref(Boolean(savedEmail))
const autoLogin = ref(false)
const submitting = ref(false)
const error = ref('')
const verificationRequired = ref(false)
const resendingVerification = ref(false)
const verificationMessage = ref('')

async function submit() {
  if (submitting.value) return

  error.value = ''
  verificationRequired.value = false
  verificationMessage.value = ''
  submitting.value = true
  try {
    await authStore.login(email.value, password.value)
    if (typeof localStorage !== 'undefined') {
      if (saveEmail.value) {
        localStorage.setItem(SAVED_EMAIL_KEY, email.value)
      } else {
        localStorage.removeItem(SAVED_EMAIL_KEY)
      }
    }
    router.push('/main')
  } catch (e) {
    error.value = e.response?.data?.message || '로그인 정보를 확인해주세요.'
    verificationRequired.value = error.value === VERIFICATION_REQUIRED_MESSAGE
  } finally {
    submitting.value = false
  }
}

async function resendEmailVerification() {
  if (resendingVerification.value || !verificationRequired.value) return

  verificationMessage.value = ''
  resendingVerification.value = true
  try {
    const response = await resendVerification(email.value)
    verificationMessage.value = response.message || '인증 메일을 다시 보냈습니다.'
  } catch (e) {
    verificationMessage.value = e.response?.data?.message || '인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    resendingVerification.value = false
  }
}
</script>

<style scoped>
.email-login-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #545045;
}

.email-login-main {
  display: grid;
  place-items: start center;
  padding: clamp(64px, 11vh, 118px) 20px 72px;
}

.email-login-panel {
  width: min(100%, 420px);
}

.email-login-panel h1 {
  margin: 0 0 48px;
  color: #2f2b25;
  font-size: 32px;
  line-height: 1.3;
  font-weight: 800;
  letter-spacing: 0;
  text-align: center;
}

.login-form {
  display: grid;
  gap: 15px;
}

.login-form > input,
.password-input input {
  width: 100%;
  height: 56px;
  padding: 0 16px;
  border: 1px solid #d5d2cc;
  border-radius: 6px;
  background: #fff;
  color: #282622;
  outline: none;
  font-size: 15px;
}

.login-form > input::placeholder,
.password-input input::placeholder {
  color: #b4b1ab;
}

.login-form > input:focus,
.password-input input:focus {
  border-color: #b98600;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.18);
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 52px;
}

.password-toggle {
  position: absolute;
  top: 0;
  right: 2px;
  width: 48px;
  height: 56px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #9b9891;
}

.password-toggle:focus-visible {
  outline: 2px solid #2d7d5a;
  outline-offset: -4px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.login-options label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #77736c;
  font-size: 14px;
  cursor: pointer;
}

.login-options input {
  width: 16px;
  height: 16px;
  margin: 0;
  accent-color: var(--jh-yellow);
}

.login-error {
  min-height: 18px;
  display: grid;
  gap: 6px;
}

.login-error .form-message {
  margin: 0;
  padding: 8px 10px;
  font-size: 12px;
}

.verification-resend {
  justify-self: center;
  padding: 5px 2px;
  background: transparent;
  color: #8a6700;
  text-decoration: underline;
  font-size: 12px;
  font-weight: 800;
}

.verification-resend:focus-visible {
  outline: 2px solid #8a6700;
  outline-offset: 2px;
}

.password-reset-link {
  justify-self: center;
  color: #77736c;
  text-decoration: none;
  font-size: 14px;
}

.signup-prompt {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 0;
  color: #77736c;
  font-size: 14px;
}

.signup-prompt a {
  color: #1396df;
  text-decoration: none;
  font-weight: 800;
}

.password-reset-link:hover,
.signup-prompt a:hover {
  text-decoration: underline;
}

.login-submit {
  width: 100%;
  height: 56px;
  margin-top: 2px;
  border-radius: 6px;
  background: var(--jh-yellow-strong);
  color: #302a20;
  font-size: 15px;
  font-weight: 900;
}

.login-submit:hover:not(:disabled) {
  background: #f2b800;
}

.login-submit:focus-visible,
.password-reset-link:focus-visible,
.signup-prompt a:focus-visible {
  outline: 3px solid #2d7d5a;
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 430px) {
  .email-login-main {
    padding: 48px 20px 56px;
  }

  .email-login-panel h1 {
    margin-bottom: 40px;
    font-size: 30px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .login-submit,
  .login-form > input,
  .password-input input {
    transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
  }
}
</style>
