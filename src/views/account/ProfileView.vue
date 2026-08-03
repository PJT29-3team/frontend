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

        <div class="section-divider"></div>
        <h2>비밀번호 변경</h2>
        <form class="stack" data-password-form @submit.prevent="submitPasswordChange">
          <FormField label="현재 비밀번호">
            <input
              v-model="currentPassword"
              name="currentPassword"
              type="password"
              autocomplete="current-password"
            />
          </FormField>
          <FormField label="새 비밀번호">
            <input
              v-model="newPassword"
              name="newPassword"
              type="password"
              autocomplete="new-password"
            />
          </FormField>
          <p v-if="newPassword" class="field-message" :class="isNewPasswordValid ? 'success' : 'danger'">
            {{ isNewPasswordValid ? '사용 가능한 비밀번호입니다.' : PASSWORD_RULE_MESSAGE }}
          </p>
          <FormField label="새 비밀번호 확인">
            <input
              v-model="newPasswordConfirm"
              name="newPasswordConfirm"
              type="password"
              autocomplete="new-password"
            />
          </FormField>
          <p
            v-if="newPasswordConfirm"
            class="field-message"
            :class="isNewPasswordMatched ? 'success' : 'danger'"
          >
            {{ isNewPasswordMatched ? '비밀번호가 일치합니다.' : '비밀번호가 서로 일치하지 않습니다.' }}
          </p>
          <p v-if="passwordError" class="form-message danger" aria-live="polite">{{ passwordError }}</p>
          <button
            class="primary-button"
            data-change-password
            type="submit"
            :disabled="!isPasswordFormValid || changingPassword"
          >
            {{ changingPassword ? '변경 중' : '비밀번호 변경' }}
          </button>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '@/components/auth/AuthCard.vue'
import FormField from '@/components/auth/FormField.vue'
import { authStore } from '@/stores/authStore'
import {
  cancelDeletion,
  changePassword,
  getMe,
  logoutAll as logoutAllApi,
  requestDeletion,
  updateMe,
} from '@/api/authApi'
import { isStrongPassword, PASSWORD_RULE_MESSAGE } from '@/utils/passwordPolicy'

const router = useRouter()
const name = ref('')
const birthYear = ref('')
const message = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const passwordError = ref('')
const changingPassword = ref(false)

const isNewPasswordValid = computed(() => isStrongPassword(newPassword.value))
const isNewPasswordMatched = computed(() =>
  Boolean(newPassword.value) && newPassword.value === newPasswordConfirm.value
)
const isPasswordFormValid = computed(() =>
  Boolean(currentPassword.value) && isNewPasswordValid.value && isNewPasswordMatched.value
)

onMounted(async () => {
  const me = await getMe()
  name.value = me.name || ''
  birthYear.value = me.birthYear || ''
})

async function save() {
  await updateMe({ name: name.value, birthYear: Number(birthYear.value) })
  message.value = '내 정보가 저장되었습니다.'
}

async function submitPasswordChange() {
  if (!isPasswordFormValid.value || changingPassword.value) return

  passwordError.value = ''
  changingPassword.value = true
  try {
    await changePassword(
      currentPassword.value,
      newPassword.value,
      newPasswordConfirm.value
    )
    authStore.clearSession()
    await router.push('/login/email')
  } catch (error) {
    passwordError.value = error.response?.data?.message || '비밀번호를 변경하지 못했습니다.'
  } finally {
    changingPassword.value = false
  }
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

.section-divider {
  height: 1px;
  margin: 24px 0;
  background: #e3dfd8;
}

h2 {
  margin: 0 0 16px;
  color: #3b3730;
  font-size: 17px;
}

.field-message {
  margin: -4px 0 2px;
  font-size: 12px;
  line-height: 1.45;
}

.field-message.success {
  color: var(--jh-success);
}

.field-message.danger {
  color: var(--jh-danger);
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
