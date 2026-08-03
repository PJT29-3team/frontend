import { beforeEach, describe, expect, it } from 'vitest'
import { authStore, resetAuthStoreForTest } from '../stores/authStore'
import router, { requireAuthentication } from './index'

describe('authenticated route guard', () => {
  beforeEach(() => {
    resetAuthStoreForTest()
  })

  it('redirects unauthenticated users to login', () => {
    expect(requireAuthentication({ meta: { requiresAuth: true }, fullPath: '/main' })).toEqual({
      path: '/login',
      query: { redirect: '/main' },
    })
  })

  it('allows authenticated users to enter the main screen', () => {
    authStore.setSession('access-token', { userId: 'user-1' })

    expect(requireAuthentication({ meta: { requiresAuth: true }, fullPath: '/main' })).toBe(true)
  })

  it('keeps landing and member routes without report sharing', () => {
    const paths = router.getRoutes().map((route) => route.path)

    expect(paths).toEqual(expect.arrayContaining([
      '/',
      '/main',
      '/login',
      '/login/email',
      '/signup',
      '/auth/email/verify',
      '/password/reset/request',
      '/auth/password/reset',
      '/auth/social/callback',
      '/me',
      '/social/profile',
    ]))
    expect(paths).not.toContain('/share-preview')
    expect(paths).not.toContain('/social/link')
  })
})
