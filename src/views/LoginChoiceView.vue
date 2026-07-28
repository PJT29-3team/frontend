<template>
  <div class="login-page">
    <header class="login-header">
      <RouterLink class="login-header__brand" to="/" aria-label="집현전 홈">
        <img
          class="login-header__logo"
          src="../assets/jiphyeonjeon-logo.svg"
          alt="집현전"
        />
      </RouterLink>
      <nav class="login-header__nav" aria-label="로그인 보조 메뉴">
        <span>고객센터</span>
        <RouterLink to="/signup">회원가입</RouterLink>
      </nav>
    </header>

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
            src="../assets/kakao-login-large-wide.png"
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

    <footer class="login-footer">
      <span>이용약관</span>
      <span>개인정보처리방침</span>
    </footer>
  </div>
</template>

<script setup>
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

.login-header {
  position: sticky;
  z-index: 10;
  top: 0;
  min-height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 12px clamp(20px, 5vw, 72px);
  border-bottom: 1px solid #e8e5de;
  background: rgba(255, 255, 255, 0.98);
}

.login-header__brand {
  display: inline-flex;
  align-items: center;
}

.login-header__logo {
  display: block;
  width: 150px;
  height: 50px;
  object-fit: contain;
  object-position: left center;
}

.login-header__nav {
  display: flex;
  align-items: center;
  gap: 28px;
  color: #60584c;
  font-size: 16px;
  font-weight: 700;
}

.login-header__nav a {
  color: inherit;
  text-decoration: none;
}

.login-header__nav a:focus-visible,
.login-header__nav a:hover {
  color: #816843;
  text-decoration: underline;
  text-underline-offset: 5px;
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

.login-footer {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin: 0 clamp(20px, 5vw, 72px);
  border-top: 1px solid #eeeae3;
  color: #777167;
  font-size: 14px;
}

@media (max-width: 560px) {
  .login-header {
    min-height: 68px;
    padding-inline: 16px;
  }

  .login-header__logo {
    width: 118px;
    height: 42px;
  }

  .login-header__nav {
    gap: 14px;
    font-size: 14px;
  }

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
