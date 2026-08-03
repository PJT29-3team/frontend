<template>
  <MemberPageLayout action-label="회원가입" action-to="/signup">
    <section class="login-content" aria-labelledby="login-title">
      <div class="login-panel">
        <h1 id="login-title">로그인</h1>

        <div class="divider"><span>소셜 로그인</span></div>
        <a
          class="kakao-login"
          data-social-provider="kakao"
          :href="`${apiBaseUrl}/api/auth/social/kakao`"
          aria-label="카카오 로그인"
        >
          <img
            class="login-button__kakao-image"
            src="../../assets/kakao-login-large-wide.png"
            alt=""
          />
        </a>

        <div class="divider basic-divider"><span>기본 로그인</span></div>
        <a class="email-login" href="/login/email">이메일로 로그인</a>
        <a class="reset-link" href="/password/reset/request">비밀번호 찾기</a>

        <div class="signup-row">
          <span>계정이 없으신가요?</span>
          <a href="/signup">회원가입</a>
        </div>
      </div>
    </section>
  </MemberPageLayout>
</template>

<script setup>
import MemberPageLayout from '../components/MemberPageLayout.vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
</script>

<style scoped>
.login-content {
  display: grid;
  place-items: center;
  padding: 64px 24px 100px;
}

.login-panel {
  width: min(100%, 300px);
  text-align: center;
}

h1 {
  margin: 0 0 44px;
  font-size: 28px;
  line-height: 1.3;
  font-weight: 800;
}

.divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 0 18px;
  color: #b8b3aa;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: "";
  height: 1px;
  flex: 1;
  background: #eeeae3;
}

.kakao-login,
.kakao-login img {
  display: block;
  width: 100%;
  height: auto;
}

.basic-divider {
  margin-top: 30px;
}

.email-login {
  width: 100%;
  min-height: 45px;
  display: grid;
  place-items: center;
  border: 1px solid #d8d4cc;
  border-radius: 5px;
  color: #3e3a34;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.reset-link {
  display: inline-block;
  margin: 22px 0 24px;
  color: #79746c;
  font-size: 13px;
  text-decoration: none;
}

.signup-row {
  display: flex;
  justify-content: center;
  gap: 6px;
  color: #8a857d;
  font-size: 13px;
}

.signup-row a {
  color: #398bd5;
  font-weight: 700;
  text-decoration: none;
}

a:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.45);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .login-content {
    align-items: start;
    padding: 64px 24px;
  }

  h1 {
    margin-bottom: 36px;
  }
}
</style>
