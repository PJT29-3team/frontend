<template>
  <main class="social-callback-page">
    <section class="social-callback-card" aria-live="polite">
      <img src="../assets/senior-downsizing-hero.png" alt="" />
      <h1>{{ error ? '로그인하지 못했습니다' : '로그인 중입니다' }}</h1>
      <h2 v-if="error">{{ error.title }}</h2>
      <p>{{ error ? error.message : '카카오 계정 정보를 확인하고 있습니다.' }}</p>
      <RouterLink v-if="error" to="/login">로그인 화면으로 돌아가기</RouterLink>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authStore } from '../stores/authStore'

const route = useRoute()
const router = useRouter()
const error = ref(null)

const errorMessages = {
  access_denied: {
    title: '카카오 로그인이 취소되었습니다',
    message: '카카오 로그인을 다시 선택하거나 이메일로 로그인해 주세요.',
  },
  invalid_state: {
    title: '로그인 시간이 지났습니다',
    message: '안전을 위해 로그인을 중단했습니다. 처음부터 다시 로그인해 주세요.',
  },
  email_required: {
    title: '카카오 이메일 확인이 필요합니다',
    message: '카카오 계정의 이메일 제공에 동의한 뒤 다시 로그인해 주세요.',
  },
  configuration_error: {
    title: '카카오 로그인을 준비하고 있습니다',
    message: '잠시 후 다시 시도하거나 이메일로 로그인해 주세요.',
  },
  provider_error: {
    title: '카카오 연결이 원활하지 않습니다',
    message: '잠시 후 처음부터 다시 로그인해 주세요.',
  },
}

onMounted(async () => {
  if (route.query.error === 'account_conflict') {
    window.alert('이미 이메일로 가입한 회원입니다.')
    await router.replace('/login/email')
    return
  }

  if (route.query.error) {
    error.value = errorMessages[route.query.error] || errorMessages.provider_error
    return
  }

  if (route.query.profileRequired === 'true') {
    await router.replace('/social/profile')
    return
  }

  try {
    await authStore.refresh()
    await router.replace('/main')
  } catch (e) {
    error.value = {
      title: '로그인을 완료하지 못했습니다',
      message: e.response?.data?.message || '잠시 후 처음부터 다시 로그인해 주세요.',
    }
  }
})
</script>

<style scoped>
.social-callback-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #f8f7f4;
}

.social-callback-card {
  width: min(100%, 360px);
  padding: 38px 30px;
  border: 1px solid #d8d4cc;
  border-radius: 8px;
  background: #fff;
  text-align: center;
  box-shadow: 0 10px 28px rgba(47, 43, 37, 0.08);
}

img {
  width: 72px;
  height: 72px;
  object-fit: contain;
}

h1 {
  margin: 18px 0 8px;
  color: #171613;
  font-size: 28px;
}

h2 {
  margin: 20px 0 8px;
  color: #2f2b25;
  font-size: 22px;
  line-height: 1.4;
}

p {
  margin: 0;
  color: #77736c;
  font-size: 17px;
  line-height: 1.65;
}

a {
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  padding: 0 22px;
  border-radius: 6px;
  background: #ffcc00;
  color: #544f45;
  font-weight: 800;
  text-decoration: none;
}
</style>
