import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import SocialAccountLinkView from './SocialAccountLinkView.vue'

const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: routerReplace,
  }),
}))

function mountView() {
  return mount(SocialAccountLinkView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('SocialAccountLinkView', () => {
  afterEach(() => {
    routerReplace.mockReset()
    vi.restoreAllMocks()
  })

  it('submits only the existing password and enters the main screen', async () => {
    const link = vi.spyOn(authStore, 'linkKakaoAccount').mockResolvedValue({})
    const wrapper = mountView()

    await wrapper.get('input[name="password"]').setValue('Password1!')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(link).toHaveBeenCalledWith('Password1!')
    expect(routerReplace).toHaveBeenCalledWith('/main')
  })

  it('shows a clear password error in a live region and allows another attempt', async () => {
    vi.spyOn(authStore, 'linkKakaoAccount').mockRejectedValue({
      response: { data: { message: '비밀번호를 다시 확인해주세요.' } },
    })
    const wrapper = mountView()

    await wrapper.get('input[name="password"]').setValue('wrong')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[aria-live="polite"]').text()).toContain('비밀번호를 다시 확인해주세요.')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    expect(routerReplace).not.toHaveBeenCalled()
  })

  it('does not send a second request while account linking is in progress', async () => {
    let resolveLink
    const link = vi.spyOn(authStore, 'linkKakaoAccount').mockImplementation(() => new Promise((resolve) => {
      resolveLink = resolve
    }))
    const wrapper = mountView()

    await wrapper.get('input[name="password"]').setValue('Password1!')
    await wrapper.get('form').trigger('submit')
    await wrapper.get('form').trigger('submit')

    expect(link).toHaveBeenCalledTimes(1)

    resolveLink({})
    await flushPromises()
  })

  it('provides an accessible password field, visibility control, and login return link', async () => {
    const wrapper = mountView()
    const passwordInput = wrapper.get('input[name="password"]')

    expect(passwordInput.attributes('type')).toBe('password')
    expect(passwordInput.attributes('autocomplete')).toBe('current-password')
    expect(wrapper.get('button[type="button"]').attributes('aria-label')).toBe('비밀번호 표시')
    expect(wrapper.get('button[type="submit"]').text()).toBe('계정 연결하고 로그인')
    expect(wrapper.getComponent(RouterLinkStub).props('to')).toBe('/login')

    await wrapper.get('button[type="button"]').trigger('click')

    expect(passwordInput.attributes('type')).toBe('text')
  })
})
