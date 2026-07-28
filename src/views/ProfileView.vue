<template>
  <main class="auth-page">
    <div class="auth-shell">
      <AuthCard title="내 정보">
        <form class="stack" @submit.prevent="save">
          <FormField label="이름">
            <input v-model.trim="name" name="name" />
          </FormField>
          <FormField label="출생연도">
            <input v-model.number="birthYear" name="birthYear" inputmode="numeric" />
          </FormField>
          <button class="primary-button" type="submit">저장</button>
        </form>
        <div class="profile-actions">
          <button class="secondary-button" type="button" @click="logout">로그아웃</button>
          <button class="secondary-button" type="button" @click="logoutAll">전체 기기 로그아웃</button>
          <button class="danger-button" type="button" @click="requestDelete">회원탈퇴 요청</button>
          <button class="secondary-button" type="button" @click="cancelDelete">탈퇴 취소</button>
        </div>
        <p v-if="message" class="form-message success">{{ message }}</p>
      </AuthCard>
    </div>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import AuthCard from '../components/AuthCard.vue'
import FormField from '../components/FormField.vue'
import { authStore } from '../stores/authStore'
import { cancelDeletion, getMe, logoutAll as logoutAllApi, requestDeletion, updateMe } from '../api/authApi'

const name = ref('')
const birthYear = ref('')
const message = ref('')

onMounted(async () => {
  const me = await getMe()
  name.value = me.name || ''
  birthYear.value = me.birthYear || ''
})

async function save() {
  await updateMe({ name: name.value, birthYear: Number(birthYear.value) })
  message.value = '내 정보가 저장되었습니다.'
}

async function logout() {
  await authStore.logout()
  message.value = '로그아웃되었습니다.'
}

async function logoutAll() {
  await logoutAllApi()
  authStore.clearSession()
  message.value = '모든 기기에서 로그아웃되었습니다.'
}

async function requestDelete() {
  const password = window.prompt('현재 비밀번호를 입력해주세요.')
  if (!password) return
  await requestDeletion(password)
  message.value = '30일 회원탈퇴 유예가 시작되었습니다.'
}

async function cancelDelete() {
  await cancelDeletion()
  message.value = '회원탈퇴 요청이 취소되었습니다.'
}
</script>

<style scoped>
.stack,
.profile-actions {
  display: grid;
  gap: 12px;
}

.profile-actions {
  margin-top: 18px;
}

.danger-button {
  width: 100%;
  height: 42px;
  border-radius: 6px;
  background: #ffe8e8;
  color: #c33;
  font-weight: 800;
}
</style>
