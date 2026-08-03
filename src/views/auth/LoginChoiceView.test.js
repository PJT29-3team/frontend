import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LoginChoiceView from './LoginChoiceView.vue'

describe('LoginChoiceView', () => {
  it('shows the Kakao image button and email login entry', () => {
    const wrapper = mount(LoginChoiceView, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    expect(wrapper.text()).toContain('이메일로 로그인')
    expect(wrapper.text()).toContain('비밀번호 찾기')
    expect(wrapper.text()).toContain('회원가입')

    const kakaoButton = wrapper.get('[data-social-provider="kakao"]')
    expect(kakaoButton.attributes('href')).toContain('/api/auth/social/kakao')
    expect(kakaoButton.get('img').attributes('src')).toContain('kakao-login-medium-wide')
    expect(kakaoButton.get('img').attributes('alt')).toBe('카카오 로그인')
    expect(wrapper.find('[data-social-provider="naver"]').exists()).toBe(false)
  })

  it('shows the small nest header and footer links', () => {
    const wrapper = mount(LoginChoiceView)

    expect(wrapper.get('[data-login-header]').text()).toContain('작은둥지')
    expect(wrapper.get('[data-login-footer]').text()).toContain('이용약관')
    expect(wrapper.get('[data-login-footer]').text()).toContain('개인정보처리방침')
  })
})
