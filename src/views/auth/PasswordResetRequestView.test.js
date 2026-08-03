import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { requestPasswordReset } from '../../api/authApi'
import PasswordResetRequestView from './PasswordResetRequestView.vue'

vi.mock('../../api/authApi', () => ({
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

  it('matches the first-step reset design and links back to the main page', () => {
    const wrapper = mountView()

    expect(wrapper.get('[data-member-header]').text()).toContain('작은둥지')
    expect(wrapper.text()).toContain('STEP 1 · 본인 인증')
    expect(wrapper.text()).toContain('비밀번호 재설정')
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/')
    expect(wrapper.get('input[name="email"]').attributes('type')).toBe('email')
  })

  it('validates email locally before requesting a reset', async () => {
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('invalid-email')
    await wrapper.get('form').trigger('submit')

    expect(requestPasswordReset).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('이메일이 일치하지 않습니다. 다시 확인해주세요.')
  })

  it('shows the same completion message after every accepted request', async () => {
    requestPasswordReset.mockResolvedValue({ message: '가입 여부와 관계없이 입력한 주소로 재설정 안내를 보냈습니다.' })
    const wrapper = mountView()

    await wrapper.get('input[name="email"]').setValue('senior@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(requestPasswordReset).toHaveBeenCalledWith('senior@example.com')
    expect(wrapper.text()).toContain('가입 여부와 관계없이 입력한 주소로 재설정 안내를 보냈습니다.')
  })
})
