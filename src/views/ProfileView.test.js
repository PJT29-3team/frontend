import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProfileView from './ProfileView.vue'
import { authStore } from '../stores/authStore'
import { getMe, requestDeletion } from '../api/authApi'

const replace = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({ replace }),
}))

vi.mock('../api/authApi', () => ({
  getMe: vi.fn(),
  logoutAll: vi.fn(),
  requestDeletion: vi.fn(),
  updateMe: vi.fn(),
}))

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getMe.mockResolvedValue({ name: '홍길동', birthYear: 1950 })
    requestDeletion.mockResolvedValue({ message: '회원탈퇴가 완료되었습니다.' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'prompt').mockReturnValue('SeniorHome!23')
    authStore.setSession('access-token', { userId: 1 })
  })

  it('immediately deletes the account and clears the local session', async () => {
    const wrapper = mount(ProfileView)
    await vi.waitFor(() => expect(getMe).toHaveBeenCalled())

    expect(wrapper.text()).not.toContain('탈퇴 취소')
    await wrapper.get('.danger-button').trigger('click')

    expect(requestDeletion).toHaveBeenCalledWith('SeniorHome!23')
    expect(authStore.state.accessToken).toBe('')
    expect(replace).toHaveBeenCalledWith('/')
  })
})
