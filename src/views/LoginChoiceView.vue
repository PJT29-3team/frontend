<template>
  <main class="auth-page">
    <div class="auth-shell">
      <AuthCard title="로그인">
        <div class="social-label">소셜 로그인</div>
        <a
          class="social-button kakao"
          data-social-provider="kakao"
          :href="`${apiBaseUrl}/api/auth/social/kakao`"
        >
          카카오 로그인
        </a>
        <div class="divider"><span>기본 로그인</span></div>
        <a class="secondary-button route-button" href="/login/email">이메일로 로그인</a>
        <a class="text-link reset-link" href="/password/reset/request">비밀번호 찾기</a>
        <div class="link-row">
          <span>계정이 없으신가요?</span>
          <a href="/signup">회원가입</a>
        </div>
      </AuthCard>
    </div>
  </main>
</template>

<script setup>
import AuthCard from '../components/AuthCard.vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
</script>

<style scoped>
.social-label,
.divider {
  color: #b5b0a8;
  text-align: center;
  font-size: 12px;
  margin-bottom: 10px;
}

.social-button {
  width: 100%;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  margin-bottom: 10px;
  text-decoration: none;
  font-weight: 800;
}

.kakao {
  background: #ffde00;
  color: #2c2417;
}

.divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 14px 0;
}

.divider::before,
.divider::after {
  content: "";
  height: 1px;
  flex: 1;
  background: #ece8e1;
}

.route-button {
  display: grid;
  place-items: center;
  text-decoration: none;
}

.reset-link {
  display: block;
  margin: 14px 0;
  text-align: center;
  font-size: 13px;
  color: #7f7a72;
}
</style>
