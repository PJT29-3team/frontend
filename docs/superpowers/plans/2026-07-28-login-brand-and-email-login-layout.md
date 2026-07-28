# Login Brand and Email Login Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the provided PNG in a shared login header and rebuild the email login page to match the supplied full-page reference without changing authentication behavior.

**Architecture:** A shared `LoginHeader` owns the home link, PNG logo, `집현전` wordmark, underline, and right-side navigation. A shared `LoginFooter` owns the terms links. `LoginChoiceView` and `EmailLoginView` compose those components, while the email form remains local to `EmailLoginView` and keeps all existing state and submit behavior.

**Tech Stack:** Vue 3, Vue Router, scoped CSS, Lucide Vue, Vitest, Vue Test Utils, Vite

## Global Constraints

- Use `/Users/jojinhyeok/Downloads/image 15.png` without editing its pixels.
- Render the visible wordmark as exactly `집현전` with a short yellow underline.
- Keep `고객센터` and `회원가입` in the header.
- Do not change login submission, saved email, password visibility, verification resend, or navigation behavior.
- The email login page must be a white full-page layout with header, centered form, and footer; it must not show a bordered login card or hero image.
- Keep text at readable sizes and prevent overlaps at desktop and mobile widths.

---

### Task 1: Create the Shared Login Header and Footer

**Files:**
- Create: `src/assets/jiphyeonjeon-header-logo.png`
- Create: `src/components/LoginHeader.vue`
- Create: `src/components/LoginFooter.vue`
- Modify: `src/views/LoginChoiceView.test.js`
- Modify: `src/views/LoginChoiceView.vue`

**Interfaces:**
- Consumes: Vue Router `RouterLink`
- Produces: `<LoginHeader />` and `<LoginFooter />`

- [ ] **Step 1: Add failing assertions for the new brand structure**

Add to `LoginChoiceView.test.js`:

```javascript
expect(wrapper.get('.login-header__brand').attributes('aria-label')).toBe('집현전 홈')
expect(wrapper.get('.login-header__logo').attributes('src'))
  .toContain('jiphyeonjeon-header-logo.png')
expect(wrapper.get('.login-header__wordmark').text()).toBe('집현전')
expect(wrapper.get('.login-header__underline').exists()).toBe(true)
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/views/LoginChoiceView.test.js
```

Expected: FAIL because the current page uses the horizontal SVG and has no separate wordmark or underline.

- [ ] **Step 3: Copy the provided asset**

Run:

```bash
cp '/Users/jojinhyeok/Downloads/image 15.png' \
  src/assets/jiphyeonjeon-header-logo.png
```

Verify:

```bash
file src/assets/jiphyeonjeon-header-logo.png
```

Expected: 48 x 48 RGBA PNG.

- [ ] **Step 4: Create `LoginHeader.vue`**

Use this structure:

```vue
<template>
  <header class="login-header">
    <RouterLink class="login-header__brand" to="/" aria-label="집현전 홈">
      <img
        class="login-header__logo"
        src="../assets/jiphyeonjeon-header-logo.png"
        alt=""
      />
      <span class="login-header__wordmark">
        <span>집현전</span>
        <span class="login-header__underline" aria-hidden="true"></span>
      </span>
    </RouterLink>
    <nav class="login-header__nav" aria-label="로그인 보조 메뉴">
      <span>고객센터</span>
      <RouterLink to="/signup">회원가입</RouterLink>
    </nav>
  </header>
</template>
```

Move the existing header layout and navigation CSS from `LoginChoiceView.vue`. Set:

```css
.login-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #544f45;
  text-decoration: none;
}

.login-header__logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.login-header__wordmark {
  display: grid;
  justify-items: start;
  gap: 4px;
  font-size: 14px;
  font-weight: 800;
  line-height: 1;
}

.login-header__underline {
  width: 30px;
  height: 2px;
  background: #ffbc00;
}
```

- [ ] **Step 5: Create `LoginFooter.vue`**

```vue
<template>
  <footer class="login-footer">
    <span>이용약관</span>
    <span>개인정보처리방침</span>
  </footer>
</template>
```

Move the existing `.login-footer` styles from `LoginChoiceView.vue` into this component.

- [ ] **Step 6: Compose the shared components in `LoginChoiceView.vue`**

Replace the inline header and footer with:

```vue
<LoginHeader />
...
<LoginFooter />
```

Import:

```javascript
import LoginFooter from '../components/LoginFooter.vue'
import LoginHeader from '../components/LoginHeader.vue'
```

Remove only the header/footer styles that moved into the components.

- [ ] **Step 7: Run the focused and full tests**

Run:

```bash
npm test -- --run src/views/LoginChoiceView.test.js
npm test -- --run
```

Expected: all tests PASS.

- [ ] **Step 8: Commit the shared brand**

```bash
git add src/assets/jiphyeonjeon-header-logo.png \
  src/components/LoginHeader.vue \
  src/components/LoginFooter.vue \
  src/views/LoginChoiceView.vue \
  src/views/LoginChoiceView.test.js
git commit -m "style: 제공 로고로 로그인 헤더 브랜드 교체"
```

### Task 2: Rebuild the Email Login Page Layout

**Files:**
- Modify: `src/views/EmailLoginView.test.js`
- Modify: `src/views/EmailLoginView.vue`

**Interfaces:**
- Consumes: `<LoginHeader />`, `<LoginFooter />`, existing `authStore.login`, and `resendVerification`
- Produces: full-page `.email-login-page` with unframed `.email-login-panel`

- [ ] **Step 1: Add failing layout assertions**

Add to `EmailLoginView.test.js`:

```javascript
expect(wrapper.get('.login-header__wordmark').text()).toBe('집현전')
expect(wrapper.get('.login-header__logo').attributes('src'))
  .toContain('jiphyeonjeon-header-logo.png')
expect(wrapper.find('.email-login-card').exists()).toBe(false)
expect(wrapper.find('.login-heading img').exists()).toBe(false)
expect(wrapper.get('.email-login-panel').exists()).toBe(true)
expect(wrapper.get('.login-footer').text()).toContain('이용약관')
expect(wrapper.get('.login-footer').text()).toContain('개인정보처리방침')
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
npm test -- --run src/views/EmailLoginView.test.js
```

Expected: FAIL because the page currently uses a bordered card, hero image, and no shared header/footer.

- [ ] **Step 3: Replace the outer template structure**

Use:

```vue
<template>
  <div class="email-login-page">
    <LoginHeader />
    <main class="email-login-main">
      <section class="email-login-panel" aria-labelledby="email-login-title">
        <h1 id="email-login-title">로그인</h1>
        <form class="login-form" @submit.prevent="submit">
          <label class="sr-only" for="login-email">이메일</label>
          <input
            id="login-email"
            v-model.trim="email"
            name="email"
            type="email"
            autocomplete="username"
            placeholder="이메일을 입력하세요"
            required
          />

          <div class="password-input">
            <label class="sr-only" for="login-password">비밀번호</label>
            <input
              id="login-password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="비밀번호를 입력하세요"
              required
            />
            <button
              class="password-toggle"
              type="button"
              :aria-label="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
              :title="showPassword ? '비밀번호 숨기기' : '비밀번호 표시'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="19" aria-hidden="true" />
              <Eye v-else :size="19" aria-hidden="true" />
            </button>
          </div>

          <div class="login-options">
            <label>
              <input v-model="saveEmail" name="saveEmail" type="checkbox" />
              <span>이메일 저장</span>
            </label>
            <label>
              <input v-model="autoLogin" name="autoLogin" type="checkbox" />
              <span>자동 로그인</span>
            </label>
          </div>

          <div class="login-error" aria-live="polite">
            <p v-if="error" class="form-message danger">{{ error }}</p>
            <button
              v-if="verificationRequired"
              class="verification-resend"
              type="button"
              data-resend-verification
              :disabled="resendingVerification"
              @click="resendEmailVerification"
            >
              {{ resendingVerification ? '전송 중' : '인증 메일 다시 보내기' }}
            </button>
            <p v-if="verificationMessage" class="form-message success">
              {{ verificationMessage }}
            </p>
          </div>

          <RouterLink class="password-reset-link" to="/password/reset/request">
            비밀번호 찾기
          </RouterLink>

          <p class="signup-prompt">
            <span>계정이 없으신가요?</span>
            <RouterLink to="/signup">회원가입</RouterLink>
          </p>

          <button class="login-submit" type="submit" :disabled="submitting">
            {{ submitting ? '로그인 중' : '로그인' }}
          </button>
        </form>
      </section>
    </main>
    <LoginFooter />
  </div>
</template>
```

Import:

```javascript
import LoginFooter from '../components/LoginFooter.vue'
import LoginHeader from '../components/LoginHeader.vue'
```

Remove the `senior-downsizing-hero.png` image and `.email-login-card`.

- [ ] **Step 4: Apply the reference layout CSS**

Use these stable layout rules:

```css
.email-login-page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: #fff;
  color: #545045;
}

.email-login-main {
  display: grid;
  place-items: start center;
  padding: clamp(64px, 11vh, 118px) 20px 72px;
}

.email-login-panel {
  width: min(100%, 420px);
}

h1 {
  margin: 0 0 48px;
  color: #2f2b25;
  text-align: center;
  font-size: 32px;
  line-height: 1.3;
  font-weight: 800;
}
```

Keep the existing form controls and behaviors. Use 56px input and button heights, 6px or smaller corner radii, readable 15-16px form text, and the existing yellow focus treatment. Keep the existing mobile media query but update it for the unframed panel.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- --run src/views/EmailLoginView.test.js src/views/LoginChoiceView.test.js
```

Expected: PASS, including saved-email, error, verification resend, and password toggle tests.

- [ ] **Step 6: Run the full frontend suite and build**

Run:

```bash
npm test -- --run
npm run build
```

Expected: all tests PASS and Vite build succeeds.

- [ ] **Step 7: Commit the email login layout**

```bash
git add src/views/EmailLoginView.vue src/views/EmailLoginView.test.js
git commit -m "style: 이메일 로그인 화면을 기준 레이아웃에 맞춤"
```

### Task 3: Desktop and Mobile Visual Verification

**Files:**
- Modify only if screenshot review reveals a concrete layout defect

**Interfaces:**
- Consumes: `http://localhost:5173/login` and `http://localhost:5173/login/email`
- Produces: verified screenshots at 1422x759 and 390x844

- [ ] **Step 1: Start the frontend**

Run:

```bash
npm run dev -- --port 5173
```

- [ ] **Step 2: Capture desktop screenshots**

Capture `/login` and `/login/email` at 1422x759. Verify:

- the provided logo is not stretched
- `집현전` and its underline align beside the logo
- `고객센터` and `회원가입` remain right aligned
- email login has no card border or hero image
- header, form, and footer do not overlap

- [ ] **Step 3: Capture mobile screenshots**

Capture both routes at 390x844. Verify:

- header text and right-side links fit without clipping
- the form fits within the viewport
- labels, controls, and focus targets remain readable
- the footer follows content without overlap

- [ ] **Step 4: Run final verification**

Run:

```bash
npm test -- --run
npm run build
git status --short
```

Expected: all tests and build pass; only intentional task files are changed.
