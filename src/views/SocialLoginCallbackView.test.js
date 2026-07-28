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

  it('shows a clear message and does not refresh when the OAuth state is invalid', async () => {
    routeQuery.value = { error: 'invalid_state' }
    const refresh = vi.spyOn(authStore, 'refresh')

    const wrapper = mount(SocialLoginCallbackView, {
      global: {
        stubs: ['RouterLink'],
      },
    })
    await flushPromises()

    expect(refresh).not.toHaveBeenCalled()
    expect(routerReplace).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('로그인 시간이 지났습니다')
    expect(wrapper.text()).toContain('다시 로그인해 주세요')
  })

  it('guides an existing email member to use email login', async () => {
    routeQuery.value = { error: 'account_conflict' }
    const refresh = vi.spyOn(authStore, 'refresh')

    const wrapper = mount(SocialLoginCallbackView, {
      global: {
        stubs: ['RouterLink'],
      },
    })
    await flushPromises()

    expect(refresh).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('이미 이메일로 가입된 계정입니다')
  })
})
