import { http } from './http'

export async function login(email, password, deviceName = navigator.userAgent) {
  const response = await http.post('/api/auth/login', { email, password, deviceName })
  return response.data
}

export async function refresh() {
  const response = await http.post('/api/auth/refresh')
  return response.data
}

export async function logout() {
  await http.post('/api/auth/logout')
}

export async function logoutAll() {
  await http.post('/api/auth/logout-all')
}

export async function completeSocialProfile(name, birthYear) {
  const response = await http.post('/api/auth/social/profile', { name, birthYear })
  return response.data
}

export async function signup(payload) {
  const response = await http.post('/api/auth/signup', payload)
  return response.data
}

export async function checkEmailAvailability(email) {
  const response = await http.get('/api/auth/email-availability', { params: { email } })
  return response.data
}

export async function resendVerification(email) {
  const response = await http.post('/api/auth/email-verifications/resend', { email })
  return response.data
}

export async function verifyEmail(token) {
  const response = await http.get('/api/auth/email-verifications/verify', { params: { token } })
  return response.data
}

export async function requestPasswordReset(email) {
  const response = await http.post('/api/auth/password-resets', { email })
  return response.data
}

export async function verifyPasswordReset(token) {
  const response = await http.get('/api/auth/password-resets/verify', { params: { token } })
  return response.data
}

export async function completePasswordReset(token, password, passwordConfirm) {
  const response = await http.post('/api/auth/password-resets/complete', { token, password, passwordConfirm })
  return response.data
}

export async function getMe() {
  const response = await http.get('/api/users/me')
  return response.data
}

export async function updateMe(payload) {
  const response = await http.patch('/api/users/me', payload)
  return response.data
}

export async function requestDeletion(password) {
  const response = await http.post('/api/users/me/deletion-request', { password })
  return response.data
}

export async function cancelDeletion() {
  const response = await http.post('/api/users/me/deletion-request/cancel')
  return response.data
}
