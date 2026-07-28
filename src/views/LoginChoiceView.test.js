import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LoginChoiceView from './LoginChoiceView.vue'

describe('LoginChoiceView', () => {
  it('shows social buttons and email login entry', () => {
    const wrapper = mount(LoginChoiceView, {
      global: {
        stubs: ['RouterLink'],
      },
    })

    expect(wrapper.text()).toContain('카카오 로그인')
    expect(wrapper.text()).toContain('네이버 로그인')
    expect(wrapper.text()).toContain('이메일로 로그인')
    expect(wrapper.text()).toContain('비밀번호 찾기')
    expect(wrapper.text()).toContain('회원가입')
    expect(wrapper.get('[data-social-provider="kakao"]').attributes('href')).toContain('/api/auth/social/kakao')
    expect(wrapper.get('[data-social-provider="naver"]').attributes('href')).toContain('/api/auth/social/naver')
  })
})
