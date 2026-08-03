<template>
  <MemberPageLayout action-label="로그인" action-to="/login">
    <section class="reset-content">
      <section v-if="state === 'checking'" class="status-panel" aria-live="polite">
        <LoaderCircle class="spin" :size="38" aria-hidden="true" />
        <h1>링크를 확인하고 있습니다.</h1>
        <p>잠시만 기다려주세요.</p>
      </section>

      <section v-else-if="state === 'invalid'" class="status-panel" aria-live="polite">
        <CircleAlert class="invalid-icon" :size="42" aria-hidden="true" />
        <h1>재설정 링크를 사용할 수 없습니다</h1>
        <p>{{ message }}</p>
        <RouterLink class="primary-link" to="/password/reset/request">새 링크 받기</RouterLink>
      </section>

      <div v-else-if="state === 'ready'" class="reset-flow">
        <RouterLink class="back-link" to="/">
          <ArrowLeft :size="17" aria-hidden="true" />
          메인페이지로
        </RouterLink>

        <div class="step-progress" aria-label="비밀번호 재설정 2단계">
          <div><i></i><span></span></div>
          <p>STEP 2 · 새 비밀번호 설정</p>
        </div>

        <section aria-labelledby="reset-complete-title">
          <h1 id="reset-complete-title">새 비밀번호 설정</h1>
          <form novalidate @submit.prevent="submit">
            <label for="new-password">새 비밀번호</label>
            <div class="password-input">
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
                type="button"
                :aria-label="showPassword ? '새 비밀번호 숨기기' : '새 비밀번호 표시'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="16" aria-hidden="true" />
                <Eye v-else :size="16" aria-hidden="true" />
              </button>
            </div>

            <label for="new-password-confirm">새 비밀번호 다시 입력</label>
            <div class="password-input">
              <input
                id="new-password-confirm"
                v-model="passwordConfirm"
                name="passwordConfirm"
                :type="showPasswordConfirm ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="새 비밀번호를 다시 한번 입력해주세요"
                :disabled="submitting"
              />
              <button
                type="button"
                :aria-label="showPasswordConfirm ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'"
                @click="showPasswordConfirm = !showPasswordConfirm"
              >
                <EyeOff v-if="showPasswordConfirm" :size="16" aria-hidden="true" />
                <Eye v-else :size="16" aria-hidden="true" />
              </button>
            </div>

            <div class="password-rules" aria-label="비밀번호 조건">
              <span :class="{ active: password.length >= 8 }">✓ 8자 이상</span>
              <span :class="{ active: /[A-Za-z]/.test(password) }">✓ 영문 포함</span>
              <span :class="{ active: /\d/.test(password) }">✓ 숫자 포함</span>
              <span :class="{ active: /[^A-Za-z\d\s]/.test(password) }">✓ 특수문자 포함</span>
            </div>

            <div class="feedback" aria-live="polite">
              <p v-if="message">
                <CircleAlert :size="17" aria-hidden="true" />
                <span>{{ message }}</span>
              </p>
            </div>

            <button class="submit-button" type="submit" :disabled="submitting">
              {{ submitting ? '변경 중' : '변경 완료' }}
            </button>
          </form>
        </section>
      </div>

      <section v-else class="status-panel done-panel" aria-live="polite">
        <span class="success-icon"><Check :size="26" stroke-width="3" aria-hidden="true" /></span>
        <h1>비밀번호가 변경되었습니다</h1>
        <p>새 비밀번호로 안전하게 로그인해주세요.</p>
        <RouterLink class="primary-link" to="/login/email">로그인으로 돌아가기</RouterLink>
      </section>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import { ArrowLeft, Check, CircleAlert, Eye, EyeOff, LoaderCircle } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MemberPageLayout from '../components/MemberPageLayout.vue'
import { completePasswordReset, verifyPasswordReset } from '../api/authApi'

const route = useRoute()
const password = ref('')
const passwordConfirm = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const message = ref('')
const state = ref('checking')
const submitting = ref(false)

const strongPasswordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d\s])\S{8,}$/

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
  if (submitting.value) return

  message.value = ''
  if (!strongPasswordPattern.test(password.value)) {
    message.value = '영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.'
    return
  }
  if (password.value !== passwordConfirm.value) {
    message.value = '비밀번호가 일치하지 않습니다. 다시 확인해주세요.'
    return
  }

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
.reset-content {
  display: grid;
  place-items: center;
  padding: 70px 24px 100px;
}

.reset-flow {
  width: min(100%, 390px);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 48px;
  color: #4d4942;
  text-decoration: none;
  font-size: 15px;
  font-weight: 800;
}

.step-progress {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 18px;
  margin-bottom: 34px;
}

.step-progress > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.step-progress span,
.step-progress i {
  height: 3px;
}

.step-progress i,
.step-progress span {
  background: #ffbf00;
}

.step-progress p {
  margin: 0;
  color: #aaa59d;
  font-size: 10px;
}

h1 {
  margin: 0 0 28px;
  font-size: 24px;
  line-height: 1.3;
  font-weight: 800;
}

form {
  display: grid;
}

label {
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 800;
}

.password-input {
  position: relative;
  margin-bottom: 16px;
}

.password-input input {
  width: 100%;
  height: 44px;
  padding: 0 43px 0 13px;
  border: 1px solid #d8d4cc;
  border-radius: 5px;
  background: #fff;
  outline: none;
  font-size: 12px;
}

.password-input input:focus {
  border-color: #d69e00;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.password-input button {
  position: absolute;
  inset: 0 3px 0 auto;
  width: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  background: transparent;
  color: #918c84;
}

.password-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 15px;
  margin-top: -6px;
  color: #aaa59d;
  font-size: 10px;
}

.password-rules .active {
  color: #18a35e;
}

.feedback {
  min-height: 72px;
  display: flex;
  align-items: center;
}

.feedback p {
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0;
  padding: 10px 14px;
  border-radius: 6px;
  background: #fde7e4;
  color: #e4433b;
  text-align: center;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 700;
}

.submit-button,
.primary-link {
  width: 100%;
  min-height: 44px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #ffbf00;
  color: #312b22;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
}

.status-panel {
  width: min(100%, 390px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.status-panel > svg {
  margin-bottom: 20px;
  color: #6a655d;
}

.status-panel .invalid-icon {
  color: #e4433b;
}

.status-panel h1 {
  margin-bottom: 0;
  font-size: 20px;
}

.status-panel p {
  margin: 10px 0 24px;
  color: #77736c;
  font-size: 12px;
  line-height: 1.5;
}

.success-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: #19bf67;
  color: #fff;
}

.done-panel .primary-link {
  max-width: 300px;
}

.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .reset-content {
    align-items: start;
    padding: 48px 22px 72px;
  }

  .back-link {
    margin-bottom: 38px;
  }

  .status-panel {
    margin-top: 90px;
  }
}
</style>
