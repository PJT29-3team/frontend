<template>
  <main class="reset-page">
    <section v-if="state === 'checking'" class="status-card" aria-live="polite">
      <LoaderCircle class="spin" :size="42" aria-hidden="true" />
      <h1>링크를 확인하고 있습니다.</h1>
      <p>잠시만 기다려주세요.</p>
    </section>

    <section v-else-if="state === 'invalid'" class="status-card" aria-live="polite">
      <CircleAlert class="invalid-icon" :size="46" aria-hidden="true" />
      <h1>재설정 링크를 사용할 수 없습니다</h1>
      <p>{{ message }}</p>
      <RouterLink class="primary-link" to="/password/reset/request">새 링크 받기</RouterLink>
    </section>

    <div v-else-if="state === 'ready'" class="reset-flow">
      <RouterLink class="back-link" to="/login/email">
        <ArrowLeft :size="16" aria-hidden="true" />
        이메일 로그인
      </RouterLink>

      <div class="step-progress" aria-label="비밀번호 재설정 2단계">
        <div><i></i><span></span></div>
        <p>STEP 2 · 새 비밀번호 설정</p>
      </div>

      <section class="reset-card" aria-labelledby="reset-complete-title">
        <h1 id="reset-complete-title">새 비밀번호 설정</h1>
        <form @submit.prevent="submit">
          <label class="sr-only" for="new-password">새 비밀번호</label>
          <input
            id="new-password"
            v-model="password"
            name="password"
            type="password"
            autocomplete="new-password"
            placeholder="1. 새 비밀번호 입력"
            :disabled="submitting"
          />
          <label class="sr-only" for="new-password-confirm">비밀번호 확인</label>
          <input
            id="new-password-confirm"
            v-model="passwordConfirm"
            name="passwordConfirm"
            type="password"
            autocomplete="new-password"
            placeholder="2. 비밀번호 확인"
            :disabled="submitting"
          />
          <p class="password-hint">영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.</p>
          <div class="feedback" aria-live="polite">
            <p v-if="message">{{ message }}</p>
          </div>
          <button type="submit" :disabled="submitting">
            {{ submitting ? '변경 중' : '변경 완료' }}
          </button>
        </form>
      </section>
    </div>

    <section v-else class="status-card done-card" aria-live="polite">
      <span class="success-icon"><Check :size="34" stroke-width="3" aria-hidden="true" /></span>
      <h1>비밀번호가 변경되었습니다</h1>
      <p>새 비밀번호로 안전하게 로그인해주세요.</p>
      <RouterLink class="primary-link" to="/login/email">메인페이지로 돌아가기</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { ArrowLeft, Check, CircleAlert, LoaderCircle } from '@lucide/vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { completePasswordReset, verifyPasswordReset } from '../api/authApi'

const route = useRoute()
const password = ref('')
const passwordConfirm = ref('')
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
    message.value = '비밀번호가 서로 일치하지 않습니다. 다시 입력해주세요.'
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
.reset-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 80px 24px;
  background: #fbfaf8;
  color: #333;
}

.reset-flow {
  position: relative;
  width: min(100%, 360px);
}

.back-link {
  position: fixed;
  top: 36px;
  left: 48px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 0 12px;
  border: 1px solid #8b877f;
  border-radius: 5px;
  background: #fff;
  color: #4a4741;
  text-decoration: none;
  font-size: 12px;
  font-weight: 700;
}

.step-progress {
  margin: 0 auto 8px;
  text-align: center;
}

.step-progress > div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 0 42px;
}

.step-progress span,
.step-progress i {
  height: 5px;
  border-radius: 999px;
}

.step-progress i {
  background: #6a655d;
}

.step-progress span {
  background: #ffc400;
}

.step-progress p {
  margin: 8px 0 0;
  color: #5e5a53;
  font-size: 12px;
  font-weight: 800;
}

.reset-card,
.status-card {
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 9px 24px rgba(70, 66, 58, 0.14);
}

.reset-card {
  min-height: 400px;
  padding: 28px 24px 22px;
}

.reset-card h1,
.status-card h1 {
  margin: 0;
  color: #403d38;
  text-align: center;
  font-size: 23px;
  letter-spacing: 0;
}

.reset-card form {
  display: grid;
  gap: 14px;
  margin-top: 24px;
}

.reset-card input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 0;
  border-radius: 7px;
  background: #f1f0f4;
  color: #333;
  outline: none;
}

.reset-card input:focus {
  box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.28);
}

.password-hint {
  margin: -5px 2px 0;
  color: #77736c;
  font-size: 11px;
  line-height: 1.45;
}

.feedback {
  min-height: 50px;
  display: flex;
  align-items: flex-end;
}

.feedback p {
  width: 100%;
  margin: 0;
  padding: 9px 11px;
  border-radius: 6px;
  background: #ffe6e6;
  color: #ff4d4f;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 700;
}

.reset-card button,
.primary-link {
  height: 45px;
  display: grid;
  place-items: center;
  border-radius: 7px;
  background: #ffc400;
  color: #39352d;
  text-decoration: none;
  font-weight: 800;
}

.status-card {
  width: min(100%, 390px);
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 34px 30px;
  text-align: center;
}

.status-card > svg {
  margin-bottom: 20px;
  color: #6a655d;
}

.status-card .invalid-icon {
  color: #ff4d4f;
}

.status-card p {
  margin: 12px 0 22px;
  color: #77736c;
  font-size: 13px;
  line-height: 1.5;
}

.status-card .primary-link {
  width: 100%;
}

.success-icon {
  width: 62px;
  height: 62px;
  display: grid;
  place-items: center;
  margin-bottom: 22px;
  border-radius: 50%;
  background: #19c56b;
  color: #fff;
}

.spin {
  animation: spin 0.9s linear infinite;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 560px) {
  .reset-page {
    align-items: start;
    padding-top: 110px;
  }

  .back-link {
    top: 24px;
    left: 20px;
  }
}
</style>
