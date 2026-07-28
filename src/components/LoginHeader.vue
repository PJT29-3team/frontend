<template>
  <header class="login-header">
    <RouterLink class="login-header__brand" to="/" aria-label="작은둥지 홈">
      <img
        class="login-header__logo"
        src="../assets/jiphyeonjeon-header-logo.png"
        alt=""
      />
      <span class="login-header__wordmark">
        <span>작은</span><span class="login-header__wordmark-accent">둥지</span>
      </span>
    </RouterLink>
    <nav class="login-header__nav" aria-label="로그인 보조 메뉴">
      <span>고객센터</span>
      <RouterLink to="/signup">회원가입</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
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
  gap: 8px;
  color: #3e392f;
  text-decoration: none;
}

.login-header__logo {
  width: 40px;
  height: 40px;
  display: block;
  flex: 0 0 auto;
  object-fit: contain;
}

.login-header__wordmark {
  display: inline-flex;
  align-items: center;
  font-size: 18px;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.login-header__wordmark-accent {
  color: #f3b900;
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

.login-header__brand:focus-visible,
.login-header__nav a:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.45);
  outline-offset: 4px;
}

.login-header__nav a:hover {
  color: #816843;
  text-decoration: underline;
  text-underline-offset: 5px;
}

@media (max-width: 560px) {
  .login-header {
    min-height: 68px;
    padding-inline: 16px;
  }

  .login-header__logo {
    width: 36px;
    height: 36px;
  }

  .login-header__wordmark {
    font-size: 16px;
  }

  .login-header__nav {
    gap: 14px;
    font-size: 14px;
  }
}
</style>
