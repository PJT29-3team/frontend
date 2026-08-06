<template>
  <header class="header">
    <div class="logo-area">
      <img :src="logo" class="logo" />
      <span class="title-name">홀家분</span>
    </div>

    <div class="right-area">
      <button class="mypage-btn">마이페이지</button>
      <span class="user-name">{{ userName }}님 환영합니다.</span>
      <button class="logout-btn" @click="handleLogout">로그아웃</button>
    </div>
  </header>
</template>

<script setup>
import logo from '@/assets/jiphyeonjeon-header-logo.png';
import { authStore } from '@/stores/authStore.js';
import { useRouter } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const userName = computed(() => authStore.state.user?.name || authStore.state.user?.userName || '회원');

async function handleLogout() {
  await authStore.logout()
  router.push('/login');
}
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

.mypage-btn {
  border-radius: 20px;
  background-color: #545045;
  border: 2px solid #A69C8C;
  padding: 8px 16px;
  color: white;
}

.logout-btn {
  background: none;
  border: none;
  color: white;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
}

.user-name {
  color: white;
}

.title-name {
  color: white;
}
</style>
