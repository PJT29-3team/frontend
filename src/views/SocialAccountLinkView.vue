<template>
  <main class="social-account-link-page">
    <section class="social-account-link-card" aria-labelledby="social-account-link-title">
      <h1 id="social-account-link-title">카카오 계정을 연결할게요</h1>
      <p class="social-account-link-description">
        안전하게 계정을 연결하려면, 지금 사용 중인 비밀번호를 한 번 더 입력해주세요.
      </p>

      <form class="social-account-link-form" @submit.prevent="submit">
        <label for="social-account-link-password">비밀번호</label>
        <div class="password-input">
          <input
            id="social-account-link-password"
            v-model="password"
            name="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            :aria-invalid="Boolean(error)"
            aria-describedby="social-account-link-password-error"
            required
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
            :title="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
            @click="showPassword = !showPassword"
          >
            <EyeOff v-if="showPassword" :size="24" aria-hidden="true" />
            <Eye v-else :size="24" aria-hidden="true" />
          </button>
        </div>

        <div id="social-account-link-password-error" class="link-error" aria-live="polite">
          <p v-if="error">{{ error }}</p>
        </div>

        <button class="link-submit" type="submit" :disabled="submitting">
          {{ submitting ? '계정 연결 중' : '계정 연결하고 로그인' }}
        </button>
      </form>

      <RouterLink class="login-return-link" to="/login">로그인 화면으로 돌아가기</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { Eye, EyeOff } from '@lucide/vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/authStore'

const router = useRouter()
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const submitting = ref(false)

async function submit() {
  if (submitting.value) return

  if (!password.value) {
    error.value = '비밀번호를 입력해주세요.'
    return
  }

  error.value = ''
  submitting.value = true
  try {
    await authStore.linkKakaoAccount(password.value)
    await router.replace('/main')
  } catch (e) {
    error.value = e.response?.data?.message || '비밀번호를 다시 확인한 뒤 연결을 시도해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.social-account-link-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background: #ffcc00;
}

.social-account-link-card {
  width: min(100%, 520px);
  padding: 40px;
  border: 1px solid #816843;
  border-radius: 8px;
  background: #fff;
}

h1 {
  margin: 0;
  color: #545045;
  font-size: 28px;
  line-height: 1.35;
  font-weight: 800;
  letter-spacing: 0;
  word-break: keep-all;
}

.social-account-link-description {
  margin: 16px 0 32px;
  color: #60584c;
  font-size: 17px;
  line-height: 1.65;
  word-break: keep-all;
}

.social-account-link-form {
  display: grid;
}

label {
  margin-bottom: 10px;
  color: #545045;
  font-size: 17px;
  font-weight: 700;
}

.password-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  border: 2px solid #816843;
  border-radius: 8px;
  background: #fff;
}

input {
  min-width: 0;
  min-height: 52px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px 0 0 8px;
  background: #fff;
  color: #545045;
  font-size: 18px;
  outline: none;
}

.password-input:focus-within {
  border-color: #545045;
  outline: 3px solid #ffbc00;
  outline-offset: 3px;
}

.password-toggle {
  width: 52px;
  min-height: 52px;
  display: grid;
  place-items: center;
  border-left: 1px solid #816843;
  border-radius: 0 6px 6px 0;
  background: #fff;
  color: #60584c;
}

.password-toggle:focus-visible,
.link-submit:focus-visible,
.login-return-link:focus-visible {
  outline: 3px solid #545045;
  outline-offset: 3px;
}

.password-toggle:hover {
  background: #ffcc00;
}

.link-error {
  min-height: 28px;
  margin-top: 12px;
}

.link-error p {
  margin: 0;
  color: #816843;
  font-size: 17px;
  line-height: 1.5;
}

.link-submit {
  width: 100%;
  min-height: 54px;
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #ffbc00;
  color: #545045;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
}

.link-submit:hover:not(:disabled) {
  background: #ffcc00;
}

.login-return-link {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  margin-top: 24px;
  color: #60584c;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.4;
}

@media (max-width: 520px) {
  .social-account-link-page {
    place-items: start center;
    padding: 20px 16px;
  }

  .social-account-link-card {
    padding: 32px 24px;
  }
}
</style>
