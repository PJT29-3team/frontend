import { reactive } from 'vue'
import * as authApi from '../api/authApi'

const storage = {
  getItem(key) {
    return typeof sessionStorage === 'undefined' ? '' : sessionStorage.getItem(key)
  },
  setItem(key, value) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(key, value)
    }
  },
  removeItem(key) {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(key)
    }
  },
}

const ACCESS_TOKEN_KEY = 'jh_access_token'
const USER_KEY = 'jh_auth_user'

function loadStoredUser() {
  const raw = storage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    storage.removeItem(USER_KEY)
    return null
  }
}

export const authStore = {
  state: reactive({
    accessToken: storage.getItem(ACCESS_TOKEN_KEY) || '',
    user: loadStoredUser(),
  }),

  setSession(accessToken, user) {
    this.state.accessToken = accessToken
    this.state.user = user

    if (accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken)
      storage.setItem(USER_KEY, JSON.stringify(user ?? null))
      return
    }

    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(USER_KEY)
  },

  clearSession() {
    this.state.accessToken = ''
    this.state.user = null
    storage.removeItem(ACCESS_TOKEN_KEY)
    storage.removeItem(USER_KEY)
  },

  async login(email, password) {
    const response = await authApi.login(email, password)
    this.setSession(response.accessToken, response.user)
    return response
  },

  async refresh() {
    const response = await authApi.refresh()
    this.setSession(response.accessToken, response.user)
    return response
  },

  async completeSocialProfile(name, birthYear) {
    const response = await authApi.completeSocialProfile(name, birthYear)
    this.setSession(response.accessToken, response.user)
    return response
  },

  async logout() {
    await authApi.logout()
    this.clearSession()
  },
}

export function resetAuthStoreForTest() {
  authStore.clearSession()
}
