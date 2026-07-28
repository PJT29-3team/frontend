import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import SocialLoginCallbackView from './SocialLoginCallbackView.vue'

const routerReplace = vi.hoisted(() => vi.fn())
const routeQuery = vi.hoisted(() => ({ value: {} }))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ replace: routerReplace }),
    useRoute: () => ({ query: routeQuery.value }),
  }
})

describe('SocialLoginCallbackView', () => {
  beforeEach(() => {
    routerReplace.mockReset()
    routeQuery.value = {}
    vi.restoreAllMocks()
  })

  it('restores the server social session and enters the main screen', async () => {
    vi.spyOn(authStore, 'refresh').mockResolvedValue({})

    mount(SocialLoginCallbackView)
    await flushPromises()

    expect(authStore.refresh).toHaveBeenCalled()
    expect(routerReplace).toHaveBeenCalledWith('/main')
  })

  it('routes first-time social users to the profile completion screen', async () => {
    routeQuery.value = { profileRequired: 'true' }
    const refresh = vi.spyOn(authStore, 'refresh')

    mount(SocialLoginCallbackView)
    await flushPromises()

    expect(refresh).not.toHaveBeenCalled()
    expect(routerReplace).toHaveBeenCalledWith('/social/profile')
  })
})
