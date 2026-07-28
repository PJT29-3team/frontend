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

export const authStore = {
  state: reactive({
    accessToken: storage.getItem(ACCESS_TOKEN_KEY) || '',
    user: null,
  }),

  setSession(accessToken, user) {
    this.state.accessToken = accessToken
    this.state.user = user
    if (accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken)
    }
  },

  clearSession() {
    this.state.accessToken = ''
    this.state.user = null
    storage.removeItem(ACCESS_TOKEN_KEY)
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

  async linkKakaoAccount(password) {
    const response = await authApi.linkKakaoAccount(password)
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
