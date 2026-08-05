<template>
  <MemberPageLayout action-label="로그인" action-to="/login">
    <section class="reset-content">
      <div class="reset-flow">
        <RouterLink class="back-link" to="/">
          <ArrowLeft :size="17" aria-hidden="true" />
          메인페이지로
        </RouterLink>

        <div class="step-progress" aria-label="비밀번호 재설정 1단계">
          <div><span></span><i></i></div>
          <p>STEP 1 · 본인 인증</p>
        </div>

        <section aria-labelledby="reset-request-title">
          <h1 id="reset-request-title">비밀번호 재설정</h1>
          <form novalidate @submit.prevent="submit">
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
            <p class="input-help">비밀번호 재설정 이메일을 입력해주세요.</p>

            <div class="feedback" aria-live="polite">
              <p v-if="message" :class="sent ? 'success' : 'danger'">
                <CircleAlert v-if="!sent" :size="17" aria-hidden="true" />
                <span>{{ message }}</span>
              </p>
            </div>

            <button type="submit" :disabled="submitting">
              {{ submitting ? '전송 중' : sent ? '링크 다시 보내기' : '링크 보내기' }}
            </button>
          </form>
        </section>
      </div>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import { ArrowLeft, CircleAlert } from '@lucide/vue'
import { ref } from 'vue'
import { requestPasswordReset } from '../../api/authApi'
import MemberPageLayout from '@/components/MemberPageLayout.vue'


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
    message.value = '이메일이 일치하지 않습니다. 다시 확인해주세요.'
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
.reset-content {
  display: grid;
  place-items: start center;
  padding: 70px 24px 100px;
}

.reset-flow {
  width: min(100%, 370px);
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

.step-progress span {
  background: #ffbf00;
}

.step-progress i {
  background: #e7e3dc;
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

input {
  width: 100%;
  height: 44px;
  padding: 0 13px;
  border: 1px solid #d8d4cc;
  border-radius: 5px;
  background: #fff;
  outline: none;
  font-size: 12px;
}

input:focus {
  border-color: #d69e00;
  box-shadow: 0 0 0 3px rgba(255, 188, 0, 0.16);
}

.input-help {
  margin: 7px 0 0;
  color: #9a958d;
  font-size: 10px;
}

.feedback {
  min-height: 74px;
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
  text-align: center;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 700;
}

.feedback .danger {
  background: #fde7e4;
  color: #e4433b;
}

.feedback .success {
  background: #e7f7ee;
  color: #16894e;
}

form > button {
  width: 100%;
  height: 44px;
  border-radius: 5px;
  background: #ffbf00;
  color: #312b22;
  font-size: 13px;
  font-weight: 800;
}

@media (max-width: 560px) {
  .reset-content {
    padding: 48px 22px 72px;
  }

  .back-link {
    margin-bottom: 38px;
  }
}
</style>
