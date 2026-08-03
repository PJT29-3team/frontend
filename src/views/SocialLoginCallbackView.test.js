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

  it.each([
    ['configuration_error', '카카오 로그인 설정을 확인해주세요.'],
    ['access_denied', '카카오 로그인이 취소되었습니다.'],
    ['invalid_state', '로그인 요청이 만료되었습니다. 다시 시도해주세요.'],
    ['email_required', '카카오계정 이메일 제공 동의가 필요합니다.'],
    ['account_conflict', '이미 가입된 이메일입니다. 이메일로 로그인해주세요.'],
    ['provider_error', '카카오 로그인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'],
  ])('shows the message for %s without refreshing the session', async (code, message) => {
    routeQuery.value = { error: code }
    const refresh = vi.spyOn(authStore, 'refresh').mockResolvedValue({})

    const wrapper = mount(SocialLoginCallbackView, {
      global: { stubs: ['RouterLink'] },
    })
    await flushPromises()

    expect(refresh).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain(message)
  })
})
