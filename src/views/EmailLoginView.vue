<template>
  <MemberPageLayout action-label="회원가입" action-to="/signup">
    <section class="email-login-content" aria-labelledby="email-login-title">
      <div class="email-login-panel">
        <div class="login-heading">
          <h1 id="email-login-title">로그인</h1>
        </div>

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
              <EyeOff v-if="showPassword" :size="17" aria-hidden="true" />
              <Eye v-else :size="17" aria-hidden="true" />
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

          <div class="login-links">
            <RouterLink class="password-reset-link" to="/password/reset/request">비밀번호 찾기</RouterLink>
            <p class="signup-prompt">
              <span>계정이 없으신가요?</span>
              <RouterLink to="/signup">회원가입</RouterLink>
            </p>
          </div>

          <button class="login-submit" type="submit" :disabled="submitting">
            {{ submitting ? '로그인 중' : '로그인' }}
          </button>
        </form>
      </div>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import { Eye, EyeOff } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MemberPageLayout from '../components/MemberPageLayout.vue'
import { resendVerification } from '../api/authApi'
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
  } catch (loginError) {
    error.value = loginError.response?.data?.message || '로그인 정보를 확인해주세요.'
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
  } catch (resendError) {
    verificationMessage.value = resendError.response?.data?.message || '인증 메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.'
  } finally {
    resendingVerification.value = false
  }
}
</script>

<style scoped>
.email-login-content {
  display: grid;
  place-items: center;
  padding: 64px 24px 100px;
}

.email-login-panel {
  width: min(100%, 300px);
}

.login-heading {
  margin-bottom: 48px;
  text-align: center;
}

.login-heading h1 {
  margin: 0;
  color: #111;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 800;
}

.login-form {
  display: grid;
  gap: 16px;
}

.login-form > input,
.password-input input {
  width: 100%;
  height: 45px;
  padding: 0 13px;
  border: 1px solid #d8d4cc;
  border-radius: 6px;
  background: #fff;
  color: #282622;
  outline: none;
  font-size: 13px;
}

.login-form > input::placeholder,
.password-input input::placeholder {
  color: #b4b1ab;
}

.login-form > input:focus,
.password-input input:focus {
  border-color: #b98600;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  inset: 0 3px 0 auto;
  width: 40px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #8b867e;
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
  gap: 6px;
  color: #77736c;
  font-size: 12px;
  cursor: pointer;
}

.login-options input {
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: #ffbf00;
}

.login-error {
  min-height: 18px;
  display: grid;
  gap: 6px;
}

.login-error .form-message {
  margin: 0;
  padding: 8px 10px;
  font-size: 11px;
}

.verification-resend {
  justify-self: center;
  padding: 4px;
  background: transparent;
  color: #8a6700;
  text-decoration: underline;
  font-size: 11px;
  font-weight: 800;
}

.login-links {
  display: grid;
  gap: 15px;
}

.password-reset-link {
  justify-self: center;
  color: #77736c;
  text-decoration: none;
  font-size: 12px;
}

.signup-prompt {
  display: flex;
  justify-content: center;
  gap: 5px;
  margin: 0;
  color: #77736c;
  font-size: 12px;
}

.signup-prompt a {
  color: #1396df;
  text-decoration: none;
  font-weight: 800;
}

.login-submit {
  width: 100%;
  height: 47px;
  border-radius: 6px;
  background: #ffbf00;
  color: #302a20;
  font-size: 14px;
  font-weight: 900;
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
  .email-login-content {
    align-items: start;
    padding: 64px 24px;
  }
}
</style>
