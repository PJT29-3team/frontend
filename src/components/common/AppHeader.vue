<template>
  <header class="header">
    <div class="logo-area">
      <img :src="logo" class="logo" />
      <span class="title-name">작은 둥지</span>
    </div>

    <div class="right-area">
      <button class="report-btn">
        보고서 받기 <span class="arrow">▾</span>
      </button>
      <button class="mypage-btn">마이페이지</button>
      <!-- 홍길동 은 하드코딩 됨. -->
      <span class="user-name">홍길동 님, 환영합니다.</span>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/jiphyeonjeon-header-logo.png'
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 60px;
  background-color: #545045;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo {
  width: 28px;
  height: 28px;
}

.right-area {
  display: flex;
  align-items: center;
  gap: 16px;
}

.report-btn {
  border-radius: 20px;
  background-color: #FDF7E6;
  padding: 8px 16px;
}

.mypage-btn {
  border-radius: 20px;
  background-color: #545045;
  border: 2px solid #A69C8C;
  padding: 8px 16px;
  color: white;
}

.user-name {
  color: white;
}

.title-name {
  color: white;
}
</style>