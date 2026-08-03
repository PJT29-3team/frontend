import { afterEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import { http } from './http'

describe('HTTP authentication retry', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not retry the refresh request when refresh authentication fails', async () => {
    const refreshSpy = vi.spyOn(authStore, 'refresh').mockRejectedValue(new Error('refresh failed'))
    const error = {
      config: { url: '/api/auth/refresh', headers: {} },
      response: { status: 401 },
    }

    await expect(Promise.reject(error).catch(http.interceptors.response.handlers[0].rejected))
      .rejects.toBe(error)
    expect(refreshSpy).not.toHaveBeenCalled()
  })
})
