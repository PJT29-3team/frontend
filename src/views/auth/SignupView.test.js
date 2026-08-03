import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../../api/authApi'
import SignupView from './SignupView.vue'

const routerPush = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}))

async function fillValidSignupForm(wrapper) {
  await wrapper.get('input[name="emailLocal"]').setValue('senior')
  await wrapper.get('select[name="emailDomain"]').setValue('example.com')
  await wrapper.get('[data-check-email]').trigger('click')
  await flushPromises()
  await wrapper.get('input[name="password"]').setValue('SeniorHome!23')
  await wrapper.get('input[name="passwordConfirm"]').setValue('SeniorHome!23')
  await wrapper.get('input[name="name"]').setValue('김집현')
  await wrapper.get('input[name="birthDate"]').setValue('1955-06-15')
  await wrapper.get('input[name="phoneNumber"]').setValue('010-1234-5678')
}

function mountView() {
  return mount(SignupView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  })
}

describe('SignupView', () => {
  afterEach(() => {
    routerPush.mockClear()
    vi.restoreAllMocks()
  })

  it('uses the shared signup layout and starts the birth date at 1960 on first focus', async () => {
    const wrapper = mountView()
    const birthDate = wrapper.get('input[name="birthDate"]')

    expect(wrapper.get('.login-header__wordmark').text()).toBe('작은둥지')
    expect(wrapper.find('.auth-card').exists()).toBe(false)
    expect(wrapper.get('.signup-panel').exists()).toBe(true)
    expect(wrapper.get('[data-check-email]').text()).toBe('인증')
    expect(wrapper.get('input[name="phoneNumber"]').exists()).toBe(true)
    expect(birthDate.element.value).toBe('')

    await birthDate.trigger('focus')

    expect(birthDate.element.value).toBe('1960-01-01')
  })

  it('enables signup when all client conditions are satisfied', async () => {
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    const wrapper = mountView()

    await fillValidSignupForm(wrapper)

    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('가입 조건이 충족되었습니다.')
    expect(wrapper.text()).toContain('사용 가능한 이메일입니다.')
  })

  it('keeps signup disabled when the email is already in use', async () => {
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: false,
    })
    const wrapper = mountView()

    await wrapper.get('input[name="emailLocal"]').setValue('senior')
    await wrapper.get('select[name="emailDomain"]').setValue('example.com')
    await wrapper.get('[data-check-email]').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('이미 사용 중인 이메일입니다.')
    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })

  it('shows a signup failure message without navigating away', async () => {
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    vi.spyOn(authApi, 'signup').mockRejectedValue({
      response: {
        data: {
          message: '이미 가입된 이메일입니다.',
        },
      },
    })

    const wrapper = mountView()
    await fillValidSignupForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('이미 가입된 이메일입니다.')
    expect(routerPush).not.toHaveBeenCalled()
  })

  it('submits the selected birth year and phone number to the signup API', async () => {
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    const signupSpy = vi.spyOn(authApi, 'signup').mockResolvedValue({})
    const wrapper = mountView()
    await fillValidSignupForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(signupSpy).toHaveBeenCalledWith({
      email: 'senior@example.com',
      password: 'SeniorHome!23',
      passwordConfirm: 'SeniorHome!23',
      name: '김집현',
      birthYear: 1955,
      phoneNumber: '010-1234-5678',
    })
    expect(routerPush).toHaveBeenCalledWith('/login')
  })

  it('uses a calendar input and rejects future dates', async () => {
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    const wrapper = mountView()

    expect(wrapper.get('input[name="birthDate"]').attributes('type')).toBe('date')
    expect(wrapper.get('input[name="birthDate"]').attributes('min')).toBe('1900-01-01')

    await wrapper.get('input[name="emailLocal"]').setValue('senior')
    await wrapper.get('select[name="emailDomain"]').setValue('example.com')
    await wrapper.get('[data-check-email]').trigger('click')
    await flushPromises()
    await wrapper.get('input[name="password"]').setValue('SeniorHome!23')
    await wrapper.get('input[name="passwordConfirm"]').setValue('SeniorHome!23')
    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('input[name="birthDate"]').setValue('2200-01-01')
    await wrapper.get('input[name="phoneNumber"]').setValue('010-1234-5678')

    expect(wrapper.get('button[type="submit"]').attributes('disabled')).toBeDefined()
  })
})
