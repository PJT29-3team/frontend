import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resendVerification } from '@/api/authApi'
import { authStore } from '@/stores/authStore'
import EmailLoginView from './EmailLoginView.vue'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('@/api/authApi', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    resendVerification: vi.fn(),
  }
})

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({
      push: routerPush,
    }),
  }
})

function mountView() {
  return mount(EmailLoginView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('EmailLoginView', () => {
  beforeEach(() => {
    resendVerification.mockReset()
    const values = new Map()
    vi.stubGlobal('localStorage', {
      clear: () => values.clear(),
      getItem: (key) => values.get(key) ?? null,
      removeItem: (key) => values.delete(key),
      setItem: (key, value) => values.set(key, String(value)),
    })
  })

  afterEach(() => {
    localStorage.clear()
    routerPush.mockClear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('matches the reference controls and toggles password visibility', async () => {
    const wrapper = mountView()

    expect(wrapper.get('input[name="email"]').attributes('placeholder')).toBe('이메일을 입력하세요')
    expect(wrapper.get('input[name="saveEmail"]').exists()).toBe(true)
    expect(wrapper.get('input[name="autoLogin"]').exists()).toBe(true)
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('password')
    expect(wrapper.get('.login-header__wordmark').text()).toBe('작은둥지')
    expect(wrapper.get('.login-header__wordmark-accent').text()).toBe('둥지')
    expect(wrapper.get('.login-header__logo').attributes('src')).toContain('jiphyeonjeon-header-logo.png')
    expect(wrapper.find('.email-login-card').exists()).toBe(false)
    expect(wrapper.find('.login-heading img').exists()).toBe(false)
    expect(wrapper.get('.email-login-panel').exists()).toBe(true)
    expect(wrapper.get('.login-footer').text()).toContain('이용약관')

    await wrapper.get('button[aria-label="비밀번호 표시"]').trigger('click')

    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('text')
    expect(wrapper.get('button[aria-label="비밀번호 숨기기"]').exists()).toBe(true)
  })

  it('stores only the email after a successful saved-email login', async () => {
    vi.spyOn(authStore, 'login').mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('senior@example.com')
    await wrapper.get('input[name="password"]').setValue('Secret!23')
    await wrapper.get('input[name="saveEmail"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authStore.login).toHaveBeenCalledWith('senior@example.com', 'Secret!23')
    expect(localStorage.getItem('jh_saved_email')).toBe('senior@example.com')
    expect(localStorage.getItem('password')).toBeNull()
    expect(routerPush).toHaveBeenCalledWith('/survey')
  })

  it('loads the saved email and keeps login errors on the page', async () => {
    localStorage.setItem('jh_saved_email', 'saved@example.com')
    vi.spyOn(authStore, 'login').mockRejectedValue({
      response: { data: { message: '로그인 정보가 올바르지 않습니다.' } },
    })

    const wrapper = mountView()

    expect(wrapper.get('input[name="email"]').element.value).toBe('saved@example.com')
    expect(wrapper.get('input[name="saveEmail"]').element.checked).toBe(true)

    await wrapper.get('input[name="password"]').setValue('WrongPassword!23')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('로그인 정보가 올바르지 않습니다.')
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('offers a verification email resend only for a pending account', async () => {
    vi.spyOn(authStore, 'login').mockRejectedValue({
      response: { data: { message: '회원가입 후 최초 1회 이메일 인증이 필요합니다.' } },
    })
    resendVerification.mockResolvedValue({ message: '인증 메일을 다시 보냈습니다.' })
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('pending@example.com')
    await wrapper.get('input[name="password"]').setValue('Secret!23')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const resendButton = wrapper.get('[data-resend-verification]')
    await resendButton.trigger('click')
    await flushPromises()

    expect(resendVerification).toHaveBeenCalledWith('pending@example.com')
    expect(wrapper.text()).toContain('인증 메일을 다시 보냈습니다.')
    expect(routerPush).not.toHaveBeenCalled()
  })
})
