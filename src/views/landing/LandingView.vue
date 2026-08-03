<template>
  <main class="landing-page">
    <header class="site-header" aria-label="주요 탐색">
      <a class="brand-link" href="#top" aria-label="집현전 홈">
        <img src="@/assets/senior-downsizing-hero.png" alt="" />
      </a>

      <nav class="site-nav" aria-label="랜딩페이지 메뉴">
        <a href="#top">홈</a>
        <a href="#services">서비스 기능</a>
        <a href="#reviews">이용후기</a>
      </nav>

      <RouterLink class="header-login" to="/login">로그인</RouterLink>
    </header>

    <section id="top" class="hero-section">
      <div class="hero-copy">
        <h1>시니어 다운사이징 서비스</h1>
        <p>
          수십 년간 살아온 큰 집을 현금 자산으로 전환하고,<br />
          더 편안한 소형 주택으로 이주해 보세요.<br />
          노후 자산은 지키면서 매달 안정적인 현금흐름을 만드는 스마트한 선택입니다.
        </p>
        <RouterLink class="hero-action" to="/login">서비스 이용하러 가기</RouterLink>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <img
          data-hero-illustration
          src="@/assets/senior-downsizing-hero.png"
          alt=""
        />
      </div>
    </section>

    <section id="services" class="service-section landing-section">
      <h2>서비스 기능</h2>
      <div class="service-grid">
        <article
          v-for="service in services"
          :key="service.title"
          class="service-item"
          data-service-item
        >
          <div class="service-icon" :data-service-icon="service.iconName">
            <component :is="service.icon" :size="35" stroke-width="1.7" aria-hidden="true" />
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
        </article>
      </div>
    </section>

    <section id="reviews" class="review-section landing-section">
      <h2>이용 후기</h2>
      <div
        class="review-marquee"
        data-review-marquee
        tabindex="0"
        aria-label="이용 후기 자동 슬라이드"
      >
        <div class="review-track">
          <div
            v-for="groupIndex in 2"
            :key="groupIndex"
            class="review-group"
            data-review-group
            :aria-hidden="groupIndex === 2 ? 'true' : null"
          >
            <article
              v-for="review in reviews"
              :key="`${groupIndex}-${review.name}`"
              class="review-item"
              data-review-card
              :data-review-item="groupIndex === 1 ? '' : null"
            >
              <Quote :size="48" fill="currentColor" stroke-width="0" aria-hidden="true" />
              <strong>{{ review.name }}</strong>
              <div class="review-summary">
                <span class="review-stars" :aria-label="`5점 만점에 ${review.rating}점`">
                  <span v-for="star in 5" :key="star" :class="{ muted: star > review.rating }">★</span>
                </span>
                <span>{{ review.time }}</span>
              </div>
              <p>{{ review.text }}</p>
              <i aria-hidden="true"></i>
            </article>
          </div>
        </div>
      </div>
    </section>

    <footer class="site-footer">
      <div class="footer-brand">
        <img src="@/assets/senior-downsizing-hero.png" alt="집현전" />
        <p>Copyright © 2026 Jiphyeonjeon.</p>
        <p>All rights reserved.</p>
        <div class="footer-social" aria-hidden="true">
          <span
            v-for="social in socialIcons"
            :key="social.name"
            :data-footer-icon="social.name"
          >
            <FontAwesomeIcon :icon="social.icon" />
          </span>
        </div>
      </div>

      <div class="footer-column">
        <strong>Company</strong>
        <a href="#services">About us</a>
        <a href="#reviews">Testimonials</a>
      </div>
      <div class="footer-column">
        <strong>Support</strong>
        <span>Help center</span>
        <span>Terms of service</span>
        <span>Privacy policy</span>
      </div>
      <div class="footer-column footer-newsletter">
        <strong>Stay up to date</strong>
        <form @submit.prevent="newsletterSent = true">
          <label class="sr-only" for="footer-email">이메일 주소</label>
          <input id="footer-email" v-model="newsletterEmail" type="email" placeholder="Your email address" required />
          <button type="submit" aria-label="소식 받기" title="소식 받기">
            <Send :size="18" aria-hidden="true" />
          </button>
        </form>
        <small v-if="newsletterSent" aria-live="polite">소식 신청이 접수되었습니다.</small>
      </div>
    </footer>
  </main>
</template>

<script setup>
import { faDribbble, faInstagram, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { Bell, Check, Quote, Search, Send } from '@lucide/vue'
import { ref } from 'vue'

const socialIcons = [
  { name: 'instagram', icon: faInstagram },
  { name: 'dribbble', icon: faDribbble },
  { name: 'twitter', icon: faTwitter },
  { name: 'youtube', icon: faYoutube },
]

const services = [
  {
    title: '현재 주택 정밀 분석',
    description: '안전, 편리, 자산 점수 등 3가지 핵심 지표를 통해 거주 중인 주택을 진단하고, 매도 시 확보 가능한 예상 현금 자산을 산출',
    icon: Search,
    iconName: 'search',
  },
  {
    title: '맞춤형 주거지 추천',
    description: '사용자가 설정한 자산 범위와 주거 선호 조건을 바탕으로 최적의 소형 주택을 필터링하여 추천하고, 기존 주택과의 비교 분석을 제공',
    icon: Check,
    iconName: 'check',
  },
  {
    title: '자산 운용 솔루션',
    description: '다운사이징으로 확보된 유동 자산을 효율적으로 관리할 수 있도록 개인 성향에 맞는 금융 상품을 제공',
    icon: Bell,
    iconName: 'bell',
  },
]

const reviews = [
  { name: '홍*동', time: '2 days ago', rating: 5, text: '자산과 주거 조건을 한눈에 비교할 수 있어 좋았습니다.' },
  { name: '김*순', time: '3 days ago', rating: 5, text: '집을 줄이는 과정이 막막했는데 순서가 보이기 시작했어요.' },
  { name: '이*자', time: '5 days ago', rating: 5, text: '병원과 시장이 가까운 주택을 차분히 비교해줘서 편했습니다.' },
  { name: '박*환', time: '1 week ago', rating: 4, text: '매도 후 현금흐름을 미리 볼 수 있어 가족과 의논하기 쉬웠습니다.' },
  { name: '윤*희', time: '2 weeks ago', rating: 5, text: '생활 동선과 관리 부담까지 살펴볼 수 있어 안심이 됐어요.' },
]

const newsletterEmail = ref('')
const newsletterSent = ref(false)
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #fff;
  color: #555;
  scroll-behavior: smooth;
}

.site-header {
  position: sticky;
  z-index: 10;
  top: 0;
  height: 92px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 48px;
  border-bottom: 1px solid #eeeeee;
  background: #fff;
}

.brand-link {
  justify-self: start;
  width: 76px;
  height: 76px;
  display: grid;
  place-items: center;
}

.brand-link img {
  width: 70px;
  height: 70px;
  object-fit: contain;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 62px;
}

.site-nav a {
  color: #555;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
}

.header-login,
.hero-action {
  display: inline-grid;
  place-items: center;
  border-radius: 3px;
  background: #ffc400;
  color: #555;
  text-decoration: none;
  font-weight: 700;
}

.header-login {
  justify-self: end;
  width: 106px;
  height: 52px;
}

.hero-section {
  min-height: 700px;
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 0.9fr);
  align-items: center;
  gap: 72px;
  padding: 90px clamp(72px, 7.5vw, 154px);
  background: #f4f7fb;
}

.hero-copy h1 {
  max-width: 760px;
  margin: 0;
  color: #535353;
  font-size: clamp(46px, 4.4vw, 64px);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: 0;
  word-break: keep-all;
}

.hero-copy p {
  margin: 96px 0 82px;
  color: #7b7b7b;
  font-size: 18px;
  line-height: 1.9;
}

.hero-action {
  width: 354px;
  max-width: 100%;
  height: 92px;
  font-size: 25px;
}

.hero-visual {
  display: grid;
  place-items: center;
}

.hero-visual img {
  width: min(100%, 560px);
  height: auto;
  object-fit: contain;
}

.landing-section {
  scroll-margin-top: 92px;
  padding: 68px clamp(70px, 6vw, 120px) 92px;
}

.landing-section h2 {
  margin: 0 0 66px;
  color: #535353;
  font-size: 40px;
  line-height: 1.2;
  letter-spacing: 0;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(34px, 8vw, 150px);
}

.service-item {
  min-height: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 54px 36px;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 10px 16px rgba(50, 82, 112, 0.13);
  text-align: center;
}

.service-icon {
  width: 74px;
  height: 70px;
  display: grid;
  place-items: center;
  margin-bottom: 36px;
  border-radius: 7px 7px 20px 7px;
  background: #fff0ad;
  color: #757575;
}

.service-item h3 {
  margin: 0 0 34px;
  color: #535353;
  font-size: 25px;
  line-height: 1.35;
}

.service-item p {
  margin: 0;
  color: #7a7a7a;
  font-size: 17px;
  line-height: 1.9;
  word-break: keep-all;
}

.review-section {
  padding-top: 18px;
  overflow: hidden;
}

.review-marquee {
  --review-gap: 46px;
  overflow: hidden;
  outline: none;
}

.review-marquee:focus-visible {
  box-shadow: inset 0 0 0 3px rgba(255, 196, 0, 0.65);
}

.review-track {
  width: max-content;
  display: flex;
  animation: review-marquee 34s linear infinite;
  will-change: transform;
}

.review-group {
  flex: none;
  display: flex;
  gap: var(--review-gap);
  padding-right: var(--review-gap);
}

.review-marquee:hover .review-track,
.review-marquee:focus-within .review-track {
  animation-play-state: paused;
}

.review-item {
  width: clamp(240px, 18vw, 310px);
  flex: 0 0 clamp(240px, 18vw, 310px);
  min-height: 360px;
  display: flex;
  flex-direction: column;
  padding: 42px 22px 32px;
  color: #53534b;
  box-shadow: 26px 0 22px -30px rgba(82, 101, 120, 0.48);
}

.review-item > svg {
  margin-bottom: 16px;
}

.review-item > strong {
  margin-bottom: 16px;
  color: #111;
  font-size: 19px;
}

.review-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
  color: #555;
  font-size: 13px;
  white-space: nowrap;
}

.review-stars {
  display: inline-flex;
  color: #fff;
  font-size: 16px;
}

.review-stars > span {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: #ffc400;
}

.review-stars > span.muted {
  background: #dddddd;
}

.review-item > p {
  margin: 0;
  color: #454545;
  font-size: 15px;
  line-height: 1.65;
}

.review-item > i {
  width: 86px;
  height: 1px;
  margin-top: 18px;
  background: #b7b7b7;
}

@keyframes review-marquee {
  to {
    transform: translateX(-50%);
  }
}

.site-footer {
  display: grid;
  grid-template-columns: minmax(320px, 1.6fr) repeat(3, minmax(150px, 0.65fr));
  gap: 60px;
  padding: 58px clamp(70px, 6vw, 120px) 62px;
  background: #b5b5b5;
  color: #fff;
}

.footer-brand img {
  width: 100px;
  height: 80px;
  object-fit: contain;
  margin-bottom: 12px;
}

.footer-brand p {
  margin: 0 0 8px;
  font-size: 13px;
}

.footer-social {
  display: flex;
  gap: 14px;
  margin-top: 38px;
}

.footer-social span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.footer-column {
  display: grid;
  align-content: start;
  gap: 14px;
}

.footer-column strong {
  margin-bottom: 12px;
  font-size: 17px;
}

.footer-column a,
.footer-column span {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 13px;
}

.footer-newsletter form {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 42px;
  max-width: 260px;
}

.footer-newsletter input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 0;
  border-radius: 7px 0 0 7px;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  outline: none;
}

.footer-newsletter input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.footer-newsletter button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 0 7px 7px 0;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.footer-newsletter small {
  margin-top: 2px;
  font-size: 11px;
}

.brand-link:focus-visible,
.site-nav a:focus-visible,
.header-login:focus-visible,
.hero-action:focus-visible,
.footer-column a:focus-visible,
.footer-newsletter input:focus-visible,
.footer-newsletter button:focus-visible {
  outline: 3px solid #555;
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 1180px) {
  .service-grid {
    gap: 28px;
  }

  .site-footer {
    grid-template-columns: 1.4fr repeat(2, 1fr);
  }

  .footer-newsletter {
    display: none;
  }
}

@media (max-width: 760px) {
  .site-header {
    height: 64px;
    grid-template-columns: 1fr auto;
    padding: 0 16px;
  }

  .brand-link,
  .brand-link img {
    width: 52px;
    height: 52px;
  }

  .site-nav {
    display: none;
  }

  .header-login {
    width: 82px;
    height: 40px;
    font-size: 13px;
  }

  .hero-section {
    min-height: auto;
    grid-template-columns: 1fr;
    gap: 36px;
    padding: 54px 22px 34px;
  }

  .hero-copy h1 {
    font-size: 36px;
  }

  .hero-copy p {
    margin: 34px 0;
    font-size: 15px;
  }

  .hero-copy p br {
    display: none;
  }

  .hero-action {
    width: 230px;
    height: 58px;
    font-size: 17px;
  }

  .hero-visual img {
    width: min(88vw, 360px);
  }

  .landing-section {
    padding: 58px 20px 70px;
  }

  .landing-section h2 {
    margin-bottom: 38px;
    font-size: 30px;
  }

  .service-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .review-marquee {
    --review-gap: 24px;
  }

  .review-item {
    width: min(82vw, 330px);
    flex-basis: min(82vw, 330px);
  }

  .service-item {
    min-height: 340px;
    padding: 42px 26px;
  }

  .review-item {
    min-height: 300px;
    padding: 30px 20px;
  }

  .site-footer {
    grid-template-columns: 1fr 1fr;
    gap: 42px 28px;
    padding: 46px 24px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .review-marquee {
    overflow-x: auto;
  }

  .review-track {
    animation: none;
    transform: none;
  }

  .review-group[aria-hidden="true"] {
    display: none;
  }
}
</style>
