import { afterEach, describe, expect, it, vi } from 'vitest'
import { http } from './http'
import { linkKakaoAccount } from './authApi'

describe('linkKakaoAccount', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends only the password and device name to the Kakao account linking API', async () => {
    const response = { accessToken: 'access-token', user: { userId: 'user-1' } }
    const post = vi.spyOn(http, 'post').mockResolvedValue({ data: response })

    await expect(linkKakaoAccount('Password1!', 'Chrome')).resolves.toEqual(response)

    expect(post).toHaveBeenCalledOnce()
    expect(post).toHaveBeenCalledWith('/api/auth/social/kakao/link', {
      password: 'Password1!',
      deviceName: 'Chrome',
    })
  })
})
