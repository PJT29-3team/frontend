<template>
  <main class="auth-page">
    <div class="auth-shell">
      <AuthCard title="회원가입">
        <form class="signup-form" @submit.prevent="submit">
          <label class="email-group">
            <span>이메일</span>
            <div>
              <input v-model.trim="emailLocal" name="emailLocal" autocomplete="username" placeholder="email" />
              <span>@</span>
              <select v-model="emailDomain" name="emailDomain">
                <option value="gmail.com">gmail.com</option>
                <option value="naver.com">naver.com</option>
                <option value="kakao.com">kakao.com</option>
                <option value="example.com">example.com</option>
              </select>
            </div>
          </label>

          <FormField label="비밀번호">
            <input v-model="password" name="password" type="password" autocomplete="new-password" placeholder="Password" />
          </FormField>
          <FormField label="비밀번호 확인">
            <input v-model="passwordConfirm" name="passwordConfirm" type="password" autocomplete="new-password" placeholder="Password" />
          </FormField>
          <FormField label="이름">
            <input v-model.trim="name" name="name" placeholder="이름을 입력해주세요" />
          </FormField>
          <FormField label="나이">
            <input
              v-model="birthDate"
              name="birthDate"
              type="date"
              min="1900-01-01"
              :max="maxBirthDate"
              aria-label="생년월일 선택"
            />
          </FormField>

          <p class="form-message" :class="error ? 'danger' : isValid ? 'success' : 'danger'">
            {{ error || (isValid ? '가입 조건이 충족되었습니다.' : validationMessage) }}
          </p>
          <button class="primary-button" type="submit" :disabled="!isValid || submitting">
            가입하기
          </button>
        </form>
      </AuthCard>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthCard from '../components/AuthCard.vue'
import FormField from '../components/FormField.vue'
import { signup } from '../api/authApi'

const router = useRouter()
const emailLocal = ref('')
const emailDomain = ref('gmail.com')
const password = ref('')
const passwordConfirm = ref('')
const name = ref('')
const birthDate = ref('')
const submitting = ref(false)
const error = ref('')

const now = new Date()
const maxBirthDate = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
].join('-')

const email = computed(() => `${emailLocal.value}@${emailDomain.value}`)
const isEmailValid = computed(() => emailLocal.value.length > 0 && email.value.includes('@'))
const isPasswordValid = computed(() => password.value.length >= 8)
const isPasswordMatched = computed(() => password.value && password.value === passwordConfirm.value)
const isNameValid = computed(() => name.value.length > 0)
const isBirthDateValid = computed(() =>
  /^\d{4}-\d{2}-\d{2}$/.test(birthDate.value) &&
  birthDate.value >= '1900-01-01' &&
  birthDate.value <= maxBirthDate
)
const isValid = computed(() =>
  isEmailValid.value &&
  isPasswordValid.value &&
  isPasswordMatched.value &&
  isNameValid.value &&
  isBirthDateValid.value
)

const validationMessage = computed(() => {
  if (!isEmailValid.value) return '이메일 형식이 올바르지 않습니다.'
  if (!isPasswordValid.value) return '영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.'
  if (!isPasswordMatched.value) return '비밀번호가 서로 일치하지 않습니다.'
  if (!isNameValid.value) return '이름을 입력해주세요.'
  return '생년월일을 확인해주세요.'
})

async function submit() {
  if (!isValid.value) return
  error.value = ''
  submitting.value = true
  try {
    await signup({
      email: email.value,
      password: password.value,
      passwordConfirm: passwordConfirm.value,
      name: name.value,
      birthYear: Number(birthDate.value.slice(0, 4)),
    })
    router.push('/login')
  } catch (e) {
    error.value = e.response?.data?.message || '회원가입 서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.signup-form {
  display: grid;
  gap: 12px;
}

.email-group {
  display: grid;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
}

.email-group > div {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(110px, 130px);
  align-items: center;
  gap: 6px;
}

.email-group input,
.email-group select {
  height: 38px;
  border: 0;
  border-bottom: 1px solid #bdb8af;
  outline: none;
}
</style>
