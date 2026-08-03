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
    expect(wrapper.get('[data-member-header]').text()).toContain('작은둥지')
    expect(wrapper.get('input[name="password"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('STEP 2 · 새 비밀번호 설정')
  })

  it('rejects an expired or already used token', async () => {
    verifyPasswordReset.mockRejectedValue({ response: { data: { message: '유효하지 않거나 만료된 링크입니다.' } } })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('유효하지 않거나 만료된 링크입니다.')
    expect(wrapper.find('input[name="password"]').exists()).toBe(false)
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/password/reset/request')
  })

  it('requires a strong matching password and completes the reset once', async () => {
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
    expect(wrapper.text()).toContain('로그인으로 돌아가기')
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/login/email')
  })
})
