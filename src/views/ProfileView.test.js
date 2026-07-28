import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { changePassword, getMe } from '../api/authApi'
import { authStore } from '../stores/authStore'
import ProfileView from './ProfileView.vue'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPush }),
}))

vi.mock('../api/authApi', () => ({
  cancelDeletion: vi.fn(),
  changePassword: vi.fn(),
  getMe: vi.fn(),
  logoutAll: vi.fn(),
  requestDeletion: vi.fn(),
  updateMe: vi.fn(),
}))

describe('ProfileView password change', () => {
  beforeEach(() => {
    routerPush.mockReset()
    getMe.mockReset()
    changePassword.mockReset()
    getMe.mockResolvedValue({ name: '김작은', birthYear: 1960 })
  })

  it('requires a strong matching new password', async () => {
    const wrapper = mount(ProfileView)
    await flushPromises()

    await wrapper.get('input[name="currentPassword"]').setValue('Current!23')
    await wrapper.get('input[name="newPassword"]').setValue('weak')
    await wrapper.get('input[name="newPasswordConfirm"]').setValue('weak')

    expect(wrapper.text()).toContain('영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요.')
    expect(wrapper.get('[data-change-password]').attributes('disabled')).toBeDefined()
  })

  it('changes the password, clears the session, and returns to login', async () => {
    changePassword.mockResolvedValue({ message: '비밀번호가 변경되었습니다.' })
    const clearSession = vi.spyOn(authStore, 'clearSession')
    const wrapper = mount(ProfileView)
    await flushPromises()

    await wrapper.get('input[name="currentPassword"]').setValue('Current!23')
    await wrapper.get('input[name="newPassword"]').setValue('NewSenior!23')
    await wrapper.get('input[name="newPasswordConfirm"]').setValue('NewSenior!23')
    await wrapper.get('[data-password-form]').trigger('submit')
    await flushPromises()

    expect(changePassword).toHaveBeenCalledWith('Current!23', 'NewSenior!23', 'NewSenior!23')
    expect(clearSession).toHaveBeenCalled()
    expect(routerPush).toHaveBeenCalledWith('/login/email')
  })

  it('shows a recent-password reuse error returned by the server', async () => {
    changePassword.mockRejectedValue({
      response: { data: { message: '최근 사용한 비밀번호는 다시 사용할 수 없습니다.' } },
    })
    const wrapper = mount(ProfileView)
    await flushPromises()

    await wrapper.get('input[name="currentPassword"]').setValue('Current!23')
    await wrapper.get('input[name="newPassword"]').setValue('OldSenior!23')
    await wrapper.get('input[name="newPasswordConfirm"]').setValue('OldSenior!23')
    await wrapper.get('[data-password-form]').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('최근 사용한 비밀번호는 다시 사용할 수 없습니다.')
  })
})
