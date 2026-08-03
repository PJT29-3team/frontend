import axios from 'axios'
import { authStore } from '../stores/authStore'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  if (authStore.state.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.state.accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isRefreshRequest = originalRequest?.url === '/api/auth/refresh'
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
      originalRequest._retry = true
      try {
        await authStore.refresh()
        originalRequest.headers.Authorization = `Bearer ${authStore.state.accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        authStore.clearSession()
      }
    }
    return Promise.reject(error)
  },
)
