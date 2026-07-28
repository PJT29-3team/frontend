<template>
  <div class="password-reset-page">
    <LoginHeader :show-navigation="state !== 'done'" />

    <main class="password-reset-main">
      <section v-if="state === 'checking'" class="status-panel" aria-live="polite">
        <LoaderCircle class="spin" :size="40" aria-hidden="true" />
        <h1>링크를 확인하고 있습니다.</h1>
        <p>잠시만 기다려주세요.</p>
      </section>

      <section v-else-if="state === 'invalid'" class="status-panel" aria-live="polite">
        <CircleAlert class="invalid-icon" :size="44" aria-hidden="true" />
        <h1>재설정 링크를 사용할 수 없습니다</h1>
        <p>{{ message }}</p>
        <RouterLink class="primary-link" to="/password/reset/request">새 링크 받기</RouterLink>
      </section>

      <section v-else-if="state === 'ready'" class="reset-panel" aria-labelledby="reset-complete-title">
        <RouterLink class="back-link" to="/login/email">
          <ArrowLeft :size="15" aria-hidden="true" />
          이메일 로그인으로
        </RouterLink>

        <div class="step-progress" aria-label="비밀번호 재설정 2단계">
          <span class="step-progress__complete"></span>
          <span class="step-progress__active"></span>
          <p>STEP 2 · 새 비밀번호 설정</p>
        </div>

        <h1 id="reset-complete-title">새 비밀번호 설정</h1>
        <p class="reset-description">새 비밀번호를 입력해주세요.</p>

        <form class="reset-form" novalidate @submit.prevent="submit">
          <div class="form-group">
            <label for="new-password">새 비밀번호</label>
            <div class="password-field">
              <input
                id="new-password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="새 비밀번호를 입력해주세요"
                :disabled="submitting"
              />
              <button
                class="password-toggle"
                type="button"
                :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
                :title="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
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
            <label for="new-password-confirm">새 비밀번호 확인</label>
            <div class="password-field">
              <input
                id="new-password-confirm"
                v-model="passwordConfirm"
                name="passwordConfirm"
                :type="showPasswordConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="새 비밀번호를 다시 입력해주세요"
                :disabled="submitting"
              />
              <button
                class="password-toggle"
                type="button"
                :aria-label="showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'"
                :title="showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'"
                @click="showPasswordConfirm = !showPasswordConfirm"
              >
                <EyeOff v-if="showPasswordConfirm" :size="18" aria-hidden="true" />
                <Eye v-else :size="18" aria-hidden="true" />
              </button>
            </div>
            <p
              v-if="passwordConfirm"
              class="field-message"
              :class="isPasswordMatched ? 'success' : 'danger'"
            >
              {{ isPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 서로 일치하지 않습니다.' }}
            </p>
          </div>

          <p v-if="message" class="form-summary danger" aria-live="polite">{{ message }}</p>

          <button class="reset-submit" type="submit" :disabled="!isFormValid || submitting">
            {{ submitting ? '변경 중' : '변경 완료' }}
          </button>
        </form>
      </section>

      <section v-else class="status-panel done-panel" aria-live="polite">
        <span class="success-icon">
          <Check :size="24" stroke-width="3" aria-hidden="true" />
        </span>
        <h1>비밀번호가 변경되었습니다</h1>
        <p>새 비밀번호로 로그인해주세요.</p>
        <RouterLink class="primary-link" to="/login/email">로그인으로 돌아가기</RouterLink>
      </section>
    </main>

    <LoginFooter />
  </div>
</template>

<script setup>
import { ArrowLeft, Check, CircleAlert, Eye, EyeOff, LoaderCircle } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { completePasswordReset, verifyPasswordReset } from '../api/authApi'
import LoginFooter from '../components/LoginFooter.vue'
import LoginHeader from '../components/LoginHeader.vue'
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '../utils/passwordPolicy'

const route = useRoute()
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const message = ref('')
const state = ref('checking')
const submitting = ref(false)

const isPasswordValid = computed(() => isStrongPassword(password.value))
const isPasswordMatched = computed(() =>
  Boolean(password.value) && password.value === passwordConfirm.value
)
const isFormValid = computed(() => isPasswordValid.value && isPasswordMatched.value)

onMounted(verifyToken)

async function verifyToken() {
  const token = route.query.token
  if (typeof token !== 'string' || !token) {
    state.value = 'invalid'
    message.value = '유효하지 않거나 만료된 비밀번호 재설정 링크입니다.'
    return
  }

  try {
    await verifyPasswordReset(token)
    state.value = 'ready'
  } catch (error) {
    state.value = 'invalid'
    message.value = error.response?.data?.message || '유효하지 않거나 만료된 비밀번호 재설정 링크입니다.'
  }
}

async function submit() {
  if (!isFormValid.value || submitting.value) return

  message.value = ''
  submitting.value = true
  try {
    await completePasswordReset(route.query.token, password.value, passwordConfirm.value)
    state.value = 'done'
  } catch (error) {
    message.value = error.response?.data?.message || '비밀번호를 변경하지 못했습니다. 새 링크를 요청해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.password-reset-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #4d4942;
}

.password-reset-main {
  display: grid;
  place-items: start center;
  padding: clamp(48px, 9vh, 94px) 20px 72px;
}

.reset-panel {
  width: min(100%, 420px);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 34px;
  color: #5f5a52;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
}

.back-link:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.step-progress {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.step-progress span {
  height: 2px;
  background: #dedbd4;
}

.step-progress__complete {
  background: #7e7a72 !important;
}

.step-progress__active {
  background: #ffbc00 !important;
}

.step-progress p {
  grid-column: 2;
  margin: -2px 0 0;
  color: #99958d;
  text-align: right;
  font-size: 11px;
  font-weight: 700;
}

.reset-panel h1,
.status-panel h1 {
  margin: 0;
  color: #2f2b25;
  font-size: 25px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: 0;
}

.reset-description {
  margin: 9px 0 28px;
  color: #817c73;
  font-size: 14px;
}

.reset-form {
  display: grid;
  gap: 18px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-group label {
  color: #45413a;
  font-size: 14px;
  font-weight: 700;
}

.password-field {
  position: relative;
}

.password-field input {
  width: 100%;
  height: 52px;
  padding: 0 50px 0 15px;
  border: 1px solid #d8d5cf;
  border-radius: 5px;
  background: #fff;
  color: #2f2b25;
  outline: none;
  font-size: 15px;
}

.password-field input::placeholder {
  color: #b5b1aa;
}

.password-field input:focus {
  border-color: #b98600;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.password-toggle {
  position: absolute;
  top: 0;
  right: 2px;
  width: 48px;
  height: 52px;
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

.field-message {
  margin: 0 2px;
  font-size: 12px;
  line-height: 1.45;
}

.field-message.success {
  color: #188f54;
}

.field-message.danger {
  color: #e44447;
}

.form-summary {
  margin: 0;
  padding: 10px 12px;
  border-radius: 5px;
  font-size: 13px;
  line-height: 1.45;
}

.form-summary.danger {
  background: #ffe8e8;
  color: #e44447;
}

.reset-submit,
.primary-link {
  width: 100%;
  height: 50px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #ffc400;
  color: #302c26;
  text-decoration: none;
  font-weight: 800;
}

.status-panel {
  width: min(100%, 400px);
  min-height: 330px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.status-panel > svg {
  margin-bottom: 20px;
  color: #77736c;
}

.status-panel .invalid-icon {
  color: #e44447;
}

.status-panel p {
  margin: 10px 0 28px;
  color: #817c73;
  font-size: 14px;
  line-height: 1.5;
}

.success-icon {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: #19b766;
  color: #fff;
}

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .password-reset-main {
    padding-top: 42px;
  }

  .back-link {
    margin-bottom: 28px;
  }
}
</style>
