<template>
  <MemberPageLayout action-label="로그인" action-to="/login">
    <section class="verification-content" aria-live="polite">
      <LoaderCircle v-if="state === 'checking'" class="spin status-icon" :size="42" aria-hidden="true" />
      <span v-else-if="state === 'success'" class="success-icon">
        <Check :size="26" stroke-width="3" aria-hidden="true" />
      </span>
      <CircleAlert v-else class="error-icon status-icon" :size="42" aria-hidden="true" />

      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <RouterLink v-if="state !== 'checking'" class="primary-link" to="/signup">
        {{ state === 'success' ? '회원정보 입력하기' : '인증 메일 다시 받기' }}
      </RouterLink>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import { Check, CircleAlert, LoaderCircle } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AuthCard from '../../components/auth/AuthCard.vue'
import { verifyEmail } from '../../api/authApi'
import MemberPageLayout from '../../components/MemberPageLayout.vue'
import { saveSignupVerification } from '../../stores/signupVerificationStore'

const route = useRoute()
const state = ref('checking')
const message = ref('이메일 인증을 확인하고 있습니다.')
const title = computed(() => {
  if (state.value === 'success') return '이메일 인증이 완료되었습니다'
  if (state.value === 'error') return '이메일 인증을 완료하지 못했습니다'
  return '인증 링크를 확인하고 있습니다'
})

onMounted(async () => {
  try {
    const response = await verifyEmail(route.query.token)
    saveSignupVerification(response.email, response.signupCompletionToken)
    state.value = 'success'
    message.value = response.message || '회원가입 화면에서 나머지 정보를 입력해주세요.'
  } catch (error) {
    state.value = 'error'
    message.value = error.response?.data?.message || '인증 링크가 만료되었거나 유효하지 않습니다.'
  }
})
</script>

<style scoped>

.verification-content {
  width: min(100% - 40px, 390px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  place-self: center;
  padding: 70px 0 110px;
  text-align: center;
}

.success-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: #19bf67;
  color: #fff;
}

.status-icon {
  margin-bottom: 20px;
  color: #716b63;
}

.error-icon {
  color: #e4433b;
}

h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
}

p {
  margin: 10px 0 24px;
  color: #858078;
  font-size: 12px;
}

.primary-link {
  width: 300px;
  max-width: 100%;
  min-height: 44px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #ffbf00;
  color: #2f2920;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
}

.verification-content {
  width: min(100% - 40px, 390px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  place-self: center;
  padding: 70px 0 110px;
  text-align: center;
}

.success-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  background: #19bf67;
  color: #fff;
}

.status-icon {
  margin-bottom: 20px;
  color: #716b63;
}

.error-icon {
  color: #e4433b;
}

h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.4;
}

p {
  margin: 10px 0 24px;
  color: #858078;
  font-size: 12px;
}

.primary-link {
  width: 300px;
  max-width: 100%;
  min-height: 44px;
  display: grid;
  place-items: center;
  border-radius: 5px;
  background: #ffbf00;
  color: #2f2920;
  text-decoration: none;
  font-size: 13px;
  font-weight: 800;
}


.spin {
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
