<template>
  <div class="member-page">
    <header class="member-header" data-member-header data-login-header>
      <div class="page-container header-inner">
        <a class="brand" href="/" aria-label="작은둥지 홈">
          <img src="../assets/small-nest-mark.png" alt="" />
          <span class="brand-wordmark">
            <span>작은</span><span class="brand-accent">둥지</span>
          </span>
        </a>
        <nav aria-label="회원 메뉴">
          <a href="#support">고객센터</a>
          <a :href="actionTo">{{ actionLabel }}</a>
        </nav>
      </div>
    </header>

    <main class="member-content">
      <slot />
    </main>

    <footer class="member-footer" data-member-footer data-login-footer>
      <div class="page-container footer-inner">
        <a href="#terms">이용약관</a>
        <span>© 작은둥지</span>
        <a href="#privacy">개인정보처리방침</a>
      </div>
    </footer>
  </div>
</template>

<script setup>
defineProps({
  actionLabel: {
    type: String,
    default: '로그인',
  },
  actionTo: {
    type: String,
    default: '/login',
  },
})
</script>

<style scoped>
.member-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #292722;
}

.page-container {
  width: min(100% - 48px, 1180px);
  margin: 0 auto;
}

.member-header,
.member-footer {
  border-color: #ece9e2;
}

.member-header {
  border-bottom: 1px solid #ece9e2;
}

.header-inner {
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #222;
  font-size: 15px;
  font-weight: 800;
  text-decoration: none;
}

.brand-wordmark {
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.brand-accent {
  color: #ffcc00;
}

.brand img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

nav {
  display: flex;
  align-items: center;
  gap: 22px;
}

nav a,
.member-footer a {
  color: #8b867d;
  font-size: 12px;
  text-decoration: none;
}

.member-content {
  min-width: 0;
  display: grid;
}

.member-footer {
  border-top: 1px solid #ece9e2;
}

.footer-inner {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: #aaa59d;
  font-size: 11px;
}

a:focus-visible {
  outline: 3px solid rgba(255, 188, 0, 0.45);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .page-container {
    width: min(100% - 32px, 1180px);
  }

  .header-inner {
    min-height: 54px;
  }

  nav a:first-child {
    display: none;
  }

  .footer-inner {
    flex-wrap: wrap;
    gap: 8px 14px;
    padding: 14px 0;
  }
}
</style>
