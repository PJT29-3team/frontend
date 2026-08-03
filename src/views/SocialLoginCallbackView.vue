<template>
  <main class="social-callback-page">
    <section class="social-callback-card" aria-live="polite">
      <img src="../assets/senior-downsizing-hero.png" alt="" />
      <h1>{{ error ? '로그인하지 못했습니다' : '로그인 중입니다' }}</h1>
      <p>{{ error || '소셜 계정 정보를 확인하고 있습니다.' }}</p>
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
const error = ref('')

const errorMessages = {
  access_denied: '카카오 로그인이 취소되었습니다.',
  invalid_state: '로그인 요청이 만료되었습니다. 다시 시도해주세요.',
  email_required: '카카오계정 이메일 제공 동의가 필요합니다.',
  account_conflict: '이미 가입된 이메일입니다. 이메일로 로그인해주세요.',
  provider_error: '카카오 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
  configuration_error: '카카오 로그인 설정을 확인해주세요.',
}

onMounted(async () => {
  const errorCode = Array.isArray(route.query.error) ? route.query.error[0] : route.query.error
  if (errorCode) {
    error.value = errorMessages[errorCode] || errorMessages.provider_error
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
    error.value = e.response?.data?.message || '소셜 로그인 정보를 확인하지 못했습니다.'
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
  font-size: 24px;
}

p {
  margin: 0;
  color: #77736c;
  font-size: 14px;
}

a {
  display: inline-block;
  margin-top: 20px;
  color: #8a6700;
  font-weight: 800;
}
</style>
