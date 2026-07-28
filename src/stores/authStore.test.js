import { afterEach, describe, expect, it, vi } from 'vitest'
import { authStore, resetAuthStoreForTest } from './authStore'
import * as authApi from '../api/authApi'

describe('authStore', () => {
  afterEach(() => {
    resetAuthStoreForTest()
    vi.restoreAllMocks()
  })

  it('stores access token after email login', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({
      accessToken: 'access-token',
      expiresInSeconds: 900,
      user: { userId: 'user-1', email: 'senior@example.com', name: '김집현' },
    })

    await authStore.login('senior@example.com', 'SeniorHome!23')

    expect(authStore.state.accessToken).toBe('access-token')
    expect(authStore.state.user.email).toBe('senior@example.com')
  })

  it('stores the issued session after completing a social profile', async () => {
    vi.spyOn(authApi, 'completeSocialProfile').mockResolvedValue({
      accessToken: 'social-access-token',
      expiresInSeconds: 900,
      user: { userId: 'social-1', email: 'social@example.com', name: '김집현' },
    })

    await authStore.completeSocialProfile('김집현', 1955)

    expect(authApi.completeSocialProfile).toHaveBeenCalledWith('김집현', 1955)
    expect(authStore.state.accessToken).toBe('social-access-token')
    expect(authStore.state.user.name).toBe('김집현')
  })

  it('stores the issued session after linking a Kakao account', async () => {
    vi.spyOn(authApi, 'linkKakaoAccount').mockResolvedValue({
      accessToken: 'linked-access-token',
      expiresInSeconds: 900,
      user: { userId: 'user-1', email: 'senior@example.com', name: '김집현' },
    })

    await authStore.linkKakaoAccount('SeniorHome!23')

    expect(authApi.linkKakaoAccount).toHaveBeenCalledWith('SeniorHome!23')
    expect(authStore.state.accessToken).toBe('linked-access-token')
    expect(authStore.state.user.email).toBe('senior@example.com')
  })

  it('clears state after logout', async () => {
    vi.spyOn(authApi, 'logout').mockResolvedValue(undefined)
    authStore.setSession('access-token', { userId: 'user-1', email: 'senior@example.com' })

    await authStore.logout()

    expect(authStore.state.accessToken).toBe('')
    expect(authStore.state.user).toBe(null)
  })
})
