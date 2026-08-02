<script setup>
import { useRouter } from 'vue-router';
import '@/styles/survey-tokens.css';

// 금융상품 관심(금액 배분) 화면 스텁. 백엔드/기능 구현 예정.
const router = useRouter();
</script>

<template>
  <div class="fav-shell">
    <button class="link-back" type="button" @click="router.push('/recommendation/result')">
      ← 추천 결과로 돌아가기
    </button>
    <div class="survey-card">
      <h1 class="f-title">관심 금융상품 (준비 중)</h1>
      <p class="f-sub">
        관심 등록한 상품에 투자 가능 금액을 %/원으로 배분하는 화면이에요. 곧 구현됩니다.
      </p>
    </div>
  </div>
</template>

<style scoped>
.fav-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 28px 20px 60px;
  font-family: "Pretendard", "Noto Sans KR", -apple-system, sans-serif;
  color: var(--text-dark);
}
.link-back {
  border: none; background: none; color: var(--text-muted);
  font-size: 14px; font-weight: 700; margin-bottom: 16px; cursor: pointer;
}
.f-title { font-weight: 800; font-size: 22px; margin: 0 0 6px; }
.f-sub { color: var(--text-muted); font-size: 14px; margin: 0; }
</style>
