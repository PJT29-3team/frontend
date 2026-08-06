import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '../../api/authApi'
import SignupView from './SignupView.vue'

const routerPush = vi.hoisted(() => vi.fn())
const SIGNUP_VERIFICATION_KEY = 'jh_signup_verification'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: routerPush,
  }),
}))

async function fillVerifiedSignupForm(wrapper) {
  await wrapper.get('input[name="password"]').setValue('SeniorHome!23')
  await wrapper.get('input[name="passwordConfirm"]').setValue('SeniorHome!23')
  await wrapper.get('input[name="name"]').setValue('김집현')
  await wrapper.get('[data-birth-year-toggle]').trigger('click')
  await wrapper.get('[data-previous-decade]').trigger('click')
  await wrapper.get('[data-birth-year="1955"]').trigger('click')
  await wrapper.get('input[name="phoneNumber"]').setValue('010-1234-5678')
}

describe('SignupView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
    routerPush.mockClear()
    vi.restoreAllMocks()
  })

  it('shows the full form and requests email verification inline', async () => {
    const signupSpy = vi.spyOn(authApi, 'signup')
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    const requestVerification = vi.spyOn(authApi, 'requestSignupEmailVerification').mockResolvedValue({
      email: 'senior@example.com',
      verified: false,
      message: '인증 메일을 보냈습니다.',
    })
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    expect(wrapper.get('input[name="password"]').exists()).toBe(true)
    expect(wrapper.get('[data-member-header]').text()).toContain('홀家분')
    await wrapper.get('input[name="emailLocal"]').setValue('senior')
    await wrapper.get('select[name="emailDomain"]').setValue('example.com')
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.get('[data-request-verification]').trigger('click')
    await flushPromises()

    expect(requestVerification).toHaveBeenCalledWith('senior@example.com')
    expect(wrapper.text()).toContain('인증 메일을 보냈습니다.')
    await wrapper.get('form').trigger('submit')
    expect(signupSpy).not.toHaveBeenCalled()
  })

  it('shows the sent message immediately while the email request is pending', async () => {
    let resolveVerification
    vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: true,
    })
    vi.spyOn(authApi, 'requestSignupEmailVerification').mockReturnValue(new Promise((resolve) => {
      resolveVerification = resolve
    }))
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    await wrapper.get('input[name="emailLocal"]').setValue('senior')
    await wrapper.get('select[name="emailDomain"]').setValue('example.com')
    await vi.runAllTimersAsync()
    await flushPromises()
    await wrapper.get('[data-request-verification]').trigger('click')

    expect(wrapper.text()).toContain('인증 메일을 보냈습니다.')

    resolveVerification({
      email: 'senior@example.com',
      verified: false,
      message: '인증 메일을 보냈습니다.',
    })
    await flushPromises()
  })

  it('keeps verification disabled when the email is already registered', async () => {
    const availability = vi.spyOn(authApi, 'checkEmailAvailability').mockResolvedValue({
      email: 'senior@example.com',
      available: false,
    })
    const requestVerification = vi.spyOn(authApi, 'requestSignupEmailVerification')
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    await wrapper.get('input[name="emailLocal"]').setValue('senior')
    await wrapper.get('select[name="emailDomain"]').setValue('example.com')
    await vi.runAllTimersAsync()
    await flushPromises()

    expect(availability).toHaveBeenCalledWith('senior@example.com')
    expect(wrapper.text()).toContain('이미 가입된 이메일입니다.')
    expect(wrapper.get('[data-request-verification]').attributes('disabled')).toBeDefined()
    expect(requestVerification).not.toHaveBeenCalled()
  })

  it('submits verified email, phone number, and completion token', async () => {
    sessionStorage.setItem(SIGNUP_VERIFICATION_KEY, JSON.stringify({
      email: 'senior@example.com',
      signupCompletionToken: 'completion-token',
    }))
    const signupSpy = vi.spyOn(authApi, 'signup').mockResolvedValue({})
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })
    await fillVerifiedSignupForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(signupSpy).toHaveBeenCalledWith({
      email: 'senior@example.com',
      password: 'SeniorHome!23',
      passwordConfirm: 'SeniorHome!23',
      name: '김집현',
      birthYear: 1955,
      phoneNumber: '010-1234-5678',
      signupCompletionToken: 'completion-token',
    })
    expect(sessionStorage.getItem(SIGNUP_VERIFICATION_KEY)).toBeNull()
    expect(routerPush).toHaveBeenCalledWith('/login/email')
  })

  it('opens the year picker at the 1960s and selects a year without typing', async () => {
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    const birthYearInput = wrapper.get('input[name="birthYear"]')
    expect(birthYearInput.attributes('readonly')).toBeDefined()
    expect(birthYearInput.element.value).toBe('')
    expect(birthYearInput.attributes('placeholder')).toBe('출생연도를 선택해주세요')

    await wrapper.get('[data-birth-year-toggle]').trigger('click')

    expect(wrapper.text()).toContain('1960년대')
    expect(wrapper.find('[data-birth-year="1960"]').exists()).toBe(true)
    expect(wrapper.find('[data-birth-year="1969"]').exists()).toBe(true)

    await wrapper.get('[data-birth-year="1965"]').trigger('click')

    expect(birthYearInput.element.value).toBe('1965년')
    expect(wrapper.find('[data-year-picker]').exists()).toBe(false)
  })

  it('formats a mobile phone number while typing', async () => {
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    const phoneInput = wrapper.get('input[name="phoneNumber"]')
    await phoneInput.setValue('01012345678')

    expect(phoneInput.element.value).toBe('010-1234-5678')
  })

  it('requires a birth year selection in the verified profile form', async () => {
    sessionStorage.setItem(SIGNUP_VERIFICATION_KEY, JSON.stringify({
      email: 'senior@example.com',
      signupCompletionToken: 'completion-token',
    }))
    const signupSpy = vi.spyOn(authApi, 'signup')
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })

    await wrapper.get('input[name="password"]').setValue('SeniorHome!23')
    await wrapper.get('input[name="passwordConfirm"]').setValue('SeniorHome!23')
    await wrapper.get('input[name="name"]').setValue('김집현')
    await wrapper.get('input[name="phoneNumber"]').setValue('010-1234-5678')
    await wrapper.get('form').trigger('submit')

    expect(signupSpy).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('출생연도를 확인해주세요.')
  })

  it('keeps verification proof when signup fails', async () => {
    sessionStorage.setItem(SIGNUP_VERIFICATION_KEY, JSON.stringify({
      email: 'senior@example.com',
      signupCompletionToken: 'completion-token',
    }))
    vi.spyOn(authApi, 'signup').mockRejectedValue({
      response: { data: { message: '회원가입을 완료하지 못했습니다.' } },
    })
    const wrapper = mount(SignupView, {
      global: { stubs: ['RouterLink'] },
    })
    await fillVerifiedSignupForm(wrapper)

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('회원가입을 완료하지 못했습니다.')
    expect(sessionStorage.getItem(SIGNUP_VERIFICATION_KEY)).not.toBeNull()
    expect(routerPush).not.toHaveBeenCalled()
  })
})
