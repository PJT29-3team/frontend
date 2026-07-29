import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { completePasswordReset, verifyPasswordReset } from '../api/authApi'
import PasswordResetCompleteView from './PasswordResetCompleteView.vue'

const routeQuery = vi.hoisted(() => ({ token: 'valid-token' }))

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRoute: () => ({ query: routeQuery }),
  }
})

vi.mock('../api/authApi', () => ({
  completePasswordReset: vi.fn(),
  verifyPasswordReset: vi.fn(),
}))

function mountView() {
  return mount(PasswordResetCompleteView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('PasswordResetCompleteView', () => {
  beforeEach(() => {
    routeQuery.token = 'valid-token'
    verifyPasswordReset.mockReset()
    completePasswordReset.mockReset()
  })

  it('verifies the one-time token before showing the password form', async () => {
    verifyPasswordReset.mockResolvedValue({})
    const wrapper = mountView()

    expect(wrapper.text()).toContain('링크를 확인하고 있습니다.')
    await flushPromises()

    expect(verifyPasswordReset).toHaveBeenCalledWith('valid-token')
    expect(wrapper.get('input[name="password"]').exists()).toBe(true)
    expect(wrapper.get('.login-header__wordmark').text()).toBe('작은둥지')
    expect(wrapper.get('.reset-panel').exists()).toBe(true)
    expect(wrapper.find('.reset-card').exists()).toBe(false)
    expect(wrapper.text()).toContain('STEP 2 · 새 비밀번호 설정')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('rejects an expired or already used token', async () => {
    verifyPasswordReset.mockRejectedValue({ response: { data: { message: '유효하지 않거나 만료된 링크입니다.' } } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('유효하지 않거나 만료된 링크입니다.')
    expect(wrapper.find('input[name="password"]').exists()).toBe(false)
    expect(wrapper.findAllComponents(RouterLinkStub).some((link) => link.props('to') === '/password/reset/request')).toBe(true)
  })

  it('shows password policy and matching feedback before enabling submit', async () => {
    verifyPasswordReset.mockResolvedValue({})
    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('input[name="password"]').setValue('weak')
    expect(wrapper.text()).toContain('영문, 숫자, 특수문자를 포함해 8~72자로 입력해주세요.')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.get('input[name="password"]').setValue('NewSenior!23')
    expect(wrapper.text()).toContain('사용 가능한 비밀번호입니다.')
    await wrapper.get('input[name="passwordConfirm"]').setValue('NewSenior!23')
    expect(wrapper.text()).toContain('비밀번호가 일치합니다.')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()

    const passwordToggle = wrapper.get('button[aria-label="비밀번호 표시"]')
    await passwordToggle.trigger('click')
    expect(wrapper.get('input[name="password"]').attributes('type')).toBe('text')
  })

  it('shows the password reuse error returned by the server', async () => {
    verifyPasswordReset.mockResolvedValue({})
    completePasswordReset.mockRejectedValue({
      response: { data: { message: '최근 사용한 비밀번호는 다시 사용할 수 없습니다.' } },
    })
    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('input[name="password"]').setValue('OldSenior!23')
    await wrapper.get('input[name="passwordConfirm"]').setValue('OldSenior!23')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('최근 사용한 비밀번호는 다시 사용할 수 없습니다.')

    await wrapper.get('input[name="password"]').setValue('AnotherSenior!23')
    expect(wrapper.text()).not.toContain('최근 사용한 비밀번호는 다시 사용할 수 없습니다.')
  })

  it('completes the reset once and shows the completion screen', async () => {
    verifyPasswordReset.mockResolvedValue({})
    completePasswordReset.mockResolvedValue({})
    const wrapper = mountView()
    await flushPromises()

    await wrapper.get('input[name="password"]').setValue('NewSenior!23')
    await wrapper.get('input[name="passwordConfirm"]').setValue('NewSenior!23')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(completePasswordReset).toHaveBeenCalledWith('valid-token', 'NewSenior!23', 'NewSenior!23')
    expect(wrapper.text()).toContain('비밀번호가 변경되었습니다')
    expect(wrapper.text()).toContain('새 비밀번호로 로그인해주세요.')
    expect(wrapper.findAllComponents(RouterLinkStub).some((link) => link.props('to') === '/login/email')).toBe(true)
  })
})
