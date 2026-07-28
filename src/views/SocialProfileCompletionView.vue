<template>
  <div class="social-profile-page">
    <LoginHeader :show-navigation="false" />

    <main class="social-profile-main">
      <section class="social-profile-panel" aria-labelledby="social-profile-title">
        <h1 id="social-profile-title">몇 가지만 더 확인할게요</h1>

        <form class="social-profile-form" @submit.prevent="submit">
          <div class="profile-field">
            <label for="social-name">이름</label>
            <input
              id="social-name"
              v-model.trim="name"
              name="name"
              type="text"
              autocomplete="name"
              maxlength="100"
              placeholder="이름을 입력해주세요."
              required
            />
          </div>

          <div class="profile-field">
            <label for="social-birth-date">나이</label>
            <input
              id="social-birth-date"
              v-model="birthDate"
              name="birthDate"
              type="date"
              autocomplete="bday"
              min="1900-01-01"
              :max="maxBirthDate"
              aria-label="태어난 연도를 입력하세요."
              required
              @focus="setDefaultBirthDate"
            />
          </div>

          <p v-if="error" class="profile-error" role="alert">{{ error }}</p>

          <button class="profile-submit" type="submit" :disabled="submitting">
            {{ submitting ? '저장 중' : '다음' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoginHeader from '../components/LoginHeader.vue'
import { authStore } from '../stores/authStore'

const router = useRouter()
const name = ref('')
const birthDate = ref('')
const error = ref('')
const submitting = ref(false)
const maxBirthDate = new Date().toISOString().slice(0, 10)

function setDefaultBirthDate() {
  if (!birthDate.value) {
    birthDate.value = '1960-01-01'
  }
}

async function submit() {
  if (submitting.value) return

  const birthYear = Number(birthDate.value.slice(0, 4))
  if (!name.value || !birthYear) {
    error.value = '이름과 태어난 날짜를 입력해주세요.'
    return
  }

  error.value = ''
  submitting.value = true
  try {
    await authStore.completeSocialProfile(name.value, birthYear)
    await router.replace('/main')
  } catch (e) {
    error.value = e.response?.data?.message || '추가 정보를 저장하지 못했습니다. 다시 시도해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.social-profile-page {
  min-height: 100vh;
  background: #fff;
}

.social-profile-main {
  min-height: calc(100vh - 96px);
  display: grid;
  place-items: center;
  padding: 38px 20px 120px;
}

.social-profile-panel {
  width: min(100%, 420px);
}

h1 {
  margin: 0 0 38px;
  color: #171717;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 900;
  letter-spacing: 0;
}

.social-profile-form {
  display: grid;
}

.profile-field {
  display: grid;
  gap: 8px;
}

.profile-field + .profile-field {
  margin-top: 20px;
}

label {
  color: #26231f;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 800;
}

input {
  width: 100%;
  height: 52px;
  padding: 0 14px;
  border: 1px solid #d7d4cf;
  border-radius: 7px;
  background: #fff;
  color: #24211d;
  outline: none;
  font-size: 15px;
}

input::placeholder {
  color: #92908c;
  opacity: 1;
}

input:focus {
  border-color: #ad8000;
  box-shadow: 0 0 0 3px rgba(255, 202, 0, 0.2);
}

input[type="date"] {
  color: #92908c;
}

input[type="date"]:valid {
  color: #24211d;
}

.profile-error {
  margin: 16px 0 0;
  padding: 10px 12px;
  border-radius: 6px;
  background: #ffe8e8;
  color: #d93d3f;
  font-size: 13px;
  line-height: 1.4;
}

.profile-submit {
  width: 100%;
  height: 54px;
  margin-top: 52px;
  border: 0;
  border-radius: 6px;
  background: #ffca00;
  color: #3c362d;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.profile-submit:hover:not(:disabled) {
  background: #f2b900;
}

.profile-submit:focus-visible,
input:focus-visible {
  outline: 3px solid rgba(45, 125, 90, 0.55);
  outline-offset: 2px;
}

.profile-submit:disabled {
  cursor: wait;
  opacity: 0.72;
}

@media (max-width: 620px) {
  .social-profile-main {
    min-height: calc(100vh - 80px);
    place-items: start center;
    padding: 64px 20px 48px;
  }

  h1 {
    margin-bottom: 34px;
    font-size: 25px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  input,
  .profile-submit {
    transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
  }
}
</style>
