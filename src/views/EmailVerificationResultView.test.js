import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { verifyEmail } from '../api/authApi'
import EmailVerificationResultView from './EmailVerificationResultView.vue'

const SIGNUP_VERIFICATION_KEY = 'jh_signup_verification'

vi.mock('vue-router', () => ({
  useRoute: () => ({ query: { token: 'email-token' } }),
}))

vi.mock('../api/authApi', () => ({
  verifyEmail: vi.fn(),
}))

describe('EmailVerificationResultView', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  it('stores signup proof and guides the user to profile input', async () => {
    verifyEmail.mockResolvedValue({
      email: 'senior@example.com',
      signupCompletionToken: 'completion-token',
      message: '이메일 인증이 완료되었습니다.',
    })
    const wrapper = mount(EmailVerificationResultView, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :data-to="to"><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    expect(JSON.parse(sessionStorage.getItem(SIGNUP_VERIFICATION_KEY))).toEqual({
      email: 'senior@example.com',
      signupCompletionToken: 'completion-token',
    })
    expect(wrapper.get('[data-member-header]').text()).toContain('작은둥지')
    expect(wrapper.text()).toContain('회원정보 입력하기')
    expect(wrapper.get('.primary-link').attributes('data-to')).toBe('/signup')
  })
})
