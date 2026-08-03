import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestPasswordReset } from '@/api/authApi'
import PasswordResetRequestView from './PasswordResetRequestView.vue'

vi.mock('@/api/authApi', () => ({
  requestPasswordReset: vi.fn(),
}))

function mountView() {
  return mount(PasswordResetRequestView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('PasswordResetRequestView', () => {
  beforeEach(() => {
    requestPasswordReset.mockReset()
  })

  it('matches the first-step reset design and links back to email login', () => {
    const wrapper = mountView()

    expect(wrapper.get('.login-header__wordmark').text()).toBe('작은둥지')
    expect(wrapper.get('.reset-panel').exists()).toBe(true)
    expect(wrapper.find('.reset-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('STEP 1 · 이메일 인증')
    expect(wrapper.text()).toContain('비밀번호 재설정')
    expect(wrapper.text()).toContain('가입한 이메일 주소를 입력해주세요.')
    const emailLoginLink = wrapper.findAllComponents(RouterLinkStub)
      .find((link) => link.props('to') === '/login/email')
    expect(emailLoginLink.exists()).toBe(true)
    expect(emailLoginLink.text()).toBe('이메일 로그인')
    expect(wrapper.get('input[name="email"]').attributes('type')).toBe('email')
    expect(wrapper.get('input[name="email"]').attributes('placeholder')).toBe('example@gmail.com')
  })

  it('validates email locally before requesting a reset', async () => {
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('invalid-email')
    await wrapper.get('form').trigger('submit')

    expect(requestPasswordReset).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('올바른 이메일 주소를 입력해주세요.')
  })

  it('shows a concise completion message after a reset mail is requested', async () => {
    requestPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('senior@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(requestPasswordReset).toHaveBeenCalledWith('senior@example.com')
    expect(wrapper.get('.feedback .success').text()).toBe('비밀번호 재설정 메일을 보냈습니다.')
  })

  it('shows a missing email response as an error', async () => {
    requestPasswordReset.mockRejectedValue({
      response: {
        data: {
          message: '가입되지 않은 이메일입니다.',
        },
      },
    })
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('missing@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('.feedback .danger').text()).toBe('가입되지 않은 이메일입니다.')
  })
})
