<template>
  <div class="login-page">
    <LoginHeader />

    <main class="login-main">
      <section class="login-panel" aria-labelledby="login-title">
        <h1 id="login-title">로그인</h1>

        <div class="section-label"><span>소셜 로그인</span></div>
        <a
          class="login-button login-button--kakao"
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

        <div class="section-label section-label--basic"><span>기본 로그인</span></div>
        <RouterLink class="login-button login-button--email" to="/login/email">
          이메일로 로그인
        </RouterLink>

        <RouterLink class="password-link" to="/password/reset/request">
          비밀번호 찾기
        </RouterLink>

        <p class="signup-prompt">
          <span>계정이 없으신가요?</span>
          <RouterLink to="/signup">회원가입</RouterLink>
        </p>
      </section>
    </main>

    <LoginFooter />
  </div>
</template>

<script setup>
import LoginFooter from '../../components/auth/LoginFooter.vue'
import LoginHeader from '../../components/auth/LoginHeader.vue'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #545045;
}

.login-main {
  display: grid;
  place-items: start center;
  padding: clamp(64px, 11vh, 118px) 20px 72px;
}

.login-panel {
  width: min(100%, 420px);
  text-align: center;
}

h1 {
  margin: 0 0 48px;
  color: #2f2b25;
  font-size: 36px;
  line-height: 1.3;
  font-weight: 800;
}

.section-label {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  color: #7a746b;
  font-size: 16px;
  font-weight: 700;
}

.section-label::before,
.section-label::after {
  content: "";
  height: 1px;
  flex: 1;
  background: #e5e1d9;
}

.section-label--basic {
  margin-top: 34px;
}

.login-button {
  width: 100%;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: #403a30;
  font-size: 18px;
  font-weight: 800;
  text-decoration: none;
}

.login-button--kakao {
  min-height: 0;
  overflow: hidden;
  border: 0;
  border-radius: 12px;
  background: transparent;
}

.login-button--kakao:hover,
.login-button--kakao:focus-visible {
  background: transparent;
  filter: brightness(0.97);
}

.login-button__kakao-image {
  display: block;
  width: 100%;
  height: auto;
}

.login-button--email {
  border-color: #cfc9be;
  background: #fff;
}

.login-button--email:hover,
.login-button--email:focus-visible {
  border-color: #816843;
  background: #fffaf0;
}

.login-button:focus-visible,
.password-link:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.45);
  outline-offset: 3px;
}

.password-link {
  display: inline-block;
  margin-top: 26px;
  color: #60584c;
  font-size: 16px;
  font-weight: 700;
  text-underline-offset: 5px;
}

.signup-prompt {
  margin: 28px 0 0;
  color: #777167;
  font-size: 16px;
}

.signup-prompt span {
  margin-right: 10px;
}

.signup-prompt a {
  color: #816843;
  font-weight: 800;
  text-underline-offset: 5px;
}

@media (max-width: 560px) {
  .login-main {
    padding: 52px 20px 56px;
  }

  h1 {
    margin-bottom: 40px;
    font-size: 32px;
  }

  .login-button {
    min-height: 58px;
  }
}
</style>
