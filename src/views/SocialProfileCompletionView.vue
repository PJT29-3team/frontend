<template>
  <main class="social-profile-page">
    <section class="social-profile-card" aria-labelledby="social-profile-title">
      <img class="profile-logo" src="../assets/senior-downsizing-hero.png" alt="" />
      <h1 id="social-profile-title">몇 가지만 더 확인할게요</h1>

      <form class="social-profile-form" @submit.prevent="submit">
        <label for="social-name">이름</label>
        <input
          id="social-name"
          v-model.trim="name"
          name="name"
          type="text"
          autocomplete="name"
          maxlength="100"
          placeholder="이름을 입력해주세요"
          required
        />

        <label for="social-birth-date">태어난년도</label>
        <input
          id="social-birth-date"
          v-model="birthDate"
          name="birthDate"
          type="date"
          autocomplete="bday"
          min="1900-01-01"
          :max="maxBirthDate"
          required
        />

        <p v-if="error" class="profile-error" role="alert">{{ error }}</p>

        <button class="profile-submit" type="submit" :disabled="submitting">
          {{ submitting ? '저장 중' : '다음' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authStore } from '../stores/authStore'

const router = useRouter()
const name = ref('')
const birthDate = ref('')
const error = ref('')
const submitting = ref(false)
const maxBirthDate = new Date().toISOString().slice(0, 10)

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
  display: grid;
  place-items: center;
  padding: 38px 20px;
  background: #f8f7f4;
}

.social-profile-card {
  width: min(100%, 560px);
  min-height: 610px;
  padding: 40px 58px 52px;
  border: 1px solid #aaa69f;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 16px 38px rgba(48, 43, 35, 0.08);
}

.profile-logo {
  display: block;
  width: 104px;
  height: 104px;
  margin: 0 auto 30px;
  object-fit: contain;
}

h1 {
  margin: 0 0 54px;
  color: #090909;
  font-size: 34px;
  line-height: 1.25;
  font-weight: 900;
  text-align: center;
  letter-spacing: 0;
}

.social-profile-form {
  display: grid;
}

label {
  margin-bottom: 8px;
  color: #111;
  font-size: 18px;
  font-weight: 900;
}

label:not(:first-child) {
  margin-top: 34px;
}

input {
  width: 100%;
  height: 54px;
  padding: 0 6px;
  border: 0;
  border-bottom: 1px solid #c3c0ba;
  border-radius: 0;
  background: #fff;
  color: #24211d;
  outline: none;
  font-size: 21px;
}

input::placeholder {
  color: #8b8a87;
  opacity: 1;
}

input:focus {
  border-bottom-color: #9a7100;
  box-shadow: 0 2px 0 #ffca00;
}

input[type="date"] {
  color: #8b8a87;
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
  height: 52px;
  margin-top: 24px;
  border-radius: 8px;
  background: #ffca00;
  color: #4a4439;
  font-size: 21px;
  font-weight: 900;
}

.profile-submit:hover:not(:disabled) {
  background: #f2b900;
}

.profile-submit:focus-visible,
input:focus-visible {
  outline: 3px solid #2d7d5a;
  outline-offset: 3px;
}

@media (max-width: 620px) {
  .social-profile-page {
    place-items: start center;
    padding: 18px 14px;
  }

  .social-profile-card {
    min-height: calc(100vh - 36px);
    padding: 32px 26px 40px;
    border-radius: 20px;
  }

  .profile-logo {
    width: 86px;
    height: 86px;
    margin-bottom: 24px;
  }

  h1 {
    margin-bottom: 44px;
    font-size: 28px;
  }

  input {
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  input,
  .profile-submit {
    transition: border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease;
  }
}
</style>
