import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authStore } from '../stores/authStore'
import SocialProfileCompletionView from './SocialProfileCompletionView.vue'

const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useRouter: () => ({ replace: routerReplace }),
  }
})

describe('SocialProfileCompletionView', () => {
  beforeEach(() => {
    routerReplace.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountView() {
    return mount(SocialProfileCompletionView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
      },
    })
  }

  it('matches the social signup layout and starts the birth date at 1960 on first focus', async () => {
    const wrapper = mountView()
    const birthDate = wrapper.get('input[name="birthDate"]')

    expect(wrapper.get('.login-header__wordmark').text()).toBe('작은둥지')
    expect(wrapper.find('.login-header__nav').exists()).toBe(false)
    expect(wrapper.find('.social-profile-card').exists()).toBe(false)
    expect(wrapper.get('.social-profile-panel').exists()).toBe(true)
    expect(wrapper.get('h1').text()).toBe('몇 가지만 더 확인할게요')
    expect(wrapper.get('input[name="name"]').attributes('placeholder')).toBe('이름을 입력해주세요.')
    expect(wrapper.get('label[for="social-birth-date"]').text()).toBe('나이')
    expect(wrapper.get('button[type="submit"]').text()).toBe('다음')
    expect(birthDate.attributes('type')).toBe('date')
    expect(birthDate.element.value).toBe('')

    await birthDate.trigger('focus')

    expect(birthDate.element.value).toBe('1960-01-01')
  })

  it('collects the missing name and birth date then enters the main screen', async () => {
    vi.spyOn(authStore, 'completeSocialProfile').mockResolvedValue({})
    const wrapper = mountView()

    expect(wrapper.text()).toContain('몇 가지만 더 확인할게요')
    expect(wrapper.get('input[name="birthDate"]').attributes('type')).toBe('date')

    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('input[name="birthDate"]').setValue('1955-04-12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(authStore.completeSocialProfile).toHaveBeenCalledWith('김집현', 1955)
    expect(routerReplace).toHaveBeenCalledWith('/main')
  })

  it('shows the server error and stays on the profile screen when saving fails', async () => {
    vi.spyOn(authStore, 'completeSocialProfile').mockRejectedValue({
      response: {
        data: {
          message: '추가 정보를 저장할 수 없습니다.',
        },
      },
    })
    const wrapper = mountView()

    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('input[name="birthDate"]').setValue('1955-04-12')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('추가 정보를 저장할 수 없습니다.')
    expect(routerReplace).not.toHaveBeenCalled()
  })
})
