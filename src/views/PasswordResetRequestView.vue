<template>
  <main class="reset-page">
    <RouterLink class="back-link" to="/login/email">
      <ArrowLeft :size="16" aria-hidden="true" />
      이메일 로그인
    </RouterLink>

    <div class="reset-flow">
      <div class="step-progress" aria-label="비밀번호 재설정 1단계">
        <div><span></span><i></i></div>
        <p>STEP 1 · 본인 인증</p>
      </div>

      <section class="reset-card" aria-labelledby="reset-request-title">
        <h1 id="reset-request-title">비밀번호 재설정</h1>
        <form @submit.prevent="submit">
          <label class="sr-only" for="reset-email">이메일</label>
          <input
            id="reset-email"
            v-model.trim="email"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="1. 이메일 입력"
            :disabled="submitting"
          />

          <div class="feedback" aria-live="polite">
            <p v-if="message" :class="sent ? 'success' : 'danger'">{{ message }}</p>
          </div>

          <button type="submit" :disabled="submitting">
            {{ submitting ? '전송 중' : sent ? '링크 다시 보내기' : '링크 보내기' }}
          </button>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ArrowLeft } from '@lucide/vue'
import { ref } from 'vue'
import { requestPasswordReset } from '../api/authApi'

const email = ref('')
const message = ref('')
const sent = ref(false)
const submitting = ref(false)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function submit() {
  if (submitting.value) return

  message.value = ''
  sent.value = false
  if (!emailPattern.test(email.value)) {
    message.value = '올바른 이메일 주소를 입력해주세요.'
    return
  }

  submitting.value = true
  try {
    const response = await requestPasswordReset(email.value)
    sent.value = true
    message.value = response.message || '가입 여부와 관계없이 입력한 주소로 재설정 안내를 보냈습니다.'
  } catch (error) {
    message.value = error.response?.data?.message || '링크를 보내지 못했습니다. 잠시 후 다시 시도해주세요.'
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

.back-link {
  position: absolute;
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

.reset-flow {
  width: min(100%, 360px);
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

.step-progress span {
  background: #ffc400;
}

.step-progress i {
  background: #e2ded5;
}

.step-progress p {
  margin: 8px 0 0;
  color: #5e5a53;
  font-size: 12px;
  font-weight: 800;
}

.reset-card {
  min-height: 370px;
  padding: 28px 24px 22px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 9px 24px rgba(70, 66, 58, 0.14);
}

.reset-card h1 {
  margin: 0 0 24px;
  color: #403d38;
  text-align: center;
  font-size: 23px;
  letter-spacing: 0;
}

.reset-card form {
  min-height: 288px;
  display: flex;
  flex-direction: column;
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

.feedback {
  min-height: 74px;
  display: flex;
  align-items: flex-end;
  margin-top: auto;
}

.feedback p {
  width: 100%;
  margin: 0 0 10px;
  padding: 9px 11px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  font-weight: 700;
}

.feedback .danger {
  background: #ffe6e6;
  color: #ff4d4f;
}

.feedback .success {
  background: #e8f8ef;
  color: #16894e;
}

.reset-card button {
  width: 100%;
  height: 45px;
  border-radius: 7px;
  background: #ffc400;
  color: #39352d;
  font-weight: 800;
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
