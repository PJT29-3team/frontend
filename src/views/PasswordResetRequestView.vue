<template>
  <div class="password-reset-page">
    <LoginHeader />

    <main class="password-reset-main">
      <section class="reset-panel" aria-labelledby="reset-request-title">
        <RouterLink class="back-link" to="/login/email">
          <ArrowLeft :size="15" aria-hidden="true" />
          이메일 로그인으로
        </RouterLink>

        <div class="step-progress" aria-label="비밀번호 재설정 1단계">
          <span class="step-progress__active"></span>
          <span></span>
          <p>STEP 1 · 이메일 인증</p>
        </div>

        <h1 id="reset-request-title">비밀번호 재설정</h1>
        <p class="reset-description">가입한 이메일 주소를 입력해주세요.</p>

        <form class="reset-form" novalidate @submit.prevent="submit">
          <label for="reset-email">이메일</label>
          <input
            id="reset-email"
            v-model.trim="email"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="example@gmail.com"
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
    </main>

    <LoginFooter />
  </div>
</template>

<script setup>
import { ArrowLeft } from '@lucide/vue'
import { ref } from 'vue'
import { requestPasswordReset } from '../api/authApi'
import LoginFooter from '../components/LoginFooter.vue'
import LoginHeader from '../components/LoginHeader.vue'

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
  padding: clamp(54px, 10vh, 104px) 20px 72px;
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

.reset-panel h1 {
  margin: 0;
  color: #2f2b25;
  font-size: 25px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: 0;
}

.reset-description {
  margin: 9px 0 30px;
  color: #817c73;
  font-size: 14px;
}

.reset-form {
  display: grid;
}

.reset-form label {
  margin-bottom: 9px;
  color: #45413a;
  font-size: 14px;
  font-weight: 700;
}

.reset-form input {
  width: 100%;
  height: 52px;
  padding: 0 15px;
  border: 1px solid #d8d5cf;
  border-radius: 5px;
  background: #fff;
  color: #2f2b25;
  outline: none;
  font-size: 15px;
}

.reset-form input::placeholder {
  color: #b5b1aa;
}

.reset-form input:focus {
  border-color: #b98600;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.feedback {
  min-height: 64px;
  display: flex;
  align-items: flex-end;
}

.feedback p {
  width: 100%;
  margin: 10px 0 0;
  padding: 10px 12px;
  border-radius: 5px;
  font-size: 13px;
  line-height: 1.45;
}

.feedback .danger {
  background: #ffe8e8;
  color: #e44447;
}

.feedback .success {
  background: #e8f8ef;
  color: #188f54;
}

.reset-form button {
  width: 100%;
  height: 50px;
  border-radius: 5px;
  background: #ffc400;
  color: #302c26;
  font-weight: 800;
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
