<template>
  <main class="auth-page">
    <div class="auth-shell">
      <AuthCard title="이메일 인증">
        <p class="form-message" :class="ok ? 'success' : 'danger'">{{ message }}</p>
        <RouterLink class="primary-button route-button" to="/login/email">로그인하러 가기</RouterLink>
      </AuthCard>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import { verifyEmail } from '../api/authApi'

const route = useRoute()
const ok = ref(false)
const message = ref('이메일 인증을 확인하고 있습니다.')

onMounted(async () => {
  try {
    await verifyEmail(route.query.token)
    ok.value = true
    message.value = '이메일 인증이 완료되었습니다.'
  } catch (e) {
    message.value = e.response?.data?.message || '인증 링크가 만료되었거나 유효하지 않습니다.'
  }
})
</script>

<style scoped>
.route-button {
  display: grid;
  place-items: center;
  margin-top: 16px;
  text-decoration: none;
}
</style>
